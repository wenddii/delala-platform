/**
 * AddProperty.jsx
 *
 * Creates/edits a Property + Listing on the backend.
 *
 * NOTE — backend image storage:
 *   image_url is a URLField (no binary upload endpoint yet).
 *   Property photos and documents are stored locally in component state and
 *   shown as previews. URL submission is used where the backend supports it.
 *   When the backend adds multipart upload, swap addPropertyImage calls here.
 *
 * Flow for a new property:
 *  1. POST /api/properties/properties/   → creates the Property record
 *  2. POST /api/properties/images/       → attaches primary image (URL for now)
 *  3. POST /api/properties/listings/     → creates the Listing record
 *  4. Navigate to /list-property
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Plus, X, ImageIcon, FileText } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  createProperty, updateProperty, getProperty,
  addPropertyImage, addPropertyDocument, createListing,
  getPropertyTypes, getLocations,
} from '../services/propertyService.js'
import { parseDRFError } from '../services/api.js'
import { uploadManyToImgBB } from '../utils/imageUpload.js'

const uid = () => crypto.randomUUID()

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inp = { display:'block', width:'100%', padding:'10px 14px', fontSize:14, lineHeight:'1.5', color:'#111827', background:'#F0F8FF', border:'1.5px solid #B3D9F5', borderRadius:10, outline:'none', boxSizing:'border-box', transition:'border-color 0.15s, box-shadow 0.15s' }
const f = (e) => { e.target.style.borderColor='#01579B'; e.target.style.boxShadow='0 0 0 3px rgba(1,87,155,0.15)' }
const b = (e) => { e.target.style.borderColor='#B3D9F5'; e.target.style.boxShadow='none' }

function Section({ title }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0 18px' }}>
      <span style={{ fontSize:12, fontWeight:700, color:'#01579B', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{title}</span>
      <div style={{ flex:1, height:1, background:'#B3D9F5' }} />
    </div>
  )
}

const EMPTY = {
  title:'', propertyType:'', bedrooms:'', bathrooms:'', size:'', priceRaw:'',
  description:'', city:'addis-ababa', subCity:'', woreda:'',
  street:'', landmark:'', listing:'sale',
}

// ── Allowed file types ────────────────────────────────────────────────────────
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_DOC_TYPES   = ['application/pdf', 'image/jpeg', 'image/png']
const PHOTO_ACCEPT = ALLOWED_PHOTO_TYPES.join(',')
const DOC_ACCEPT   = ALLOWED_DOC_TYPES.join(',')

const MIME_LABEL = {
  'image/jpeg':      'JPG',
  'image/png':       'PNG',
  'image/webp':      'WebP',
  'application/pdf': 'PDF',
}
function fmtAllowed(types) {
  return types.map(t => MIME_LABEL[t]).join(', ')
}
function fmtSize(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Multi-image uploader ──────────────────────────────────────────────────────
// Lets users add multiple photos with drag-and-drop or click.
// First image is automatically the primary / cover photo.
// No camera capture (capture attribute intentionally omitted).
function PhotoUploader({ files, onChange }) {
  const inputRef  = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [typeErr,  setTypeErr]  = useState('')

  const addFiles = (incoming) => {
    const valid = [], invalid = []
    Array.from(incoming).forEach(f => {
      ALLOWED_PHOTO_TYPES.includes(f.type) ? valid.push(f) : invalid.push(f.name)
    })
    if (invalid.length) {
      setTypeErr(`Rejected: ${invalid.join(', ')} — only ${fmtAllowed(ALLOWED_PHOTO_TYPES)} allowed.`)
    } else {
      setTypeErr('')
    }
    if (valid.length) onChange([...files, ...valid])
  }

  const remove = (idx) => onChange(files.filter((_, i) => i !== idx))
  const setPrimary = (idx) => {
    const next = [...files]
    const [picked] = next.splice(idx, 1)
    onChange([picked, ...next])
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        style={{
          border: `2px dashed ${dragOver ? '#01579B' : typeErr ? '#FCA5A5' : '#B3D9F5'}`,
          borderRadius: 14, padding: '28px 16px', textAlign: 'center',
          cursor: 'pointer', background: dragOver ? '#EBF5FB' : '#F0F8FF',
          transition: 'all 0.15s', marginBottom: 8,
        }}
      >
        <ImageIcon size={28} style={{ color: '#B3D9F5', margin: '0 auto 10px', display: 'block' }} />
        <p style={{ fontSize: 13, color: '#546E7A', margin: '0 0 4px', fontWeight: 600 }}>
          Click to browse or drag photos here
        </p>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
          Accepted: {fmtAllowed(ALLOWED_PHOTO_TYPES)} · You can add multiple photos
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={PHOTO_ACCEPT}
          multiple
          style={{ display: 'none' }}
          onChange={e => addFiles(e.target.files)}
        />
      </div>

      {typeErr && (
        <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          ⚠ {typeErr}
        </p>
      )}

      {/* Previews */}
      {files.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 6 }}>
          {files.map((f, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: i === 0 ? '2.5px solid #01579B' : '1.5px solid #B3D9F5', background: '#F0F8FF' }}>
              <img
                src={URL.createObjectURL(f)}
                alt={f.name}
                style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
              />
              {/* Cover badge */}
              {i === 0 && (
                <span style={{ position: 'absolute', top: 5, left: 5, padding: '2px 7px', background: '#01579B', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 20 }}>
                  Cover
                </span>
              )}
              {/* Set as cover */}
              {i > 0 && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setPrimary(i) }}
                  title="Set as cover photo"
                  style={{ position: 'absolute', top: 5, left: 5, padding: '2px 7px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontWeight: 600, borderRadius: 20, border: 'none', cursor: 'pointer' }}
                >
                  Set cover
                </button>
              )}
              {/* Remove */}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); remove(i) }}
                title="Remove"
                style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <X size={13} />
              </button>
              {/* Filename */}
              <p style={{ fontSize: 10, color: '#374151', padding: '3px 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, background: '#fff' }}>
                {f.name}
              </p>
            </div>
          ))}
          {/* Add more */}
          <div
            onClick={() => inputRef.current?.click()}
            style={{ border: '2px dashed #B3D9F5', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', aspectRatio: '4/3', cursor: 'pointer', background: '#F0F8FF', gap: 6, minHeight: 90 }}
          >
            <Plus size={20} style={{ color: '#B3D9F5' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>Add more</span>
          </div>
        </div>
      )}
      {files.length > 0 && (
        <p style={{ fontSize: 11, color: '#9CA3AF' }}>
          {files.length} photo{files.length > 1 ? 's' : ''} selected · first photo is the cover
        </p>
      )}
    </div>
  )
}

