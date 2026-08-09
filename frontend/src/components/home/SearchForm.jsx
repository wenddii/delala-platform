import { useState, useEffect, useRef } from 'react'
import { MapPin, Building2, Bed, Search, X, SlidersHorizontal } from 'lucide-react'
import { getListings } from '../../services/propertyService.js'

const QUICK_FILTERS = ['verified', 'furnished', 'parking', 'generator', 'elevator']

// Normalise backend listing shape to what the filter logic expects
function normalise(l) {
  const prop = l.property || {}
  const loc  = (typeof prop === 'object' ? prop.location : null) || {}
  return {
    ...l,
    listing:   l.listing_type    || '',
    type:      prop.property_type || '',
    loc:       loc.neighborhood  || loc.sub_city || '',
    beds:      prop.bedrooms     ?? 0,
    baths:     prop.bathrooms    ?? 0,
    area:      prop.area_sqm     ?? 0,
    img:       l.primary_image?.image_url || '',
    agent:     l.owner_name     || '',
    verified:  l.is_verified    ?? false,
    furnished: l.is_furnished   ?? false,
    parking:   l.has_parking    ?? false,
    generator: l.has_generator  ?? false,
    elevator:  l.has_elevator   ?? false,
    status:    l.status || 'active',
    price:     Number(l.price) || 0,
  }
}

