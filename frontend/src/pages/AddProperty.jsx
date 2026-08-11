/**
 * AddProperty.jsx
 *
 * Business rules implemented (from Delala Business Rules doc):
 *  - Rule 4:  Backend derives owner from auth token — never sent from frontend.
 *  - Rule 2:  Location is selected from predefined dropdowns (city → neighborhood).
 *             No free-text city/sub-city/woreda/street fields.
 *  - Rule 3:  Document is REQUIRED on property creation. Cannot be skipped.
 *  - Rule 4:  Property type, location, bedrooms, bathrooms, area, description,
 *             document_type, and property document are the required fields.
 *  - Rule 6:  No listing is created here. Listing is a SEPARATE step after
 *             verification. Price/listing_type are NOT collected here.
 *  - Rule 14: After creation the property enters verification (pending).
 *             User is redirected to /profile to see their pending property.
 *
 * Flow:
 *  1. Upload photos to ImgBB → get permanent URLs
 *  2. Upload document to ImgBB → get permanent URL
 *  3. POST /api/properties/properties/ (no owner, no price, no listing_type)
 *  4. POST /api/properties/images/     for each photo URL
 *  5. POST /api/properties/documents/  for the document URL
 *  6. Navigate to /profile
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Plus, X, ImageIcon, FileText, Info } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  createProperty, updateProperty, getProperty,
  addPropertyImage,
  getPropertyTypes, getLocations,
} from '../services/propertyService.js'
import { parseDRFError } from '../services/api.js'
import { uploadManyToImgBB } from '../utils/imageUpload.js'

// ── Shared style helpers ──────────────────────────────────────────────────────
function Field({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

const inp = {
  display: 'block', width: '100%', padding: '10px 14px', fontSize: 14,
  lineHeight: '1.5', color: '#111827', background: '#F0F8FF',
  border: '1.5px solid #B3D9F5', borderRadius: 10, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
}
const onF = (e) => { e.target.style.borderColor = '#01579B'; e.target.style.boxShadow = '0 0 0 3px rgba(1,87,155,0.15)' }
const onB = (e) => { e.target.style.borderColor = '#B3D9F5'; e.target.style.boxShadow = 'none' }

function SectionHead({ title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 18px' }}>
      <div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#01579B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
        {subtitle && <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
      <div style={{ flex: 1, height: 1, background: '#B3D9F5' }} />
    </div>
  )
}

// ── Allowed file types ────────────────────────────────────────────────────────
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_DOC_TYPES   = ['application/pdf', 'image/jpeg', 'image/png']
const PHOTO_ACCEPT = ALLOWED_PHOTO_TYPES.join(',')
const DOC_ACCEPT   = ALLOWED_DOC_TYPES.join(',')

const MIME_LABEL = {
  'image/jpeg': 'JPG', 'image/png': 'PNG',
  'image/webp': 'WebP', 'application/pdf': 'PDF',
}
const fmtAllowed = (types) => types.map(t => MIME_LABEL[t]).join(', ')
const fmtSize = (bytes) => bytes < 1024 * 1024
  ? `${(bytes / 1024).toFixed(0)} KB`
  : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

// ── Multi-photo uploader ──────────────────────────────────────────────────────
function PhotoUploader({ files, onChange }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [typeErr,  setTypeErr]  = useState('')

  const addFiles = (incoming) => {
    const valid = [], invalid = []
    Array.from(incoming).forEach(f =>
      ALLOWED_PHOTO_TYPES.includes(f.type) ? valid.push(f) : invalid.push(f.name)
    )
    if (invalid.length) setTypeErr(`Rejected: ${invalid.join(', ')} — only ${fmtAllowed(ALLOWED_PHOTO_TYPES)} allowed.`)
    else setTypeErr('')
    if (valid.length) onChange([...files, ...valid])
  }
  const remove     = (i) => onChange(files.filter((_, j) => j !== i))
  const setPrimary = (i) => { const n = [...files]; const [p] = n.splice(i, 1); onChange([p, ...n]) }

  return (
    <div>
      <div onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        style={{ border: `2px dashed ${dragOver ? '#01579B' : typeErr ? '#FCA5A5' : '#B3D9F5'}`, borderRadius: 14, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', background: dragOver ? '#EBF5FB' : '#F0F8FF', transition: 'all 0.15s', marginBottom: 8 }}>
        <ImageIcon size={28} style={{ color: '#B3D9F5', margin: '0 auto 10px', display: 'block' }} />
        <p style={{ fontSize: 13, color: '#546E7A', margin: '0 0 4px', fontWeight: 600 }}>Click or drag photos here</p>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Accepted: {fmtAllowed(ALLOWED_PHOTO_TYPES)} · multiple allowed</p>
        <input ref={inputRef} type="file" accept={PHOTO_ACCEPT} multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
      </div>
      {typeErr && <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 8 }}>⚠ {typeErr}</p>}
      {files.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 6 }}>
          {files.map((f, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: i === 0 ? '2.5px solid #01579B' : '1.5px solid #B3D9F5' }}>
              <img src={URL.createObjectURL(f)} alt={f.name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
              {i === 0
                ? <span style={{ position: 'absolute', top: 5, left: 5, padding: '2px 7px', background: '#01579B', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 20 }}>Cover</span>
                : <button type="button" onClick={e => { e.stopPropagation(); setPrimary(i) }} style={{ position: 'absolute', top: 5, left: 5, padding: '2px 7px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontWeight: 600, borderRadius: 20, border: 'none', cursor: 'pointer' }}>Set cover</button>}
              <button type="button" onClick={e => { e.stopPropagation(); remove(i) }} style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                <X size={13} />
              </button>
              <p style={{ fontSize: 10, color: '#374151', padding: '3px 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, background: '#fff' }}>{f.name}</p>
            </div>
          ))}
          <div onClick={() => inputRef.current?.click()} style={{ border: '2px dashed #B3D9F5', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', aspectRatio: '4/3', cursor: 'pointer', background: '#F0F8FF', gap: 6, minHeight: 90 }}>
            <Plus size={20} style={{ color: '#B3D9F5' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>Add more</span>
          </div>
        </div>
      )}
      {files.length > 0 && <p style={{ fontSize: 11, color: '#9CA3AF' }}>{files.length} photo{files.length > 1 ? 's' : ''} · first is cover</p>}
    </div>
  )
}

// ── Single-document uploader ──────────────────────────────────────────────────
// Rule 3 / Rule 4: exactly one ownership document is required.
function DocUploader({ files, onChange }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [typeErr,  setTypeErr]  = useState('')

  const addFiles = (incoming) => {
    const valid = [], invalid = []
    Array.from(incoming).forEach(f =>
      ALLOWED_DOC_TYPES.includes(f.type) ? valid.push(f) : invalid.push(f.name)
    )
    if (invalid.length) setTypeErr(`Rejected: ${invalid.join(', ')} — only ${fmtAllowed(ALLOWED_DOC_TYPES)} allowed.`)
    else setTypeErr('')
    if (valid.length) onChange([...files, ...valid])
  }
  const remove = (i) => onChange(files.filter((_, j) => j !== i))

  return (
    <div>
      <div onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        style={{ border: `2px dashed ${dragOver ? '#01579B' : typeErr ? '#FCA5A5' : '#B3D9F5'}`, borderRadius: 14, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', background: dragOver ? '#EBF5FB' : '#F0F8FF', transition: 'all 0.15s', marginBottom: 8 }}>
        <FileText size={28} style={{ color: '#B3D9F5', margin: '0 auto 10px', display: 'block' }} />
        <p style={{ fontSize: 13, color: '#546E7A', margin: '0 0 4px', fontWeight: 600 }}>Click or drag documents here</p>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Accepted: {fmtAllowed(ALLOWED_DOC_TYPES)} · title deed, ownership certificate, etc.</p>
        <input ref={inputRef} type="file" accept={DOC_ACCEPT} multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
      </div>
      {typeErr && <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 8 }}>⚠ {typeErr}</p>}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 6 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#fff', border: '1.5px solid #B3D9F5', borderRadius: 10 }}>
              {(f.type === 'image/jpeg' || f.type === 'image/png')
                ? <img src={URL.createObjectURL(f)} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                : <div style={{ width: 40, height: 40, background: '#FEF2F2', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 20 }}>📄</span></div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{MIME_LABEL[f.type]} · {fmtSize(f.size)}</p>
              </div>
              <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}><X size={16} /></button>
            </div>
          ))}
        </div>
      )}
      {files.length > 0 && <p style={{ fontSize: 11, color: '#9CA3AF' }}>{files.length} document{files.length > 1 ? 's' : ''} attached</p>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const EMPTY = {
  propertyType: '', bedrooms: '', bathrooms: '',
  size: '', description: '', locationId: '',
}

export default function AddProperty() {
  const { user }     = useAuth()
  const navigate     = useNavigate()
  const [searchParams] = useSearchParams()
  const editId       = searchParams.get('edit') || null
  const isEdit       = !!editId

  const [form,        setForm]       = useState(EMPTY)
  const [photos,      setPhotos]     = useState([])
  const [docs,        setDocs]       = useState([])
  const [error,       setError]      = useState('')
  const [saving,      setSaving]     = useState(false)
  const [uploadStep,  setUploadStep] = useState('')
  const [propTypes,   setPropTypes]  = useState([])
  const [locations,   setLocations]  = useState([])
  const [cityFilter,  setCityFilter] = useState('')

  useEffect(() => {
    getPropertyTypes().then(setPropTypes).catch(() => {})
    getLocations().then(setLocations).catch(() => {})
  }, [])

  // When editing, load existing property data
  useEffect(() => {
    if (!editId) return
    getProperty(editId).then(p => {
      setForm({
        propertyType: String(p.property_type?.id || p.property_type || ''),
        bedrooms:     String(p.bedrooms  || ''),
        bathrooms:    String(p.bathrooms || ''),
        size:         String(p.area_sqm  || ''),
        description:  p.description  || '',
        locationId:   String(p.location?.id || p.location || ''),
      })
      setCityFilter(p.location?.city || '')
    }).catch(() => {})
  }, [editId])

  const upd = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  // Build city list from locations
  const cities = [...new Set(locations.map(l => l.city).filter(Boolean))].sort()

  // Filter neighborhoods/sub-cities by selected city
  const filteredLocs = cityFilter
    ? locations.filter(l => l.city === cityFilter)
    : locations

  const handleSubmit = async (e) => {
    e.preventDefault()
    // ── Validation ────────────────────────────────────────────────────────────
    if (!form.propertyType)    { setError('Property type is required.');  return }
    if (!form.locationId)      { setError('Please select a location.');   return }
    if (!isEdit && photos.length === 0) { setError('At least one property photo is required.'); return }
    if (!isEdit && docs.length === 0)   { setError('An ownership document is required.'); return }

    setError('')
    setSaving(true)

    try {
      // ── Step 1: upload photos to ImgBB to get permanent URLs ─────────────
      let photoUrls = []
      if (photos.length > 0) {
        setUploadStep(`Uploading photos… (0 / ${photos.length})`)
        photoUrls = await uploadManyToImgBB(photos, (done, total) =>
          setUploadStep(`Uploading photos… (${done} / ${total})`)
        )
      }

      // ── Step 2: create property with document file as multipart/form-data ─
      // Rule 4: the backend creates Property + PropertyDocument + Verification
      // atomically in one POST. The document file must be included here.
      // document_type and document (File) are required fields on the same endpoint.
      setUploadStep('Saving property…')

      const fd = new FormData()
      fd.append('property_type', form.propertyType)   // int FK
      fd.append('location',      form.locationId)      // int FK
      fd.append('bedrooms',      Number(form.bedrooms)  || 0)
      fd.append('bathrooms',     Number(form.bathrooms) || 0)
      fd.append('area_sqm',      Number(form.size)      || 0)
      fd.append('description',   form.description || '')
      // Only attach a document if the user actually selected one. On edit,
      // docs[] starts empty (existing docs aren't re-fetched into this
      // uploader) — appending an empty/undefined value here would corrupt
      // the request, so only send it when a real file was chosen.
      if (docs.length > 0) {
        fd.append('document_type', 'ownership')
        fd.append('document', docs[0])
      }
      // If there are additional documents, we'll attach them after via addPropertyDocument
      // (using the same pattern — first is required, extras are supplementary)

      let savedProperty
      if (isEdit) {
        savedProperty = await updateProperty(editId, fd)
      } else {
        savedProperty = await createProperty(fd)
      }

      // ── Step 3: attach photo URLs to the saved property ──────────────────
      if (photoUrls.length > 0 && savedProperty?.id) {
        setUploadStep('Attaching photos…')
        await Promise.allSettled(
          photoUrls.map((url, i) => addPropertyImage({
            property:   savedProperty.id,
            image_url:  url,
            is_primary: i === 0,
          }))
        )
      }

      // ── Step 4: extra documents are already handled by the atomic POST ────
      // docs[0] was sent with the property creation via FormData.
      // Additional docs (docs[1..n]) — skip for now; the backend's atomic
      // endpoint only accepts one document per property creation request.
      // TODO: attach extras via a separate multipart POST to /api/properties/documents/
      //       once the endpoint's exact multipart field names are confirmed.

      // Rule 14: redirect to profile — property is now pending verification
      navigate('/profile', { state: { newProperty: true } })
    } catch (err) {
      const msg = parseDRFError(err) || err?.message || 'Something went wrong.'
      console.error('[AddProperty] submit error:', err?.response?.status, err?.response?.data)
      setError(msg)
    } finally {
      setSaving(false)
      setUploadStep('')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '36px 16px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button type="button" onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#546E7A', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
            <ChevronLeft size={18} /> Back
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
            {isEdit ? 'Edit property' : 'Add new property'}
          </h1>
        </div>

        {/* Lifecycle info banner */}
        {!isEdit && (
          <div style={{ display: 'flex', gap: 12, padding: '14px 16px', background: '#EBF5FB', border: '1.5px solid #B3D9F5', borderRadius: 12, marginBottom: 24 }}>
            <Info size={18} style={{ color: '#01579B', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#01579B', margin: '0 0 4px' }}>How it works</p>
              <p style={{ fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.6 }}>
                After you submit, our team reviews your property and ownership document.
                Once <strong>verified</strong>, you can create a listing and make it public.
                Listing and pricing are set separately after verification.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <SectionHead title="Property details" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Property type" required>
              <select value={form.propertyType} onChange={upd('propertyType')} style={inp} onFocus={onF} onBlur={onB}>
                <option value="">Select…</option>
                {propTypes.length > 0
                  ? propTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)
                  : <>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="condo">Condo</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land</option>
                    </>}
              </select>
            </Field>
            <Field label="Bedrooms">
              <input type="number" min="0" value={form.bedrooms} onChange={upd('bedrooms')}
                placeholder="0" style={inp} onFocus={onF} onBlur={onB} />
            </Field>
            <Field label="Bathrooms">
              <input type="number" min="0" value={form.bathrooms} onChange={upd('bathrooms')}
                placeholder="0" style={inp} onFocus={onF} onBlur={onB} />
            </Field>
          </div>

          <Field label="Area (m²)">
            <input type="number" min="1" value={form.size} onChange={upd('size')}
              placeholder="e.g. 120" style={inp} onFocus={onF} onBlur={onB} />
          </Field>

          {/* Rule 2: Location from predefined list — two-level dropdown */}
          <SectionHead title="Location" subtitle="Select from predefined locations — no free-text" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="City / Region" required>
              <select value={cityFilter}
                onChange={e => { setCityFilter(e.target.value); setForm(p => ({ ...p, locationId: '' })) }}
                style={inp} onFocus={onF} onBlur={onB}>
                <option value="">All cities…</option>
                {cities.length > 0
                  ? cities.map(c => <option key={c} value={c}>{c}</option>)
                  : ['Addis Ababa','Adama','Bahir Dar','Hawassa','Dire Dawa','Mekelle','Gondar','Jimma']
                      .map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Neighborhood / Sub-city" required>
              <select value={form.locationId} onChange={upd('locationId')} style={inp} onFocus={onF} onBlur={onB}>
                <option value="">Select location…</option>
                {filteredLocs.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.neighborhood || l.sub_city}
                    {l.neighborhood && l.sub_city ? ` (${l.sub_city})` : ''}
                    {l.woreda ? ` — Woreda ${l.woreda}` : ''}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Description — optional per rules */}
          <SectionHead title="Description" subtitle="Optional" />
          <Field label="Property description">
            <textarea value={form.description} onChange={upd('description')} rows={3}
              placeholder="Describe the property — features, condition, nearby landmarks… (optional)"
              style={{ ...inp, resize: 'vertical', minHeight: 80 }} onFocus={onF} onBlur={onB} />
          </Field>

          {/* Photos */}
          <SectionHead title="Property photos" subtitle="Required — interior and exterior shots" />
          <Field label="Photos" required hint="First photo becomes the cover image">
            <PhotoUploader files={photos} onChange={setPhotos} />
          </Field>

          {/* Ownership document — Rule 3: REQUIRED */}
          <SectionHead title="Ownership document" subtitle="Required for verification — title deed, ownership certificate, etc." />
          <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
            <p style={{ fontSize: 12, color: '#92400E', margin: 0, lineHeight: 1.6 }}>
              Documents are <strong>private</strong> and only visible to staff reviewers.
              They are not shown to the public. The property cannot enter verification without a document.
            </p>
          </div>
          <Field label="Ownership document" required hint="PDF, JPG, or PNG — title deed, owner certificate, etc.">
            <DocUploader files={docs} onChange={setDocs} />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <button type="submit" disabled={saving}
              style={{ padding: '13px 48px', borderRadius: 20, border: 'none', background: saving ? '#9CA3AF' : '#29B6F6', color: '#fff', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(41,182,246,0.3)', minWidth: 220 }}>
              {saving
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    {uploadStep || 'Saving…'}
                  </span>
                : isEdit ? 'Save changes' : 'Submit for verification'}
            </button>
          </div>
        </form>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
