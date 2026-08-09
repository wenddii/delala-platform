import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, ChevronLeft, ChevronRight, ArrowRight,
  MapPin, Bed, Bath, Ruler, Heart, Check,
} from 'lucide-react'
import { getListings } from '../../services/propertyService.js'
import { formatPrice } from '../../data/properties.js'

// Normalise backend listing shape to what this component needs
function normalise(l) {
  const prop = l.property || {}
  const loc  = (typeof prop === 'object' ? prop.location : null) || {}
  return {
    ...l,
    listing:   l.listing_type || '',
    type:      prop.property_type || '',
    loc:       loc.neighborhood || loc.sub_city || '',
    beds:      prop.bedrooms  ?? 0,
    baths:     prop.bathrooms ?? 0,
    area:      prop.area_sqm  ?? 0,
    img:       l.primary_image?.image_url || '',
    agent:     l.owner_name  || '',
    verified:  l.is_verified ?? false,
    furnished: l.is_furnished ?? false,
    status:    l.status || 'active',
    price:     Number(l.price) || 0,
  }
}

export default function FeaturedListings() {
  const [activeTab, setActiveTab] = useState('all')
  const [listings,  setListings]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const trackRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    getListings()
      .then(data => { if (!cancelled) setListings(Array.isArray(data) ? data.map(normalise) : []) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const slide = (dir) => {
    const track = trackRef.current
    if (!track) return
    const cardW = (track.querySelector('article')?.offsetWidth ?? 360) + 20
    track.scrollBy({ left: dir === 'left' ? -cardW : cardW, behavior: 'smooth' })
  }

  const filtered = listings
    .filter(p => {
      if (p.status !== 'active' && p.status !== 'live') return false
      if (activeTab === 'all') return true
      return p.listing === activeTab
    })
    .slice(0, 8)

  return (
    <section id="properties" className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 reveal">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-ethio-tint text-ethio-primary text-xs font-bold rounded-full mb-3 border border-ethio-primary/10">
              <Sparkles size={12} /> FEATURED PROPERTIES
            </div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-ethio-ink">
              Hand-picked premium{' '}
              <span className="gradient-text-primary">listings</span>
            </h2>
            <p className="text-ethio-muted mt-2 max-w-xl">
              Verified properties, vetted Delalas, transparent pricing — all in one place.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-end">
            <button onClick={() => slide('left')}
              className="w-10 h-10 rounded-full border border-ethio-border hover:border-ethio-primary hover:text-ethio-primary flex items-center justify-center transition"
              aria-label="Scroll left"><ChevronLeft size={16} /></button>
            <button onClick={() => slide('right')}
              className="w-10 h-10 rounded-full border border-ethio-border hover:border-ethio-primary hover:text-ethio-primary flex items-center justify-center transition"
              aria-label="Scroll right"><ChevronRight size={16} /></button>
            <Link to="/properties" className="ml-2 text-sm font-semibold text-ethio-primary flex items-center gap-1.5 hover:gap-2.5 transition-all">
              View all <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Listing-type tabs */}
        <div className="flex items-center gap-2 mb-6 reveal">
          {[
            { key: 'all',  label: 'All Properties' },
            { key: 'rent', label: 'For Rent'        },
            { key: 'sale', label: 'For Sale'        },
          ].map(tab => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition ${
                activeTab === tab.key
                  ? 'bg-ethio-primary text-white shadow-soft'
                  : 'bg-white border border-ethio-border text-ethio-muted hover:border-ethio-primary hover:text-ethio-primary'
              }`}>
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-ethio-muted">
            {loading ? '…' : `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'}`}
          </span>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <span className="inline-block w-8 h-8 border-4 border-ethio-primary/20 border-t-ethio-primary rounded-full animate-spin" />
            <span className="text-sm text-ethio-muted">Loading listings…</span>
          </div>
        )}

        {/* Carousel */}
        {!loading && (
          <div className="overflow-x-auto no-scrollbar -mx-4 lg:-mx-6 px-4 lg:px-6 reveal">
            {filtered.length === 0 ? (
              <p className="text-center py-12 text-ethio-muted text-sm">No listings available yet.</p>
            ) : (
              <div className="flex gap-5 pb-4" ref={trackRef}>
                {filtered.map(p => (
                  <article key={p.id}
                    className="min-w-[320px] sm:min-w-[360px] bg-white rounded-2xl overflow-hidden border border-ethio-border card-3d glow-ring flex-shrink-0">
                    <Link to={`/property/${p.id}`} className="block">
                      <div className="relative h-56 img-zoom overflow-hidden">
                        {p.img
                          ? <img src={p.img} className="w-full h-full object-cover" alt={p.title} loading="lazy" />
                          : <div className="w-full h-full bg-ethio-tint" />}

                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className={`px-2.5 py-1 text-white text-[11px] font-bold rounded-md ${
                            p.listing === 'rent' ? 'bg-ethio-primary' : 'bg-ethio-for-sale'
                          }`}>
                            {p.listing === 'rent' ? 'FOR RENT' : 'FOR SALE'}
                          </span>
                          {p.furnished && (
                            <span className="px-2.5 py-1 bg-ethio-ink/80 text-white text-[11px] font-bold rounded-md">FURNISHED</span>
                          )}
                        </div>

                        {p.verified && (
                          <div className="absolute top-3 right-3 verified-badge p-1.5 rounded-md pulse-ring">
                            <Check size={14} className="text-white" />
                          </div>
                        )}

                        <button
                          className="absolute bottom-3 right-3 w-9 h-9 bg-white/95 backdrop-blur rounded-full flex items-center justify-center transition text-ethio-muted hover:text-red-500"
                          aria-label="Save property"
                          onClick={e => e.preventDefault()}>
                          <Heart size={16} />
                        </button>
                      </div>
                    </Link>

                    <div className="p-5">
                      <Link to={`/property/${p.id}`}>
                        <h3 className="font-display font-bold text-ethio-ink text-lg leading-snug mb-1.5 hover:text-ethio-primary transition line-clamp-1">
                          {p.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1 text-xs text-ethio-muted mb-3">
                        <MapPin size={12} />
                        <span className="capitalize">{p.loc?.replace(/-/g, ' ') || 'Ethiopia'}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-ethio-muted pb-3 mb-3 border-b border-ethio-border">
                        {p.beds > 0 && (
                          <span className="flex items-center gap-1.5"><Bed size={14} className="text-ethio-primary" /> {p.beds} Beds</span>
                        )}
                        {p.baths > 0 && (
                          <span className="flex items-center gap-1.5"><Bath size={14} className="text-ethio-primary" /> {p.baths} Baths</span>
                        )}
                        {p.area > 0 && (
                          <span className="flex items-center gap-1.5"><Ruler size={14} className="text-ethio-primary" /> {p.area} m²</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-display font-bold text-ethio-primary text-xl">
                            {formatPrice(p.price, p.listing)}
                          </div>
                          <div className="text-[10px] text-ethio-muted">
                            {p.listing === 'rent' ? 'negotiable' : 'title deed ready'}
                          </div>
                        </div>
                        {p.agent && (
                          <div className="text-right">
                            <div className="text-[11px] font-semibold text-ethio-ink">{p.agent}</div>
                            <div className="text-ethio-accent text-[10px]">★★★★★</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
