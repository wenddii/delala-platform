import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Ruler, Phone, MessageCircle } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getListing } from '../services/propertyService.js'
import { parseDRFError } from '../services/api.js'
import { formatPrice } from '../data/properties.js'
import { useAuth } from '../context/AuthContext.jsx'

// Normalise backend listing shape → UI shape
function normalise(l) {
  const prop = l.property || {}
  const loc  = prop.location || {}
  return {
    ...l,
    listing:   l.listing_type  || l.listing  || '',
    type:      prop.property_type || l.type  || '',
    loc:       loc.neighborhood || loc.sub_city || l.loc || '',
    beds:      prop.bedrooms   ?? l.beds   ?? 0,
    baths:     prop.bathrooms  ?? l.baths  ?? 0,
    area:      prop.area_sqm   ?? l.area   ?? 0,
    img:       l.primary_image?.image_url || l.img || '',
    agent:     l.owner_name    || l.agent  || '',
    verified:  l.is_verified   ?? l.verified ?? false,
    agentPhone:l.owner_phone   || l.agentPhone || '',
  }
}

export default function PropertyDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [property, setProperty] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getListing(id)
      .then(data => { if (!cancelled) setProperty(normalise(data)) })
      .catch(err  => { if (!cancelled) setError(parseDRFError(err)) })
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  // Rule 16/20: user cannot contact their own listing's owner
  const isOwnListing = user && property &&
    (String(property.owner) === String(user.id) ||
     String(property.owner?.id) === String(user.id))

  // Rule 11/17: contact is only available on active listings
  const isActive = property?.status === 'active'

  const handleContact = (type) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/property/${id}` } })
      return
    }
    if (type === 'message') navigate(`/chat/${id}`)
    else if (type === 'call') window.location.href = `tel:${property.agentPhone || '+251912345678'}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <span className="inline-block w-10 h-10 border-4 border-ethio-primary/20 border-t-ethio-primary rounded-full animate-spin" />
          <p className="text-sm text-ethio-muted">Loading property… (first load may take 30–60 s)</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-ethio-muted gap-3">
          <p className="text-xl font-semibold">{error || 'Property not found'}</p>
          <Link to="/properties" className="text-ethio-primary hover:underline text-sm">← Back to listings</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        {/* ── Image gallery ── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="relative rounded-xl overflow-hidden aspect-[4/3] col-span-1">
            <span className="absolute top-3 left-3 z-10 px-3 py-1 bg-ethio-primary text-white text-xs font-bold rounded-md">
              {property.listing === 'sale' ? 'For sale' : 'For rent'}
            </span>
            {property.img
              ? <img src={property.img} alt={property.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-ethio-tint" />}
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl overflow-hidden aspect-[2/1] bg-ethio-tint flex-1">
              {property.img && <img src={property.img} alt="" className="w-full h-full object-cover opacity-70" />}
            </div>
            <div className="rounded-xl overflow-hidden aspect-[2/1] bg-ethio-tint flex-1">
              {property.img && <img src={property.img} alt="" className="w-full h-full object-cover opacity-50" />}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Left: details ── */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold text-ethio-ink mb-1">{property.title}</h1>
            <p className="flex items-center gap-1 text-sm text-ethio-muted mb-2">
              <MapPin size={14} /> {property.loc}
            </p>
            <div className="flex items-center gap-4 text-sm text-ethio-muted mb-3">
              {property.beds > 0 && (
                <span className="flex items-center gap-1"><Bed size={14} /> {property.beds} Beds</span>
              )}
              {property.baths > 0 && (
                <span className="flex items-center gap-1"><Bath size={14} /> {property.baths} Baths</span>
              )}
              {property.area > 0 && (
                <span className="flex items-center gap-1"><Ruler size={14} /> {property.area} m²</span>
              )}
            </div>
            <p className="text-2xl font-bold text-ethio-primary mb-6">
              {formatPrice(Number(property.price) || 0, property.listing)}
            </p>

            {property.description && (
              <p className="text-sm text-ethio-muted mb-6 leading-relaxed">{property.description}</p>
            )}

            {/* Map placeholder */}
            <div className="w-full rounded-xl overflow-hidden bg-ethio-tint aspect-[16/9]">
              <iframe
                title="Property location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent((property.loc || 'Addis Ababa') + ', Ethiopia')}&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* ── Right: seller card ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-ethio-border rounded-2xl p-5 shadow-card sticky top-24">
              <div className="flex flex-col items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-ethio-primary flex items-center justify-center text-white text-xl font-bold mb-2">
                  {property.agent?.[0]?.toUpperCase() ?? 'B'}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <p className="font-bold text-ethio-ink text-sm">{property.agent || 'Property Owner'}</p>
                    {property.verified && (
                      <span className="px-2 py-0.5 bg-ethio-verified text-white text-[10px] font-bold rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rule 20/21: owner cannot contact themselves */}
              {isOwnListing ? (
                <p className="text-center text-xs text-ethio-muted py-2">
                  This is your listing. Manage it from your <Link to="/profile" className="text-ethio-primary font-semibold underline">profile</Link>.
                </p>
              ) : !isActive ? (
                <p className="text-center text-xs text-ethio-muted py-2">
                  This listing is not currently available for contact.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleContact('message')}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-ethio-primary text-white text-sm font-semibold rounded-xl hover:bg-ethio-primary-dark transition"
                  >
                    <MessageCircle size={15} /> Message
                  </button>
                  <button
                    onClick={() => handleContact('call')}
                    className="flex items-center justify-center gap-1.5 py-2.5 border border-ethio-border text-ethio-ink text-sm font-semibold rounded-xl hover:border-ethio-primary hover:text-ethio-primary transition"
                  >
                    <Phone size={15} /> Call
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