export default function SearchForm({ onSearch }) {
  const [listingType,    setListingType]    = useState('rent')
  const [location,       setLocation]       = useState('bole')
  const [propType,       setPropType]       = useState('all')
  const [beds,           setBeds]           = useState('any')
  const [priceMin,       setPriceMin]       = useState(15)
  const [priceMax,       setPriceMax]       = useState(85)
  const [activeFilters,  setActiveFilters]  = useState(new Set(['verified']))
  const [allListings,    setAllListings]    = useState([])
  const [fetchError,     setFetchError]     = useState(false)

  // Fetch all listings once on mount; filter client-side (no server-side filter params)
  const fetchedRef = useRef(false)
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    getListings()
      .then(data => setAllListings(Array.isArray(data) ? data.map(normalise) : []))
      .catch(() => setFetchError(true))
  }, [])

  const handleMinChange = (v) => {
    const val = parseInt(v)
    setPriceMin(Math.min(val, priceMax - 5))
  }
  const handleMaxChange = (v) => {
    const val = parseInt(v)
    setPriceMax(Math.max(val, priceMin + 5))
  }

  const toggleFilter = (key) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const runSearch = (e) => {
    e?.preventDefault()
    const minSqm = Math.round(20 + (priceMin / 100) * 480)
    const maxSqm = priceMax >= 100 ? Infinity : Math.round(20 + (priceMax / 100) * 480)

    const results = allListings.filter(p => {
      if (p.status !== 'active' && p.status !== 'live') return false
      if (listingType !== 'all' && p.listing !== listingType) return false
      if (location !== 'all' && p.loc !== location) return false
      if (propType !== 'all' && p.type !== propType) return false
      if (beds !== 'any') {
        const b = parseInt(beds)
        if (b === 5 ? p.beds < 5 : p.beds < b) return false
      }
      if (p.area > 0 && p.area < minSqm) return false
      if (maxSqm !== Infinity && p.area > 0 && p.area > maxSqm) return false
      if (activeFilters.has('verified')  && !p.verified)  return false
      if (activeFilters.has('furnished') && !p.furnished) return false
      if (activeFilters.has('parking')   && !p.parking)   return false
      if (activeFilters.has('generator') && !p.generator) return false
      if (activeFilters.has('elevator')  && !p.elevator)  return false
      return true
    })

    const locLabel = location === 'all' ? 'all locations' : location.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const summary = `${listingType} in ${locLabel}` + (activeFilters.size ? ` · ${activeFilters.size} filter${activeFilters.size > 1 ? 's' : ''} applied` : '')
    onSearch({ items: results.slice(0, 6), summary, count: results.length, activeFilters: [...activeFilters], location: locLabel, type: listingType })
  }

  const handleReset = () => {
    setListingType('rent'); setLocation('bole'); setPropType('all')
    setBeds('any'); setPriceMin(15); setPriceMax(85)
    setActiveFilters(new Set(['verified']))
    onSearch(null)
  }

  const trackBg = `linear-gradient(90deg, #D6DEE3 0%, #D6DEE3 ${priceMin}%, #1B4F72 ${priceMin}%, #2E76A8 ${priceMax}%, #D6DEE3 ${priceMax}%, #D6DEE3 100%)`

  return (
    <div className="relative -mb-20 lg:-mb-24 z-30 reveal">
      <form onSubmit={runSearch} className="bg-white rounded-3xl shadow-soft-lg p-3 lg:p-4 border border-ethio-border max-w-6xl mx-auto">
        {/* Listing type tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-ethio-surface rounded-2xl mb-3 w-fit" role="tablist" aria-label="Listing type">
          {[['rent','For Rent'],['sale','For Sale'],['short','Short Stay']].map(([val, lbl]) => (
            <button key={val} type="button" role="tab"
              aria-selected={listingType === val}
              onClick={() => setListingType(val)}
              className={`pill-tab px-5 py-2 text-sm font-semibold rounded-xl ${listingType !== val ? 'text-ethio-muted hover:text-ethio-ink hidden sm:inline-block' : ''}`}>
              {lbl}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* Location */}
          <div className="lg:col-span-3">
            <label htmlFor="search-location" className="block text-[11px] font-semibold text-ethio-muted uppercase tracking-wider mb-1.5 ml-1">Location</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ethio-primary pointer-events-none" />
              <select id="search-location" value={location} onChange={e => { setLocation(e.target.value); runSearch() }}
                className="w-full pl-10 pr-4 py-3.5 bg-ethio-surface border border-ethio-border rounded-xl text-sm font-medium text-ethio-ink focus:outline-none focus:ring-2 focus:ring-ethio-primary/30 focus:border-ethio-primary appearance-none">
                <option value="all">All Locations</option>
                <option value="bole">Addis Ababa, Bole</option>
                <option value="cmc">Addis Ababa, CMC</option>
                <option value="sarbet">Addis Ababa, Sarbet</option>
                <option value="kazanchis">Addis Ababa, Kazanchis</option>
                <option value="4kilo">Addis Ababa, 4 Kilo</option>
                <option value="adama">Adama</option>
                <option value="bahir-dar">Bahir Dar</option>
                <option value="hawassa">Hawassa</option>
                <option value="dire-dawa">Dire Dawa</option>
              </select>
            </div>
          </div>

          {/* Property Type */}
          <div className="lg:col-span-2">
            <label htmlFor="search-property-type" className="block text-[11px] font-semibold text-ethio-muted uppercase tracking-wider mb-1.5 ml-1">Property Type</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ethio-primary pointer-events-none" />
              <select id="search-property-type" value={propType} onChange={e => { setPropType(e.target.value); runSearch() }}
                className="w-full pl-10 pr-4 py-3.5 bg-ethio-surface border border-ethio-border rounded-xl text-sm font-medium text-ethio-ink focus:outline-none focus:ring-2 focus:ring-ethio-primary/30 focus:border-ethio-primary appearance-none">
                <option value="all">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="condo">Condo</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="lg:col-span-2">
            <label htmlFor="search-beds" className="block text-[11px] font-semibold text-ethio-muted uppercase tracking-wider mb-1.5 ml-1">Bedrooms</label>
            <div className="relative">
              <Bed size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ethio-primary pointer-events-none" />
              <select id="search-beds" value={beds} onChange={e => { setBeds(e.target.value); runSearch() }}
                className="w-full pl-10 pr-4 py-3.5 bg-ethio-surface border border-ethio-border rounded-xl text-sm font-medium text-ethio-ink focus:outline-none focus:ring-2 focus:ring-ethio-primary/30 focus:border-ethio-primary appearance-none">
                <option value="any">Any</option>
                <option value="1">1+</option><option value="2">2+</option>
                <option value="3">3+</option><option value="4">4+</option><option value="5">5+</option>
              </select>
            </div>
          </div>

          {/* Size Range (m²) */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-semibold text-ethio-muted uppercase tracking-wider mb-1.5 ml-1">Size Range (m²)</label>
            <div className="bg-ethio-surface border border-ethio-border rounded-xl px-3 py-3">
              <div className="flex items-center justify-between text-xs font-semibold text-ethio-ink mb-2">
                <span>{Math.round(20 + (priceMin / 100) * 480)} m²</span>
                <span>to {priceMax >= 100 ? '500+ m²' : Math.round(20 + (priceMax / 100) * 480) + ' m²'}</span>
              </div>
              <div className="relative h-6 flex items-center">
                <div className="price-track absolute inset-x-0 top-1/2 -translate-y-1/2" style={{ background: trackBg }} />
                <input type="range" min="0" max="100" value={priceMin}
                  onChange={e => handleMinChange(e.target.value)}
                  className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none z-10 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-ethio-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer" />
                <input type="range" min="0" max="100" value={priceMax}
                  onChange={e => handleMaxChange(e.target.value)}
                  className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-ethio-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Search button */}
          <div className="lg:col-span-2">
            <button type="submit" className="w-full h-[52px] bg-gradient-to-br from-ethio-primary to-ethio-primary-dark text-white font-semibold rounded-xl shadow-glow hover:shadow-soft-lg transition btn-shine flex items-center justify-center gap-2">
              <Search size={16} /><span>Search</span>
            </button>
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-ethio-border">
          <span className="text-xs text-ethio-muted font-medium">Quick:</span>
          {QUICK_FILTERS.map(key => {
            const on = activeFilters.has(key)
            const labels = { verified: 'Verified only', furnished: 'Furnished', parking: 'Parking', generator: 'Generator', elevator: 'Elevator' }
            return (
              <button key={key} type="button" onClick={() => toggleFilter(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${on ? 'bg-ethio-primary text-white' : 'bg-ethio-surface text-ethio-muted hover:bg-ethio-tint hover:text-ethio-primary'}`}>
                {on ? '✓ ' : ''}{labels[key]}
              </button>
            )
          })}
          <button type="button" onClick={handleReset} className="ml-auto text-xs text-ethio-muted hover:text-ethio-primary font-semibold flex items-center gap-1 transition-all">
            <X size={12} /> Reset
          </button>
          <button type="button" className="text-xs text-ethio-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            More filters <SlidersHorizontal size={14} />
          </button>
        </div>

        {fetchError && (
          <p className="text-xs text-red-500 mt-2 text-center">
            Could not load listings — search results may be empty. The server may be waking up (30–60 s).
          </p>
        )}
      </form>
    </div>
  )
}
