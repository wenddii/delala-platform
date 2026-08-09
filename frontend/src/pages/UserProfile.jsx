import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserCog, LogOut, Plus, Heart, Bookmark,
  ShieldCheck, Upload, X, CheckCircle, AlertCircle,
  Pencil, Eye,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getMyProperties, getListings, getFavorites } from '../services/propertyService.js'
import { parseDRFError } from '../services/api.js'
import { formatPrice } from '../data/properties.js'

const TABS = [
  { id: 'saved',      label: 'Saved'         },
  { id: 'liked',      label: 'Liked'         },
  { id: 'properties', label: 'My Properties' },
  { id: 'verify',     label: 'Verification'  },
]

const STATUS_STYLE = {
  active:          { label: 'Live',    bg: '#DCFCE7', color: '#166534' },
  live:            { label: 'Live',    bg: '#DCFCE7', color: '#166534' },
  pending_payment: { label: 'Pending', bg: '#FEF9C3', color: '#854D0E' },
  under_review:    { label: 'Review',  bg: '#DBEAFE', color: '#1D4ED8' },
  rejected:        { label: 'Reject',  bg: '#FEE2E2', color: '#991B1B' },
  inactive:        { label: 'Inactive',bg: '#F3F4F6', color: '#6B7280' },
}

// ── Allowed MIME types per upload slot ───────────────────────────────────────
const ALLOWED_ID_TYPES   = ['image/jpeg', 'image/png', 'application/pdf']
const ALLOWED_FACE_TYPES = ['image/jpeg', 'image/png']

const MIME_LABEL = {
  'image/jpeg':      'JPG',
  'image/png':       'PNG',
  'application/pdf': 'PDF',
}

function formatAllowed(types) {
  return types.map(t => MIME_LABEL[t] || t).join(', ')
}

/**
 * DocUpload
 * - allowedTypes: string[]  — explicit MIME type whitelist
 * - imageOnly:    bool      — if true, only image/* is shown in the OS picker (no PDF)
 * - No camera capture (capture attribute intentionally omitted)
 */
