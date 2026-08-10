/**
 * UserProfile.jsx
 *
 * Business rules implemented:
 *  - Rule 5/6: property verification status (pending/verified/rejected) is read
 *    from GET /api/properties/verifications/ and displayed per property.
 *  - Rule 6: "Create listing" is only offered for 'verified' properties.
 *    pending and rejected properties show their status with guidance, no list button.
 *  - Rule 10: user's properties are shown with their real verification state.
 *  - Rule 11: unverified properties are never presented as publicly listed.
 *  - Rule 14: full lifecycle displayed — pending → verified → listed, or rejected.
 */
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  UserCog, LogOut, Plus, Heart, Bookmark, ShieldCheck,
  Upload, X, CheckCircle, AlertCircle, Pencil, Eye,
  Clock, XCircle, MessageSquare,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getMyProperties, getListings, getFavorites, getVerifications,
} from '../services/propertyService.js'
import { parseDRFError } from '../services/api.js'
import { formatPrice } from '../data/properties.js'

// ── Verification status display config ────────────────────────────────────────
// Rule 5: pending | verified | rejected
const VSTATUS = {
  pending:  { label: 'Pending review',  bg: '#FEF9C3', color: '#854D0E', icon: Clock,       desc: 'Our team is reviewing your property and documents. This usually takes 1–2 business days.' },
  verified: { label: 'Verified',        bg: '#DCFCE7', color: '#166534', icon: CheckCircle, desc: 'Your property has been verified. You can now create a listing.' },
  rejected: { label: 'Rejected',        bg: '#FEE2E2', color: '#991B1B', icon: XCircle,     desc: 'Your property was rejected. See the remarks below, correct the issue, and re-submit.' },
}

const LISTING_STATUS = {
  active:   { label: 'Live',    bg: '#DCFCE7', color: '#166534' },
  inactive: { label: 'Inactive',bg: '#F3F4F6', color: '#6B7280' },
  pending:  { label: 'Pending', bg: '#FEF9C3', color: '#854D0E' },
}

// ── MIME types for identity verification uploads ───────────────────────────────
const ALLOWED_ID_TYPES   = ['image/jpeg', 'image/png', 'application/pdf']
const ALLOWED_FACE_TYPES = ['image/jpeg', 'image/png']
const MIME_LABEL = { 'image/jpeg': 'JPG', 'image/png': 'PNG', 'application/pdf': 'PDF' }
function formatAllowed(types) { return types.map(t => MIME_LABEL[t] || t).join(', ') }

