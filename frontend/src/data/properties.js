// status: 'live' | 'pending_payment' | 'under_review' | 'rejected'
export const propertyDB = [
  { id: 1,  ownerId: 'seed', title: '3BR Modern Apartment in Bole',  loc: 'bole',      type: 'apartment',  beds: 3, baths: 2, area: 120, price: 45000,     listing: 'rent', status: 'live', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', agent: 'Selam T.',      verified: true,  furnished: true,  parking: true,  generator: true,  elevator: true },
  { id: 2,  ownerId: 'seed', title: '4BR Luxury Villa in CMC',        loc: 'cmc',       type: 'villa',      beds: 4, baths: 3, area: 280, price: 12500000,  listing: 'sale', status: 'live', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', agent: 'Dawit M.',      verified: true,  furnished: true,  parking: true,  generator: true,  elevator: false },
  { id: 3,  ownerId: 'seed', title: '2BR Garden Condo, Sarbet',       loc: 'sarbet',    type: 'condo',      beds: 2, baths: 1, area: 95,  price: 28000,     listing: 'rent', status: 'live', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', agent: 'Eyerusalem A.', verified: true,  furnished: true,  parking: true,  generator: false, elevator: false },
  { id: 4,  ownerId: 'seed', title: 'Studio Loft in Kazanchis',       loc: 'kazanchis', type: 'apartment',  beds: 1, baths: 1, area: 55,  price: 18500,     listing: 'rent', status: 'live', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', agent: 'Yonas B.',      verified: true,  furnished: false, parking: true,  generator: false, elevator: true },
  { id: 5,  ownerId: 'seed', title: '5BR Family House, 4 Kilo',       loc: '4kilo',     type: 'house',      beds: 5, baths: 4, area: 420, price: 32000000,  listing: 'sale', status: 'live', img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', agent: 'Hanna G.',      verified: true,  furnished: false, parking: true,  generator: true,  elevator: false },
  { id: 6,  ownerId: 'seed', title: '1BR Furnished Flat, Bole',       loc: 'bole',      type: 'apartment',  beds: 1, baths: 1, area: 62,  price: 22000,     listing: 'rent', status: 'live', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', agent: 'Selam T.',      verified: true,  furnished: true,  parking: false, generator: true,  elevator: true },
  { id: 7,  ownerId: 'seed', title: '3BR Townhouse, Adama',           loc: 'adama',     type: 'house',      beds: 3, baths: 2, area: 210, price: 8500000,   listing: 'sale', status: 'live', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', agent: 'Dawit M.',      verified: true,  furnished: false, parking: true,  generator: false, elevator: false },
  { id: 8,  ownerId: 'seed', title: 'Commercial Office, CMC',         loc: 'cmc',       type: 'commercial', beds: 0, baths: 2, area: 180, price: 95000,     listing: 'rent', status: 'live', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', agent: 'Yonas B.',      verified: true,  furnished: true,  parking: true,  generator: true,  elevator: true },
  { id: 9,  ownerId: 'seed', title: '5BR Beach Villa, Hawassa',       loc: 'hawassa',   type: 'villa',      beds: 5, baths: 4, area: 380, price: 18000000,  listing: 'sale', status: 'live', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', agent: 'Eyerusalem A.', verified: true,  furnished: true,  parking: true,  generator: true,  elevator: false },
  { id: 10, ownerId: 'seed', title: '2BR Apartment, Bahir Dar',       loc: 'bahir-dar', type: 'apartment',  beds: 2, baths: 1, area: 88,  price: 25000,     listing: 'rent', status: 'live', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', agent: 'Hanna G.',      verified: true,  furnished: true,  parking: false, generator: true,  elevator: false },
  { id: 11, ownerId: 'seed', title: 'Studio, Dire Dawa',              loc: 'dire-dawa', type: 'apartment',  beds: 1, baths: 1, area: 42,  price: 12000,     listing: 'rent', status: 'live', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', agent: 'Selam T.',      verified: true,  furnished: false, parking: false, generator: false, elevator: false },
  { id: 12, ownerId: 'seed', title: '500 sqm Land, 4 Kilo',           loc: '4kilo',     type: 'land',       beds: 0, baths: 0, area: 500, price: 5500000,   listing: 'sale', status: 'live', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', agent: 'Dawit M.',      verified: true,  furnished: false, parking: false, generator: false, elevator: false },
  { id: 13, ownerId: 'seed', title: '4BR Penthouse, Bole',            loc: 'bole',      type: 'apartment',  beds: 4, baths: 3, area: 240, price: 180000,    listing: 'rent', status: 'live', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', agent: 'Yonas B.',      verified: true,  furnished: true,  parking: true,  generator: true,  elevator: true },
  { id: 14, ownerId: 'seed', title: '3BR House, Sarbet',              loc: 'sarbet',    type: 'house',      beds: 3, baths: 2, area: 195, price: 65000,     listing: 'rent', status: 'live', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', agent: 'Eyerusalem A.', verified: true,  furnished: false, parking: true,  generator: true,  elevator: false },
]

export function formatPrice(price, listing) {
  if (listing === 'rent') return `ETB ${price.toLocaleString()}/mo`
  if (price >= 1000000) return `ETB ${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)}M`
  return `ETB ${price.toLocaleString()}`
}

// Runtime store for seller-submitted properties (lives in memory; replaces with API in production)
export const pendingProperties = []

export function addPendingProperty(property) {
  const id = Date.now()
  pendingProperties.push({ ...property, id, status: 'pending_payment', verified: false })
  return id
}

export function activateProperty(id) {
  const p = pendingProperties.find(p => p.id === id)
  if (p) {
    p.status = 'live'
    propertyDB.push(p)
  }
}

export function getPropertiesByOwner(ownerId) {
  const fromDB      = propertyDB.filter(p => p.ownerId === ownerId)
  const fromPending = pendingProperties.filter(p => p.ownerId === ownerId)
  return [...fromDB, ...fromPending]
}