function DocUpload({ label, hint, value, onChange, allowedTypes, icon }) {
  const ref = useRef(null)
  const [typeError, setTypeError] = useState('')

  const validate = (file) => {
    if (!file) { onChange(null); setTypeError(''); return }
    if (!allowedTypes.includes(file.type)) {
      setTypeError(`Invalid file type "${file.type || 'unknown'}". Only ${formatAllowed(allowedTypes)} files are accepted.`)
      onChange(null)
      return
    }
    setTypeError('')
    onChange(file)
  }

  const handleInput  = (e) => validate(e.target.files[0])
  const handleDrop   = (e) => { e.preventDefault(); validate(e.dataTransfer.files[0]) }

  // Build the accept string for the OS file picker from the allowedTypes list
  // We deliberately do NOT add "capture" — no camera option
  const acceptAttr = allowedTypes.join(',')

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{label}</p>

      <div
        onClick={() => ref.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        style={{
          border: `2px dashed ${typeError ? '#FCA5A5' : value ? '#22C55E' : '#B3D9F5'}`,
          borderRadius: 14, padding: '24px 16px', textAlign: 'center',
          cursor: 'pointer',
          background: typeError ? '#FFF5F5' : value ? '#F0FDF4' : '#F0F8FF',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => { if (!typeError) e.currentTarget.style.borderColor = '#01579B' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = typeError ? '#FCA5A5' : value ? '#22C55E' : '#B3D9F5' }}
      >
        {value ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {/* Image preview */}
            {(value.type === 'image/jpeg' || value.type === 'image/png') && (
              <img
                src={URL.createObjectURL(value)}
                alt="Preview"
                style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: '2px solid #BBF7D0' }}
              />
            )}
            {/* PDF icon */}
            {value.type === 'application/pdf' && (
              <div style={{ width: 52, height: 52, background: '#FEF2F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #FECACA' }}>
                <span style={{ fontSize: 22 }}>📄</span>
              </div>
            )}
            <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>✓ {value.name}</span>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{MIME_LABEL[value.type]} · {(value.size / 1024).toFixed(0)} KB</span>
            <button type="button"
              onClick={ev => { ev.stopPropagation(); onChange(null); setTypeError('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <X size={12} /> Remove
            </button>
          </div>
        ) : (
          <>
            <div style={{ color: '#B3D9F5', marginBottom: 8 }}>
              {icon || <Upload size={28} style={{ margin: '0 auto' }} />}
            </div>
            <p style={{ fontSize: 13, color: '#546E7A', marginBottom: 4 }}>
              {hint || 'Click or drag to upload'}
            </p>
            <p style={{ fontSize: 11, color: '#9CA3AF' }}>
              Accepted: {formatAllowed(allowedTypes)}
            </p>
          </>
        )}

        {/* Hidden file input — no capture attribute */}
        <input
          ref={ref}
          type="file"
          accept={acceptAttr}
          style={{ display: 'none' }}
          onChange={handleInput}
        />
      </div>

      {/* Format error */}
      {typeError && (
        <p style={{ fontSize: 12, color: '#DC2626', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⚠</span> {typeError}
        </p>
      )}
    </div>
  )
}

// Normalise a backend Property+Listing into a display object
function normaliseProperty(p, listings = []) {
  const loc = p.location || {}
  const linked = listings.find(
    l => String(l.property) === String(p.id) || String(l.property?.id) === String(p.id)
  )
  return {
    ...p,
    loc:     loc.neighborhood || loc.sub_city || '',
    type:    p.property_type  || '',
    beds:    p.bedrooms  ?? 0,
    baths:   p.bathrooms ?? 0,
    area:    p.area_sqm  ?? 0,
    price:   linked?.price || 0,
    listing: linked?.listing_type || 'sale',
    img:     p.primary_image?.image_url || '',
    status:  linked?.status || p.status || 'active',
  }
}

// Normalise a backend Listing into a display object (for saved/liked tabs)
function normaliseListing(l) {
  const prop = l.property || {}
  const loc  = (typeof prop === 'object' ? prop.location : null) || {}
  return {
    ...l,
    listing: l.listing_type || '',
    type:    prop.property_type || '',
    loc:     loc.neighborhood || loc.sub_city || '',
    beds:    prop.bedrooms  ?? 0,
    baths:   prop.bathrooms ?? 0,
    area:    prop.area_sqm  ?? 0,
    img:     l.primary_image?.image_url || '',
    status:  l.status || 'active',
    price:   l.price || 0,
  }
}

export default function UserProfile() {
  const { user, logout, submitVerification } = useAuth()
  const navigate = useNavigate()

  const [tab,           setTab]          = useState('saved')
  const [myProps,       setMyProps]      = useState([])
  const [favorites,     setFavorites]    = useState([])
  const [allListings,   setAllListings]  = useState([])
  const [propsLoading,  setPropsLoading] = useState(true)
  const [favsLoading,   setFavsLoading]  = useState(true)

  const [idFile,        setIdFile]       = useState(null)
  const [faceFile,      setFaceFile]     = useState(null)
  const [verifyLoading, setVerifyLoading]= useState(false)
  const [verifyDone,    setVerifyDone]   = useState(!!user?.idVerified)
  const [verifyError,   setVerifyError]  = useState('')

  // Fetch user's own properties + all listings (to join price/listing_type)
  useEffect(() => {
    if (!user) return
    let cancelled = false
    setPropsLoading(true)
    Promise.all([getMyProperties(), getListings()])
      .then(([props, listings]) => {
        if (cancelled) return
        const mine = (Array.isArray(props) ? props : [])
          .filter(p => String(p.owner) === String(user.id))
        setMyProps(mine.map(p => normaliseProperty(p, Array.isArray(listings) ? listings : [])))
        setAllListings(Array.isArray(listings) ? listings : [])
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPropsLoading(false) })
    return () => { cancelled = true }
  }, [user])

  // Fetch favorites (requires auth)
  useEffect(() => {
    if (!user) return
    let cancelled = false
    setFavsLoading(true)
    getFavorites()
      .then(data => {
        if (cancelled) return
        setFavorites(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setFavsLoading(false) })
    return () => { cancelled = true }
  }, [user])

  const handleLogout = () => { logout(); navigate('/') }

  const handleVerify = async () => {
    if (!idFile)   { setVerifyError('Please upload your ID document.'); return }
    if (!faceFile) { setVerifyError('Please upload a face photo.');     return }
    setVerifyError('')
    setVerifyLoading(true)
    try {
      await submitVerification({ idFile, faceFile })
      setVerifyDone(true)
    } catch (err) {
      setVerifyError(err.message)
    } finally {
      setVerifyLoading(false)
    }
  }

  const isVerified = verifyDone || user?.idVerified || user?.phone_verified

  // Saved = favorites resolved to listing objects; Liked = first 3 of all listings (no backend "liked" yet)
  const savedListings = favorites
    .map(fav => {
      const l = allListings.find(
        l => String(l.id) === String(fav.property_listing) ||
             String(l.id) === String(fav.property_listing?.id)
      )
      return l ? normaliseListing(l) : null
    })
    .filter(Boolean)

  const likedListings = allListings.slice(0, 3).map(normaliseListing)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-10">

        {/* ── Profile header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 pb-8 border-b border-ethio-border">
          <div className="flex-shrink-0 flex flex-col items-center sm:items-start">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-ethio-primary flex items-center justify-center text-white text-3xl font-bold overflow-hidden select-none">
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  : (user?.name || user?.full_name || 'U')[0]?.toUpperCase()}
              </div>
              {!isVerified && (
                <button
                  onClick={() => setTab('verify')}
                  title="Identity not verified — click to verify"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-500 border-2 border-white flex items-center justify-center hover:bg-red-600 transition"
                  aria-label="Not verified"
                >
                  <span style={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>!</span>
                </button>
              )}
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                  <CheckCircle size={14} style={{ color: '#fff' }} />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-ethio-ink">
                {user?.name || user?.full_name || 'Your Name'}
              </h1>
              {isVerified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', background: '#DCFCE7', color: '#166534', fontSize: 11, fontWeight: 700, borderRadius: 20 }}>
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-ethio-muted">{user?.email}</p>
            <p className="text-sm text-ethio-muted">{user?.phone || user?.phone_number}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to="/edit-profile"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-ethio-primary text-white text-xs font-semibold rounded-full hover:bg-ethio-primary-dark transition">
                <UserCog size={13} /> Edit profile
              </Link>
              <Link to="/add-property"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-ethio-accent text-white text-xs font-semibold rounded-full hover:opacity-90 transition">
                <Plus size={13} /> Add property
              </Link>
              <Link to="/list-property"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-ethio-primary text-ethio-primary text-xs font-semibold rounded-full hover:bg-ethio-tint transition">
                <Plus size={13} /> List properties
              </Link>
              <button onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-red-200 text-red-500 text-xs font-semibold rounded-full hover:bg-red-50 transition">
                <LogOut size={13} /> Log out
              </button>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap justify-center sm:justify-end">
            {[
              { label: 'Properties', value: myProps.length },
              { label: 'Live',       value: myProps.filter(p => p.status === 'active' || p.status === 'live').length },
              { label: 'Saved',      value: savedListings.length },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center bg-ethio-tint rounded-2xl px-5 py-3 min-w-[72px]">
                <span className="text-xl font-bold text-ethio-primary">{s.value}</span>
                <span className="text-[10px] text-ethio-muted mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-8 border-b border-ethio-border overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition border-b-2 -mb-px ${
                tab === t.id
                  ? 'border-ethio-primary text-ethio-primary'
                  : 'border-transparent text-ethio-muted hover:text-ethio-ink'
              }`}>
              {t.label}
              {t.id === 'verify' && !isVerified && (
                <span className="ml-2 inline-flex w-2 h-2 rounded-full bg-ethio-accent" />
              )}
            </button>
          ))}
        </div>

        {/* ── Saved tab ── */}
        {tab === 'saved' && (
          <div>
            <h2 className="text-base font-bold text-ethio-ink mb-5">Saved properties</h2>
            {favsLoading
              ? <div className="flex justify-center py-12"><span className="inline-block w-8 h-8 border-4 border-ethio-primary/20 border-t-ethio-primary rounded-full animate-spin" /></div>
              : savedListings.length
                ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedListings.map(p => <PropertyCard key={p.id} property={p} showSave />)}
                  </div>
                : <EmptyState icon={<Bookmark size={36} />} text="No saved properties yet." />
            }
          </div>
        )}

        {/* ── Liked tab ── */}
        {tab === 'liked' && (
          <div>
            <h2 className="text-base font-bold text-ethio-ink mb-5">Liked properties</h2>
            {likedListings.length
              ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {likedListings.map(p => <PropertyCard key={p.id} property={p} showHeart />)}
                </div>
              : <EmptyState icon={<Heart size={36} />} text="No liked properties yet." />
            }
          </div>
        )}

        {/* ── Properties tab ── */}
        {tab === 'properties' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ethio-ink">My properties</h2>
              <Link to="/add-property" className="inline-flex items-center gap-1.5 px-4 py-2 bg-ethio-primary text-white text-xs font-semibold rounded-full hover:bg-ethio-primary-dark transition">
                <Plus size={13} /> Add new
              </Link>
            </div>

            {!isVerified && (
              <div className="flex gap-3 items-start p-4 mb-5 bg-amber-50 border border-amber-300 rounded-xl">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Your listings are marked as Pending</p>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    Properties you add will stay <strong>Pending</strong> until you verify your identity.{' '}
                    <button onClick={() => setTab('verify')} className="underline font-semibold text-amber-800 hover:text-amber-900 bg-transparent border-none cursor-pointer p-0 text-xs">
                      Verify now →
                    </button>
                  </p>
                </div>
              </div>
            )}

            {propsLoading ? (
              <div className="flex justify-center py-12">
                <span className="inline-block w-8 h-8 border-4 border-ethio-primary/20 border-t-ethio-primary rounded-full animate-spin" />
              </div>
            ) : myProps.length === 0 ? (
              <EmptyState icon={<Plus size={36} />} text="You haven't added any properties yet.">
                <Link to="/add-property" className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 bg-ethio-primary text-white text-sm font-semibold rounded-full">
                  <Plus size={14} /> Add your first property
                </Link>
              </EmptyState>
            ) : (
              <div className="space-y-4">
                {myProps.map(p => {
                  const effectiveStatus = !isVerified && (p.status === 'active' || p.status === 'live')
                    ? 'pending_payment'
                    : p.status
                  const st = STATUS_STYLE[effectiveStatus] || { label: 'Draft', bg: '#F3F4F6', color: '#6B7280' }
                  return (
                    <div key={p.id} className="border border-ethio-border rounded-2xl bg-white hover:border-ethio-primary/40 transition overflow-hidden">
                      <div className="flex items-start gap-4 p-4">
                        <div className="w-24 rounded-xl overflow-hidden bg-ethio-tint shrink-0" style={{ height: 72 }}>
                          {p.img
                            ? <img src={p.img} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-ethio-tint" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-ethio-ink leading-snug">{p.title}</p>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, whiteSpace: 'nowrap', flexShrink: 0 }}>{st.label}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-ethio-primary">
                              {p.price ? formatPrice(Number(p.price), p.listing) : 'Price TBD'}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.listing === 'sale' ? 'bg-orange-50 text-orange-600' : 'bg-ethio-tint text-ethio-primary'}`}>
                              {p.listing === 'sale' ? 'For sale' : 'For rent'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-ethio-border bg-ethio-tint/40 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs text-ethio-muted">
                        {p.type && <div><span className="font-semibold text-ethio-ink capitalize">{p.type}</span><br/>Type</div>}
                        {p.beds > 0 && <div><span className="font-semibold text-ethio-ink">{p.beds}</span><br/>Bedrooms</div>}
                        {p.baths > 0 && <div><span className="font-semibold text-ethio-ink">{p.baths}</span><br/>Bathrooms</div>}
                        {p.area > 0 && <div><span className="font-semibold text-ethio-ink">{p.area} m²</span><br/>Area</div>}
                        {p.loc && <div><span className="font-semibold text-ethio-ink capitalize">{p.loc}</span><br/>Location</div>}
                      </div>

                      <div className="flex items-center gap-2 px-4 py-3 border-t border-ethio-border">
                        <Link to={`/add-property?edit=${p.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-ethio-border rounded-lg text-ethio-muted hover:text-ethio-primary hover:border-ethio-primary transition">
                          <Pencil size={13} /> Edit
                        </Link>
                        <Link to={`/property/${p.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-ethio-border rounded-lg text-ethio-muted hover:text-ethio-primary hover:border-ethio-primary transition">
                          <Eye size={13} /> View
                        </Link>
                        {effectiveStatus === 'pending_payment' && isVerified && (
                          <Link to="/list-property"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-ethio-primary text-white rounded-lg hover:bg-ethio-primary-dark transition ml-auto">
                            List now
                          </Link>
                        )}
                        {!isVerified && (
                          <button onClick={() => setTab('verify')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition ml-auto">
                            Verify to publish
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Verification tab ── */}
        {tab === 'verify' && (
          <div style={{ maxWidth: 520 }}>
            <h2 className="text-base font-bold text-ethio-ink mb-2">Verify your identity</h2>
            <p className="text-sm text-ethio-muted mb-6">
              Required to list properties and contact sellers. Verification is reviewed within 24 hours.
            </p>

            {isVerified ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 12 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={32} style={{ color: '#16A34A' }} />
                </div>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Identity verified!</p>
                <p style={{ fontSize: 13, color: '#6B7280' }}>You can now list and contact without restrictions.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 14, padding: '16px 18px', background: '#FFF1F2', border: '2px solid #FDA4AF', borderRadius: 14, marginBottom: 24 }}>
                  <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>⚠️</div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 14, color: '#9F1239', margin: '0 0 4px' }}>Identity verification required</p>
                    <p style={{ fontSize: 13, color: '#BE123C', margin: 0, lineHeight: 1.6 }}>
                      You <strong>cannot list properties or contact sellers</strong> without verifying your identity.
                    </p>
                  </div>
                </div>

                {verifyError && (
                  <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
                    {verifyError}
                  </div>
                )}

                <DocUpload
                  label="ID document (Kebele ID or National ID)"
                  hint="Click or drag to upload — JPG, PNG, or PDF"
                  allowedTypes={ALLOWED_ID_TYPES}
                  value={idFile}
                  onChange={setIdFile}
                />
                <DocUpload
                  label="Face photo — clear photo of you holding your ID"
                  hint="Upload an image file only — JPG or PNG"
                  allowedTypes={ALLOWED_FACE_TYPES}
                  value={faceFile}
                  onChange={setFaceFile}
                  icon={
                    <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #B3D9F5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <Upload size={22} style={{ color: '#B3D9F5' }} />
                    </div>
                  }
                />

                <button
                  onClick={handleVerify}
                  disabled={verifyLoading}
                  style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: verifyLoading ? '#9CA3AF' : '#01579B', color: '#fff', fontWeight: 700, fontSize: 15, cursor: verifyLoading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
                >
                  {verifyLoading
                    ? <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', verticalAlign: 'middle' }} />
                    : 'Submit for verification'}
                </button>
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function EmptyState({ icon, text, children }) {
  return (
    <div className="flex flex-col items-center py-20 text-ethio-muted">
      <div className="mb-4 opacity-30">{icon}</div>
      <p className="text-base font-medium">{text}</p>
      {children}
    </div>
  )
}
