/**
 * ListingPage.jsx
 *
 * Business rules implemented:
 *  - Rule 6: A property must be VERIFIED before it can be listed.
 *    Only properties with verif_status === 'verified' AND no existing active listing
 *    are selectable here. Pending and rejected properties are displayed with their
 *    status but cannot be selected.
 *  - Rule 6: Creating a listing happens here (not in AddProperty).
 *    After the user picks a plan on PaymentPage and "pays", the listing is created.
 *  - Rule 7: Payment is a future TODO; for now we create the listing immediately
 *    and mark its status as 'active'. The payment step is preserved in the flow.
 */
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Pencil, Clock, XCircle, CheckCircle, Lock } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getMyProperties, getListings, getVerifications } from '../services/propertyService.js'
import { parseDRFError } from '../services/api.js'
import { formatPrice } from '../data/properties.js'

// Verification status config for display
const VS = {
  pending:  { label: 'Pending review', bg: '#FEF9C3', color: '#854D0E', icon: Clock       },
  verified: { label: 'Verified',       bg: '#DCFCE7', color: '#166534', icon: CheckCircle  },
  rejected: { label: 'Rejected',       bg: '#FEE2E2', color: '#991B1B', icon: XCircle      },
}

function normalise(p, listings, verifs) {
  const loc    = p.location || {}
  const linked = listings.find(l =>
    String(l.property) === String(p.id) || String(l.property?.id) === String(p.id)
  )
  const verif = verifs.find(v =>
    String(v.property) === String(p.id) || String(v.property?.id) === String(p.id)
  )
  return {
    ...p,
    loc:           loc.neighborhood || loc.sub_city || '',
    type:          p.property_type?.name || p.property_type || '',
    beds:          p.bedrooms  ?? 0,
    baths:         p.bathrooms ?? 0,
    area:          p.area_sqm  ?? 0,
    img:           p.primary_image?.image_url || '',
    // Listing data
    listing_id:     linked?.id           || null,
    listing_status: linked?.status       || null,
    price:          linked?.price        || 0,
    listing_type:   linked?.listing_type || 'sale',
    // Verification — Rule 5/6
    verif_status:   verif?.status  || 'pending',
    verif_remarks:  verif?.remarks || '',
    // Selectable only if verified AND not already listed
    selectable: (verif?.status === 'verified') && !linked,
  }
}

export default function ListingPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [properties, setProperties] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [selected,   setSelected]   = useState(new Set())

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([getMyProperties(), getListings(), getVerifications()])
      .then(([props, listings, verifs]) => {
        if (cancelled) return
        const mine = (Array.isArray(props) ? props : [])
          .filter(p => String(p.owner) === String(user.id))
        const lArr = Array.isArray(listings) ? listings : []
        const vArr = Array.isArray(verifs)   ? verifs   : []
        setProperties(mine.map(p => normalise(p, lArr, vArr)))
      })
      .catch(err => { if (!cancelled) setError(parseDRFError(err)) })
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user])

  const toggle = (id) => {
    const prop = properties.find(p => p.id === id)
    if (!prop?.selectable) return          // block non-verified
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleContinue = () => {
    if (selected.size === 0) return
    const selectedProps = properties.filter(p => selected.has(p.id))
    navigate('/payment', { state: { selectedIds: [...selected], selectedProps } })
  }

  const selectable = properties.filter(p => p.selectable)
  const selCount   = selected.size

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-ethio-ink">Create a listing</h1>
          <button onClick={() => navigate('/profile')}
            className="px-4 py-1.5 bg-ethio-accent text-white text-xs font-semibold rounded-full hover:opacity-90 transition">
            Back to profile
          </button>
        </div>

        {/* Rule 6 info */}
        <div className="flex gap-3 items-start p-4 mb-6 bg-ethio-tint border border-ethio-border rounded-xl text-sm text-ethio-muted">
          <Lock size={16} className="text-ethio-primary shrink-0 mt-0.5" />
          <p>Only <strong className="text-ethio-ink">verified</strong> properties can be listed. Pending and rejected properties must complete the verification process first.</p>
        </div>

        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <span className="inline-block w-8 h-8 border-4 border-ethio-primary/20 border-t-ethio-primary rounded-full animate-spin" />
            <p className="text-sm text-ethio-muted">Loading your properties…</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button onClick={() => window.location.reload()}
              className="px-4 py-2 bg-ethio-primary text-white text-xs font-semibold rounded-full">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-ethio-muted mb-4">No properties yet. Add one first.</p>
                <Link to="/add-property"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-ethio-primary text-white text-sm font-semibold rounded-full hover:bg-ethio-primary-dark transition">
                  + Add property
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {properties.map(p => {
                    const vs        = VS[p.verif_status] || VS.pending
                    const VIcon     = vs.icon
                    const isSelected = selected.has(p.id)
                    const blocked    = !p.selectable

                    return (
                      <div key={p.id}
                        onClick={() => toggle(p.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition
                          ${blocked
                            ? 'border-ethio-border bg-gray-50 cursor-not-allowed opacity-70'
                            : isSelected
                              ? 'border-ethio-primary bg-ethio-tint cursor-pointer'
                              : 'border-ethio-border bg-white hover:border-ethio-primary/40 cursor-pointer'}`}>

                        {/* Thumbnail */}
                        <div className="w-14 h-10 rounded-lg bg-ethio-tint overflow-hidden shrink-0">
                          {p.img && <img src={p.img} alt="" className="w-full h-full object-cover" />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-ethio-ink truncate">{p.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700, background:vs.bg, color:vs.color }}>
                              <VIcon size={10} /> {vs.label}
                            </span>
                            {p.listing_id && (
                              <span style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700, background:'#DBEAFE', color:'#1D4ED8' }}>
                                Already listed
                              </span>
                            )}
                            {p.verif_status === 'rejected' && p.verif_remarks && (
                              <span className="text-[10px] text-red-600 truncate max-w-[200px]">{p.verif_remarks}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {blocked ? (
                            <Link to={`/add-property?edit=${p.id}`}
                              onClick={e => e.stopPropagation()}
                              className="w-8 h-8 rounded-lg border border-ethio-border flex items-center justify-center text-ethio-muted hover:text-ethio-primary hover:border-ethio-primary transition"
                              title="Edit property">
                              <Pencil size={14} />
                            </Link>
                          ) : (
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${isSelected ? 'bg-ethio-primary border-ethio-primary' : 'border-ethio-border bg-white'}`}>
                              {isSelected && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {selectable.length === 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-6">
                    None of your properties are eligible for listing yet. Properties must be <strong>verified</strong> by our team before they can be listed.
                    <Link to="/add-property" className="block mt-2 font-semibold underline">Add a new property →</Link>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-ethio-muted mb-4">
                  <span>{selCount} of {selectable.length} eligible selected</span>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={selCount === 0}
                  className="w-full py-3.5 bg-ethio-primary text-white font-semibold rounded-xl hover:bg-ethio-primary-dark transition disabled:opacity-40 text-sm">
                  Continue to listing plan →
                </button>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