function DocUpload({ label, hint, value, onChange, allowedTypes, icon }) {
  const ref = useRef(null)
  const [typeError, setTypeError] = useState('')
  const validate = (file) => {
    if (!file) { onChange(null); setTypeError(''); return }
    if (!allowedTypes.includes(file.type)) {
      setTypeError(`Invalid file type. Only ${formatAllowed(allowedTypes)} accepted.`)
      onChange(null); return
    }
    setTypeError(''); onChange(file)
  }
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{label}</p>
      <div onClick={() => ref.current?.click()}
        onDrop={e => { e.preventDefault(); validate(e.dataTransfer.files[0]) }}
        onDragOver={e => e.preventDefault()}
        style={{ border: `2px dashed ${typeError ? '#FCA5A5' : value ? '#22C55E' : '#B3D9F5'}`, borderRadius: 14, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', background: typeError ? '#FFF5F5' : value ? '#F0FDF4' : '#F0F8FF' }}
        onMouseEnter={e => { if (!typeError) e.currentTarget.style.borderColor = '#01579B' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = typeError ? '#FCA5A5' : value ? '#22C55E' : '#B3D9F5' }}>
        {value ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {(value.type === 'image/jpeg' || value.type === 'image/png') && (
              <img src={URL.createObjectURL(value)} alt="Preview" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: '2px solid #BBF7D0' }} />
            )}
            {value.type === 'application/pdf' && (
              <div style={{ width: 52, height: 52, background: '#FEF2F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22 }}>📄</span>
              </div>
            )}
            <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>✓ {value.name}</span>
            <button type="button" onClick={ev => { ev.stopPropagation(); onChange(null); setTypeError('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <X size={12} /> Remove
            </button>
          </div>
        ) : (
          <>
            <div style={{ color: '#B3D9F5', marginBottom: 8 }}>{icon || <Upload size={28} style={{ margin: '0 auto' }} />}</div>
            <p style={{ fontSize: 13, color: '#546E7A', marginBottom: 4 }}>{hint || 'Click or drag to upload'}</p>
            <p style={{ fontSize: 11, color: '#9CA3AF' }}>Accepted: {formatAllowed(allowedTypes)}</p>
          </>
        )}
        <input ref={ref} type="file" accept={allowedTypes.join(',')} style={{ display: 'none' }} onChange={e => validate(e.target.files[0])} />
      </div>
      {typeError && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>⚠ {typeError}</p>}
    </div>
  )
}

// ── Normalise helpers ─────────────────────────────────────────────────────────
function normaliseProperty(p, listings, verifications) {
  const loc    = p.location || {}
  const linked = listings.find(l =>
    String(l.property) === String(p.id) || String(l.property?.id) === String(p.id)
  )
  const verif  = verifications.find(v =>
    String(v.property) === String(p.id) || String(v.property?.id) === String(p.id)
  )
  return {
    ...p,
    loc:            loc.neighborhood || loc.sub_city || '',
    type:           p.property_type?.name || p.property_type || '',
    beds:           p.bedrooms  ?? 0,
    baths:          p.bathrooms ?? 0,
    area:           p.area_sqm  ?? 0,
    price:          linked?.price        || 0,
    listing_type:   linked?.listing_type || 'sale',
    listing_id:     linked?.id           || null,
    listing_status: linked?.status       || null,
    img:            p.primary_image?.image_url || '',
    // Verification from backend — Rule 5
    verif_status:   verif?.status   || 'pending',
    verif_remarks:  verif?.remarks  || '',
    verif_id:       verif?.id       || null,
  }
}

function normaliseListing(l) {
  const prop = l.property || {}
  const loc  = (typeof prop === 'object' ? prop.location : null) || {}
  return {
    ...l,
    listing: l.listing_type || '',
    type:    prop.property_type?.name || prop.property_type || '',
    loc:     loc.neighborhood || loc.sub_city || '',
    beds:    prop.bedrooms  ?? 0,
    baths:   prop.bathrooms ?? 0,
    area:    prop.area_sqm  ?? 0,
    img:     l.primary_image?.image_url || '',
    status:  l.status || 'active',
    price:   l.price || 0,
  }
}

const TABS = [
  { id: 'properties', label: 'My Properties' },
  { id: 'saved',      label: 'Saved'         },
  { id: 'liked',      label: 'Liked'         },
  { id: 'verify',     label: 'Verification'  },
]

export default function UserProfile() {
  const { user, logout, submitVerification } = useAuth()
  const navigate  = useNavigate()
  const routeLoc  = useLocation()

  // Show properties tab first if user just submitted a new property
  const defaultTab = routeLoc.state?.newProperty ? 'properties' : 'properties'
  const [tab,           setTab]          = useState(defaultTab)
  const [myProps,       setMyProps]      = useState([])
  const [favorites,     setFavorites]    = useState([])
  const [allListings,   setAllListings]  = useState([])
  const [propsLoading,  setPropsLoading] = useState(true)
  const [favsLoading,   setFavsLoading]  = useState(true)

  const [idFile,         setIdFile]        = useState(null)
  const [faceFile,       setFaceFile]      = useState(null)
  const [verifyLoading,  setVerifyLoading] = useState(false)
  const [verifyDone,     setVerifyDone]    = useState(!!user?.idVerified)
  const [verifyError,    setVerifyError]   = useState('')

  // Fetch: own properties + all listings + verifications
  useEffect(() => {
    if (!user) return
    let cancelled = false
    setPropsLoading(true)
    Promise.all([getMyProperties(), getListings(), getVerifications()])
      .then(([props, listings, verifs]) => {
        if (cancelled) return
        const mine = (Array.isArray(props) ? props : [])
          .filter(p => String(p.owner) === String(user.id))
        const lArr = Array.isArray(listings) ? listings : []
        const vArr = Array.isArray(verifs)   ? verifs   : []
        setMyProps(mine.map(p => normaliseProperty(p, lArr, vArr)))
        setAllListings(lArr)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPropsLoading(false) })
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setFavsLoading(true)
    getFavorites()
      .then(data => { if (!cancelled) setFavorites(Array.isArray(data) ? data : []) })
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

  const isAccountVerified = verifyDone || user?.idVerified || user?.phone_verified

  const savedListings = favorites
    .map(fav => {
      const l = allListings.find(l =>
        String(l.id) === String(fav.property_listing) ||
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
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-ethio-primary flex items-center justify-center text-white text-3xl font-bold overflow-hidden select-none">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : (user?.name || user?.full_name || 'U')[0]?.toUpperCase()}
            </div>
            {isAccountVerified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                <CheckCircle size={14} style={{ color: '#fff' }} />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-ethio-ink">{user?.name || user?.full_name || 'Your Name'}</h1>
              {isAccountVerified && (
                <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 10px', background:'#DCFCE7', color:'#166534', fontSize:11, fontWeight:700, borderRadius:20 }}>
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-ethio-muted">{user?.email}</p>
            <p className="text-sm text-ethio-muted">{user?.phone || user?.phone_number}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to="/edit-profile" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-ethio-primary text-white text-xs font-semibold rounded-full hover:bg-ethio-primary-dark transition">
                <UserCog size={13} /> Edit profile
              </Link>
              <Link to="/add-property" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-ethio-accent text-white text-xs font-semibold rounded-full hover:opacity-90 transition">
                <Plus size={13} /> Add property
              </Link>
              <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-red-200 text-red-500 text-xs font-semibold rounded-full hover:bg-red-50 transition">
                <LogOut size={13} /> Log out
              </button>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap justify-center sm:justify-end">
            {[
              { label: 'Properties', value: myProps.length },
              { label: 'Verified',   value: myProps.filter(p => p.verif_status === 'verified').length },
              { label: 'Live',       value: myProps.filter(p => p.listing_status === 'active').length },
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
                tab === t.id ? 'border-ethio-primary text-ethio-primary' : 'border-transparent text-ethio-muted hover:text-ethio-ink'
              }`}>
              {t.label}
              {t.id === 'verify' && !isAccountVerified && (
                <span className="ml-2 inline-flex w-2 h-2 rounded-full bg-ethio-accent" />
              )}
            </button>
          ))}
        </div>

        {/* ── My Properties tab ── */}
        {tab === 'properties' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-ethio-ink">My properties</h2>
              <Link to="/add-property" className="inline-flex items-center gap-1.5 px-4 py-2 bg-ethio-primary text-white text-xs font-semibold rounded-full hover:bg-ethio-primary-dark transition">
                <Plus size={13} /> Add new
              </Link>
            </div>

            {propsLoading ? (
              <div className="flex justify-center py-12">
                <span className="inline-block w-8 h-8 border-4 border-ethio-primary/20 border-t-ethio-primary rounded-full animate-spin" />
              </div>
            ) : myProps.length === 0 ? (
              <EmptyState icon={<Plus size={36} />} text="No properties yet.">
                <Link to="/add-property" className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 bg-ethio-primary text-white text-sm font-semibold rounded-full">
                  <Plus size={14} /> Add your first property
                </Link>
              </EmptyState>
            ) : (
              <div className="space-y-4">
                {myProps.map(p => {
                  const vs   = VSTATUS[p.verif_status] || VSTATUS.pending
                  const VIcon = vs.icon
                  const ls   = p.listing_status ? (LISTING_STATUS[p.listing_status] || LISTING_STATUS.pending) : null

                  return (
                    <div key={p.id} className="border border-ethio-border rounded-2xl bg-white hover:border-ethio-primary/40 transition overflow-hidden">
                      <div className="flex items-start gap-4 p-4">
                        <div className="w-24 h-16 rounded-xl overflow-hidden bg-ethio-tint shrink-0">
                          {p.img ? <img src={p.img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-ethio-tint" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-bold text-ethio-ink leading-snug">{p.title}</p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Verification badge */}
                              <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:vs.bg, color:vs.color, whiteSpace:'nowrap' }}>
                                <VIcon size={11} /> {vs.label}
                              </span>
                              {/* Listing status badge */}
                              {ls && (
                                <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:ls.bg, color:ls.color, whiteSpace:'nowrap' }}>
                                  {ls.label}
                                </span>
                              )}
                            </div>
                          </div>
                          {p.price > 0 && (
                            <p className="text-sm font-bold text-ethio-primary">{formatPrice(Number(p.price), p.listing_type)}</p>
                          )}
                          {/* Verification guidance */}
                          <p style={{ fontSize: 11, color: '#6B7280', marginTop: 4, lineHeight: 1.5 }}>{vs.desc}</p>
                          {p.verif_status === 'rejected' && p.verif_remarks && (
                            <p style={{ fontSize: 11, color: '#991B1B', marginTop: 4, padding: '6px 10px', background: '#FEF2F2', borderRadius: 6 }}>
                              <strong>Remarks:</strong> {p.verif_remarks}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-4 py-3 border-t border-ethio-border bg-ethio-tint/30">
                        <Link to={`/add-property?edit=${p.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-ethio-border rounded-lg text-ethio-muted hover:text-ethio-primary hover:border-ethio-primary transition">
                          <Pencil size={13} /> Edit
                        </Link>
                        {/* Rule 6: only offer listing for verified properties */}
                        {p.verif_status === 'verified' && !p.listing_id && (
                          <Link to="/list-property"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-ethio-primary text-white rounded-lg hover:bg-ethio-primary-dark transition ml-auto">
                            Create listing →
                          </Link>
                        )}
                        {p.verif_status === 'verified' && p.listing_id && (
                          <Link to={`/property/${p.listing_id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-ethio-border rounded-lg text-ethio-muted hover:text-ethio-primary hover:border-ethio-primary transition ml-auto">
                            <Eye size={13} /> View listing
                          </Link>
                        )}
                        {p.verif_status === 'rejected' && (
                          <Link to={`/add-property?edit=${p.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition ml-auto">
                            Re-submit →
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Saved tab ── */}
        {tab === 'saved' && (
          <div>
            <h2 className="text-base font-bold text-ethio-ink mb-5">Saved properties</h2>
            {favsLoading
              ? <div className="flex justify-center py-12"><span className="inline-block w-8 h-8 border-4 border-ethio-primary/20 border-t-ethio-primary rounded-full animate-spin" /></div>
              : savedListings.length
                ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{savedListings.map(p => <PropertyCard key={p.id} property={p} showSave />)}</div>
                : <EmptyState icon={<Bookmark size={36} />} text="No saved properties yet." />}
          </div>
        )}

        {/* ── Liked tab ── */}
        {tab === 'liked' && (
          <div>
            <h2 className="text-base font-bold text-ethio-ink mb-5">Liked properties</h2>
            {likedListings.length
              ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{likedListings.map(p => <PropertyCard key={p.id} property={p} showHeart />)}</div>
              : <EmptyState icon={<Heart size={36} />} text="No liked properties yet." />}
          </div>
        )}

        {/* ── Verification tab ── */}
        {tab === 'verify' && (
          <div style={{ maxWidth: 520 }}>
            <h2 className="text-base font-bold text-ethio-ink mb-2">Verify your identity</h2>
            <p className="text-sm text-ethio-muted mb-6">Required to list properties and contact sellers.</p>
            {isAccountVerified ? (
              <div style={{ textAlign:'center', padding:'40px 0' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <CheckCircle size={32} style={{ color:'#16A34A' }} />
                </div>
                <p style={{ fontWeight:700, fontSize:16, color:'#111827' }}>Identity verified!</p>
                <p style={{ fontSize:13, color:'#6B7280' }}>You can list and contact without restrictions.</p>
              </div>
            ) : (
              <>
                {verifyError && <div style={{ marginBottom:14, padding:'10px 14px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, fontSize:13, color:'#DC2626' }}>{verifyError}</div>}
                <DocUpload label="ID document (Kebele ID or National ID)" hint="Click or drag to upload"
                  allowedTypes={ALLOWED_ID_TYPES} value={idFile} onChange={setIdFile} />
                <DocUpload label="Face photo — holding your ID" hint="Upload image file only"
                  allowedTypes={ALLOWED_FACE_TYPES} value={faceFile} onChange={setFaceFile} />
                <button onClick={handleVerify} disabled={verifyLoading}
                  style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background:verifyLoading?'#9CA3AF':'#01579B', color:'#fff', fontWeight:700, fontSize:15, cursor:verifyLoading?'not-allowed':'pointer' }}>
                  {verifyLoading
                    ? <span style={{ display:'inline-block', width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', verticalAlign:'middle' }} />
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
