import { useState, useEffect } from 'react'
import { useSearchParams, useLocation, Link } from 'react-router-dom'
import { CheckCircle, X } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import { getListings, getPropertyImages } from '../services/propertyService.js'
import { parseDRFError } from '../services/api.js'

export default function Properties() {
  const [searchParams] = useSearchParams()
  const [activeTab,  setActiveTab]  = useState('sale')
  const [showBanner, setShowBanner] = useState(false)
  const [listings,   setListings]   = useState([])
  const [images,     setImages]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const location = useLocation()

  const qParam    = searchParams.get('q')    || ''
  const typeParam = searchParams.get('type') || ''

  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setShowBanner(true)
      const t = setTimeout(() => setShowBanner(false), 6000)
      return () => clearTimeout(t)
    }
  }, [location.state])

  useEffect(() => {
    if (searchParams.get('listing') === 'rent') setActiveTab('rent')
  }, [searchParams])

  // Fetch all listings + images once; filter client-side (no server-side filter params)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([getListings(), getPropertyImages()])
      .then(([lData, iData]) => {
        if (cancelled) return
        setListings(Array.isArray(lData) ? lData : [])
        setImages(Array.isArray(iData) ? iData : [])
      })
      .catch(err  => { if (!cancelled) setError(parseDRFError(err)) })
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Rule 11: public browse must ONLY show active listings.
  // 'active' is the only valid published status per the business rules.
  // Images live on the separate /api/properties/images/ endpoint — the
  // listings response never nests them (confirmed via Django admin).
  const normalise = (l) => {
    const propId = l.property?.id ?? l.property
    const myImages = images.filter(img =>
      String(img.property) === String(propId) || String(img.property?.id) === String(propId)
    )
    const primaryImg = myImages.find(img => img.is_primary) || myImages[0]
    return {
      ...l,
      listing: l.listing_type || l.listing || '',
      type:    l.property?.property_type?.name || l.property?.property_type || l.type || '',
      loc:     l.property?.location?.neighborhood || l.property?.location?.sub_city || l.loc || '',
      img:     primaryImg?.image_url || l.img || '',
      status:  l.status || '',
    }
  }

  const filtered = listings.map(normalise).filter(p => {
    if (p.status !== 'active') return false   // strict — pending/rejected/inactive never shown
    if (p.listing !== activeTab) return false
    if (typeParam && p.type !== typeParam) return false
    if (qParam) {
      const q = qParam.toLowerCase()
      if (!p.title?.toLowerCase().includes(q) && !p.loc?.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {showBanner && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">🎉 Your property is now live!</p>
                <p className="text-xs text-green-700 mt-0.5">Payment confirmed. Your listing is visible to buyers and tenants across Ethiopia.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/profile" className="text-xs font-semibold text-green-700 underline hover:text-green-900">View my listings</Link>
              <button onClick={() => setShowBanner(false)} className="text-green-500 hover:text-green-700" aria-label="Dismiss"><X size={16} /></button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          {['sale', 'rent'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                activeTab === tab ? 'bg-ethio-primary text-white shadow-card' : 'bg-ethio-tint text-ethio-ink hover:bg-ethio-border'
              }`}>
              {tab === 'sale' ? 'For sale' : 'For rent'}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="inline-block w-10 h-10 border-4 border-ethio-primary/20 border-t-ethio-primary rounded-full animate-spin" />
            <p className="text-sm text-ethio-muted">Loading listings… (first load may take 30–60 s)</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-base font-semibold text-red-600 mb-2">Could not load listings</p>
            <p className="text-sm text-ethio-muted mb-4">{error}</p>
            <button onClick={() => window.location.reload()}
              className="px-5 py-2 bg-ethio-primary text-white text-sm font-semibold rounded-full hover:bg-ethio-primary-dark transition">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <h2 className="text-2xl font-bold text-ethio-ink mb-6">
              <span className="text-ethio-primary">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'Property' : 'Properties'} found
            </h2>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
              </div>
            ) : (
              <div className="text-center py-20 text-ethio-muted">
                <p className="text-lg font-medium">No properties found</p>
                <p className="text-sm mt-1">Try adjusting your search or filter.</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