// ── Document uploader ─────────────────────────────────────────────────────────
// Accepts multiple ownership / legal documents (PDF, JPG, PNG).
// No camera capture.
function DocUploader({ files, onChange }) {
  const inputRef  = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [typeErr,  setTypeErr]  = useState('')

  const addFiles = (incoming) => {
    const valid = [], invalid = []
    Array.from(incoming).forEach(f => {
      ALLOWED_DOC_TYPES.includes(f.type) ? valid.push(f) : invalid.push(f.name)
    })
    if (invalid.length) {
      setTypeErr(`Rejected: ${invalid.join(', ')} — only ${fmtAllowed(ALLOWED_DOC_TYPES)} allowed.`)
    } else {
      setTypeErr('')
    }
    if (valid.length) onChange([...files, ...valid])
  }

  const remove = (idx) => onChange(files.filter((_, i) => i !== idx))

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        style={{
          border: `2px dashed ${dragOver ? '#01579B' : typeErr ? '#FCA5A5' : '#B3D9F5'}`,
          borderRadius: 14, padding: '28px 16px', textAlign: 'center',
          cursor: 'pointer', background: dragOver ? '#EBF5FB' : '#F0F8FF',
          transition: 'all 0.15s', marginBottom: 8,
        }}
      >
        <FileText size={28} style={{ color: '#B3D9F5', margin: '0 auto 10px', display: 'block' }} />
        <p style={{ fontSize: 13, color: '#546E7A', margin: '0 0 4px', fontWeight: 600 }}>
          Click to browse or drag documents here
        </p>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
          Accepted: {fmtAllowed(ALLOWED_DOC_TYPES)} · e.g. title deed, ownership certificate
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={DOC_ACCEPT}
          multiple
          style={{ display: 'none' }}
          onChange={e => addFiles(e.target.files)}
        />
      </div>

      {typeErr && (
        <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          ⚠ {typeErr}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 6 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#fff', border: '1.5px solid #B3D9F5', borderRadius: 10 }}>
              {/* Icon or thumbnail */}
              {(f.type === 'image/jpeg' || f.type === 'image/png') ? (
                <img src={URL.createObjectURL(f)} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
              ) : (
                <div style={{ width: 40, height: 40, background: '#FEF2F2', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 20 }}>📄</span>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{MIME_LABEL[f.type]} · {fmtSize(f.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <p style={{ fontSize: 11, color: '#9CA3AF' }}>
          {files.length} document{files.length > 1 ? 's' : ''} attached
        </p>
      )}
    </div>
  )
}

export default function AddProperty() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit') || null

  const [form,      setForm]      = useState(EMPTY)
  const [listing,   setListing]   = useState('sale')
  const [photos,    setPhotos]    = useState([])   // File[] — property images (mandatory)
  const [docs,      setDocs]      = useState([])   // File[] — ownership documents (mandatory)
  const [error,     setError]     = useState('')
  const [saving,    setSaving]    = useState(false)
  const [uploadStep, setUploadStep] = useState('')  // human-readable progress label
  const [propTypes, setPropTypes] = useState([])
  const [locations, setLocations] = useState([])
  const isEdit = !!editId

  // Load property types and locations from backend
  useEffect(() => {
    getPropertyTypes().then(setPropTypes).catch(() => {})
    getLocations().then(setLocations).catch(() => {})
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (!editId) return
    getProperty(editId)
      .then(p => {
        const loc = p.location || {}
        setForm({
          title:        p.title        || '',
          propertyType: p.property_type || '',
          bedrooms:     String(p.bedrooms  || ''),
          bathrooms:    String(p.bathrooms || ''),
          size:         String(p.area_sqm  || ''),
          priceRaw:     '',
          description:  p.description  || '',
          imageUrl:     p.primary_image?.image_url || '',
          city:         loc.city        || 'addis-ababa',
          subCity:      loc.sub_city    || '',
          woreda:       loc.woreda      || '',
          street:       loc.street      || '',
          landmark:     loc.neighborhood || '',
          listing:      'sale',
        })
      })
      .catch(() => {})
  }, [editId])

  const upd = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    setForm(p => ({ ...p, priceRaw: raw }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim())   { setError('Property title is required.'); return }
    if (!form.propertyType)   { setError('Property type is required.');  return }
    if (!form.subCity.trim()) { setError('Location is required.');       return }
    if (!isEdit && !form.priceRaw) { setError('Price is required.');     return }
    if (!isEdit && photos.length === 0) { setError('At least one property photo is required.'); return }
    if (!isEdit && docs.length === 0)   { setError('At least one ownership document is required.'); return }

    setError('')
    setSaving(true)

    try {
      // ── Step 1: upload all photos to ImgBB ──────────────────────────────
      let photoUrls = []
      if (photos.length > 0) {
        setUploadStep(`Uploading photos… (0 / ${photos.length})`)
        photoUrls = await uploadManyToImgBB(photos, (done, total) => {
          setUploadStep(`Uploading photos… (${done} / ${total})`)
        })
      }

      // ── Step 2: upload all documents to ImgBB ───────────────────────────
      let docUrls = []
      if (docs.length > 0) {
        setUploadStep(`Uploading documents… (0 / ${docs.length})`)
        docUrls = await uploadManyToImgBB(docs, (done, total) => {
          setUploadStep(`Uploading documents… (${done} / ${total})`)
        })
      }

      // ── Step 3: create the Property record ──────────────────────────────
      setUploadStep('Saving property…')

      const matchedLoc = locations.find(
        l => l.sub_city?.toLowerCase() === form.subCity.toLowerCase() ||
             l.neighborhood?.toLowerCase() === form.subCity.toLowerCase()
      )
      const locationId = matchedLoc?.id || null

      const propertyBody = {
        id:            uid(),
        owner:         user?.id,
        title:         form.title.trim(),
        property_type: form.propertyType,
        bedrooms:      Number(form.bedrooms)  || 0,
        bathrooms:     Number(form.bathrooms) || 0,
        area_sqm:      Number(form.size)      || 0,
        description:   form.description || '',
        ...(locationId ? { location: locationId } : {}),
      }

      let savedProperty
      if (isEdit) {
        savedProperty = await updateProperty(editId, propertyBody)
      } else {
        savedProperty = await createProperty(propertyBody)
      }

      // ── Step 4: attach all photo URLs ────────────────────────────────────
      if (photoUrls.length > 0 && savedProperty?.id) {
        setUploadStep('Attaching photos…')
        await Promise.allSettled(
          photoUrls.map((url, i) =>
            addPropertyImage({
              id:         uid(),
              property:   savedProperty.id,
              image_url:  url,
              is_primary: i === 0,
            })
          )
        )
        // allSettled — never throws; image attachment failures are non-fatal
      }

      // ── Step 5: attach all document URLs ────────────────────────────────
      if (docUrls.length > 0 && savedProperty?.id) {
        setUploadStep('Attaching documents…')
        await Promise.allSettled(
          docUrls.map(url =>
            addPropertyDocument({
              id:            uid(),
              property:      savedProperty.id,
              document_type: 'ownership',
              document_url:  url,
            })
          )
        )
        // allSettled — never throws; document attachment failures are non-fatal
      }

      // ── Step 6: create Listing record ────────────────────────────────────
      if (!isEdit && form.priceRaw) {
        setUploadStep('Creating listing…')
        await createListing({
          id:           uid(),
          property:     savedProperty.id,
          title:        form.title.trim(),
          listing_type: listing,
          price:        Number(form.priceRaw),
          currency:     'ETB',
          price_period: listing === 'rent' ? 'monthly' : 'total',
          status:       'active',
        })
      }

      navigate('/list-property')
    } catch (err) {
      // Surface the exact DRF validation error so we can see which field failed
      const msg = parseDRFError(err) || err?.message || 'Something went wrong.'
      console.error('[AddProperty] submit error:', err?.response?.status, err?.response?.data, err)
      setError(msg)
    } finally {
      setSaving(false)
      setUploadStep('')
    }
  }

  const displayPrice = form.priceRaw ? Number(form.priceRaw).toLocaleString() : ''

  return (
    <div style={{ minHeight:'100vh', background:'#fff' }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:'0 auto', padding:'36px 16px 80px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
          <button type="button" onClick={() => navigate(-1)}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#546E7A', display:'flex', alignItems:'center', gap:4, fontSize:13 }}>
            <ChevronLeft size={18}/> Back
          </button>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#111827', margin:0 }}>
            {isEdit ? 'Edit property' : 'Add new property'}
          </h1>
        </div>

        {error && (
          <div style={{ marginBottom:16, padding:'10px 14px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, fontSize:13, color:'#DC2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Section title="Property info"/>

          <Field label="Property title" required>
            <input value={form.title} onChange={upd('title')} placeholder="e.g. 3BR Apartment in Bole" style={inp} onFocus={f} onBlur={b}/>
          </Field>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <Field label="Property type" required>
              <select value={form.propertyType} onChange={upd('propertyType')} style={inp} onFocus={f} onBlur={b}>
                <option value="">Select…</option>
                {propTypes.length > 0
                  ? propTypes.map(pt => <option key={pt.id} value={pt.name}>{pt.name}</option>)
                  : <>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="condo">Condo</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land</option>
                    </>
                }
              </select>
            </Field>
            <Field label="Bedrooms">
              <input type="number" min="0" value={form.bedrooms} onChange={upd('bedrooms')} placeholder="0" style={inp} onFocus={f} onBlur={b}/>
            </Field>
            <Field label="Bathrooms">
              <input type="number" min="0" value={form.bathrooms} onChange={upd('bathrooms')} placeholder="0" style={inp} onFocus={f} onBlur={b}/>
            </Field>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Size (m²)">
              <input type="number" min="1" value={form.size} onChange={upd('size')} placeholder="e.g. 120" style={inp} onFocus={f} onBlur={b}/>
            </Field>
            <Field label={`Price (ETB${listing === 'rent' ? '/month' : ''})`} required={!isEdit}>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#546E7A', pointerEvents:'none' }}>ETB</span>
                <input type="text" inputMode="numeric" value={displayPrice} onChange={handlePriceChange}
                  placeholder="0" style={{ ...inp, paddingLeft:44 }} onFocus={f} onBlur={b}/>
              </div>
              {form.priceRaw && (
                <p style={{ fontSize:11, color:'#546E7A', marginTop:4 }}>
                  ETB {Number(form.priceRaw).toLocaleString()}{listing === 'rent' ? '/month' : ' total'}
                </p>
              )}
            </Field>
          </div>

          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            {['sale','rent'].map(v => (
              <button key={v} type="button" onClick={() => setListing(v)}
                style={{ padding:'10px 24px', borderRadius:20, cursor:'pointer', fontWeight:600, fontSize:14, border:'2px solid', borderColor:listing===v?'#01579B':'#B3D9F5', background:listing===v?'#01579B':'#F0F8FF', color:listing===v?'#fff':'#546E7A', transition:'all 0.15s' }}>
                {v === 'sale' ? 'For sale' : 'For rent'}
              </button>
            ))}
          </div>

          <Section title="Full address"/>

          <Field label="City / Region" required>
            <select value={form.city} onChange={upd('city')} style={inp} onFocus={f} onBlur={b}>
              <option value="addis-ababa">Addis Ababa</option>
              <option value="adama">Adama</option>
              <option value="bahir-dar">Bahir Dar</option>
              <option value="hawassa">Hawassa</option>
              <option value="dire-dawa">Dire Dawa</option>
              <option value="mekelle">Mekelle</option>
              <option value="gondar">Gondar</option>
              <option value="jimma">Jimma</option>
            </select>
          </Field>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Sub-city / Kifle Ketema" required>
              {locations.length > 0 ? (
                <select value={form.subCity} onChange={upd('subCity')} style={inp} onFocus={f} onBlur={b}>
                  <option value="">Select…</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.sub_city || l.neighborhood}>
                      {l.neighborhood || l.sub_city}
                      {l.sub_city && l.neighborhood ? ` (${l.sub_city})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={form.subCity} onChange={upd('subCity')} placeholder="e.g. Bole, CMC, Sarbet…" style={inp} onFocus={f} onBlur={b}/>
              )}
            </Field>
            <Field label="Woreda">
              <input value={form.woreda} onChange={upd('woreda')} placeholder="e.g. Woreda 03" style={inp} onFocus={f} onBlur={b}/>
            </Field>
          </div>

          <Field label="Street / Road">
            <input value={form.street} onChange={upd('street')} placeholder="e.g. Bole Road, Near Edna Mall" style={inp} onFocus={f} onBlur={b}/>
          </Field>
          <Field label="Specific landmark">
            <input value={form.landmark} onChange={upd('landmark')} placeholder="e.g. 200m from Total petrol station" style={inp} onFocus={f} onBlur={b}/>
          </Field>

          <Section title="Property photos — required"/>
          <div style={{ marginBottom: 6 }}>
            <p style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>
              Interior &amp; exterior photos
              <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>
              <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 8 }}>
                Add at least 1 photo · first photo becomes the cover image
              </span>
            </p>
            <PhotoUploader files={photos} onChange={setPhotos} />
          </div>

          <Section title="Ownership documents — required"/>
          <div style={{ marginBottom: 6 }}>
            <p style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>
              Title deed, ownership certificate, or other legal documents
              <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>
              <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 8 }}>
                These are reviewed by our team before the listing goes live
              </span>
            </p>
            <DocUploader files={docs} onChange={setDocs} />
          </div>

          <Section title="Description — optional"/>
          <Field label="Property description">
            <textarea
              value={form.description}
              onChange={upd('description')}
              rows={3}
              placeholder="Describe the property — features, nearby landmarks, condition… (optional)"
              style={{ ...inp, resize:'vertical', minHeight:80 }}
              onFocus={f} onBlur={b}
            />
          </Field>

          <div style={{ display:'flex', justifyContent:'center', gap:14, marginTop:8 }}>
            <button
              type="submit"
              disabled={saving}
              style={{ padding:'13px 48px', borderRadius:20, border:'none', background: saving ? '#9CA3AF' : '#29B6F6', color:'#fff', fontWeight:700, fontSize:15, cursor: saving ? 'not-allowed' : 'pointer', boxShadow:'0 4px 16px rgba(41,182,246,0.3)', minWidth: 200 }}>
              {saving
                ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                    <span style={{ display:'inline-block', width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', flexShrink:0 }}/>
                    {uploadStep || 'Saving…'}
                  </span>
                : isEdit ? 'Save changes' : '+ Add property'}
            </button>
          </div>
        </form>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
