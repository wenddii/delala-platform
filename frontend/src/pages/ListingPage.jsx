import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getMyProperties } from '../services/propertyService.js'
import { getListings } from '../services/propertyService.js'
import { parseDRFError } from '../services/api.js'
import { formatPrice } from '../data/properties.js'

// Build a display-friendly property object from backend shapes.
// getMyProperties() returns Property records; each may have associated Listings
// we join by property id. We show each property (not listing) here so the user
// selects which ones to list.
function normaliseProperty(p) {
  const loc = p.location || {}
  return {
    ...p,
    loc:     loc.neighborhood || loc.sub_city || '',
    type:    p.property_type  || p.type || '',
    beds:    p.bedrooms  ?? p.beds  ?? 0,
    baths:   p.bathrooms ?? p.baths ?? 0,
    area:    p.area_sqm  ?? p.area  ?? 0,
    // price and listing come from the associated listing, if any
    price:   p.price   || 0,
    listing: p.listing_type || p.listing || 'sale',
    img:     p.primary_image?.image_url || p.img || '',
    status:  p.status || 'active',
  }
}

export default function ListingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [selected,   setSelected]   = useState(new Set())

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    setError('')

    // Fetch all properties owned by this user.
    // getMyProperties() returns all properties (no owner filter on server) —
    // filter client-side by owner id.
    Promise.all([getMyProperties(), getListings()])
      .then(([props, listings]) => {
        if (cancelled) return
        const myProps = (Array.isArray(props) ? props : [])
          .filter(p => String(p.owner) === String(user.id))
        // Attach price/listing_type from the first associated listing, if found
        const enriched = myProps.map(p => {
          const linked = (Array.isArray(listings) ? listings : [])
            .find(l => String(l.property) === String(p.id) ||
                       String(l.property?.id) === String(p.id))
          return normaliseProperty({ ...p, ...(linked ? { price: linked.price, listing_type: linked.listing_type, listing_id: linked.id } : {}) })
        })
        setProperties(enriched)
      })
      .catch(err => { if (!cancelled) setError(parseDRFError(err)) })
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user])

  const toggle = (id) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const selCount = selected.size

  const handleContinue = () => {
    if (selected.size === 0) return
    const selectedProps = properties.filter(p => selected.has(p.id))
    navigate('/payment', { state: { selectedIds: [...selected], selectedProps } })
  }

  const handleSaveExit = () => navigate('/profile')

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-ethio-ink">Choose properties to list</h1>
          <button onClick={handleSaveExit}
            className="px-4 py-1.5 bg-ethio-accent text-white text-xs font-semibold rounded-full hover:opacity-90 transition">
            Save &amp; exit
          </button>
        </div>
        <p className="text-sm text-ethio-muted mb-6">Select properties to list and continue with payment.</p>

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
            <div className="space-y-3 mb-6">
              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-ethio-muted mb-4">No properties yet. Add one first.</p>
                  <Link to="/add-property"
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-ethio-primary text-white text-sm font-semibold rounded-full hover:bg-ethio-primary-dark transition">
                    + Add property
                  </Link>
                </div>
              ) : properties.map(p => {
                const isSelected = selected.has(p.id)
                return (
                  <div key={p.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition ${isSelected ? 'border-ethio-primary bg-ethio-tint' : 'border-ethio-border bg-white hover:border-ethio-primary/40'}`}>
                    <div className="flex-1 flex items-center gap-4 cursor-pointer min-w-0"
                      onClick={() => toggle(p.id)} role="checkbox" aria-checked={isSelected} tabIndex={0}
                      onKeyDown={e => e.key === ' ' && toggle(p.id)}>
                      <div className="w-14 h-10 rounded-lg bg-ethio-tint overflow-hidden shrink-0">
                        {p.img && <img src={p.img} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-ethio-ink truncate">{p.title}</p>
                        <p className="text-xs text-ethio-muted">
                          {p.price ? formatPrice(Number(p.price), p.listing) : 'Price not set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Link to={`/add-property?edit=${p.id}`}
                        className="w-8 h-8 rounded-lg border border-ethio-border flex items-center justify-center text-ethio-muted hover:text-ethio-primary hover:border-ethio-primary transition shrink-0"
                        title="Edit this property" onClick={e => e.stopPropagation()}>
                        <Pencil size={14} />
                      </Link>
                      <div onClick={() => toggle(p.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition cursor-pointer ${isSelected ? 'bg-ethio-primary border-ethio-primary' : 'border-ethio-border bg-white'}`}>
                        {isSelected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between text-sm text-ethio-muted mb-4">
              <span>{selCount} of {properties.length} selected</span>
              <span className="font-bold text-ethio-ink">
                <span className="text-ethio-primary">{selCount}</span> selected
              </span>
            </div>

            <button
              onClick={handleContinue}
              disabled={selCount === 0}
              className="w-full py-3.5 bg-ethio-primary text-white font-semibold rounded-xl hover:bg-ethio-primary-dark transition disabled:opacity-40 text-sm"
            >
              Continue to payment
            </button>
          </>
        )}
      </main>
    </div>
  )
}
