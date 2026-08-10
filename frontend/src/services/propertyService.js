/**
 * propertyService.js
 *
 * Wraps every /api/properties/ endpoint.
 * All field names match Django serializers exactly.
 *
 * ⚠️  MISSING BACKEND FEATURES (do not invent endpoints):
 *   - No filter params on GET /listings/ (no ?listing_type=, ?owner=, ?location=, ?q=)
 *     → Filtering is done client-side after fetching all listings.
 *   - No filter params on GET /favorites/ (no ?user=)
 *     → All favorites are fetched and filtered client-side.
 *   - No file upload endpoint. PropertyImage stores image_url (URLField).
 *     → Image upload is not supported until backend adds media handling.
 */
import api from './api.js'

// ── Property Types ────────────────────────────────────────────────────────────
// GET /api/properties/property-types/   AllowAny
// Returns: [{ id, name }]
export const getPropertyTypes = () =>
  api.get('/api/properties/property-types/').then(r => r.data)

// ── Locations ────────────────────────────────────────────────────────────────
// GET /api/properties/locations/   AllowAny
// Returns: [{ id, city, sub_city, woreda, neighborhood, latitude, longitude }]
export const getLocations = () =>
  api.get('/api/properties/locations/').then(r => r.data)

// ── Properties (auth required) ───────────────────────────────────────────────
// POST /api/properties/properties/   IsAuthenticated
// The backend creates Property + PropertyDocument + PropertyVerification atomically.
// Rule 4: must be sent as multipart/form-data because the document is a FileField.
// Fields: property_type (int), location (int), bedrooms, bathrooms, area_sqm,
//         description, document_type (str), document (File)
// Rule 4: owner is set server-side — NEVER include owner in the request.
export const createProperty = (formData) =>
  api.post('/api/properties/properties/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

// PATCH /api/properties/properties/<pk>/   IsAuthenticated
// Can be JSON for non-file fields; use multipart only when updating the document file.
export const updateProperty = (pk, body) => {
  const isFormData = body instanceof FormData
  return api.patch(`/api/properties/properties/${pk}/`, body, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }).then(r => r.data)
}

// GET /api/properties/properties/   IsAuthenticated (returns ALL properties — no owner filter)
// ⚠️  No ?owner= filter — client must filter by owner id from response
export const getMyProperties = () =>
  api.get('/api/properties/properties/').then(r => r.data)

// GET /api/properties/properties/<pk>/   IsAuthenticated
export const getProperty = (pk) =>
  api.get(`/api/properties/properties/${pk}/`).then(r => r.data)

// DELETE /api/properties/properties/<pk>/   IsAuthenticated
export const deleteProperty = (pk) =>
  api.delete(`/api/properties/properties/${pk}/`).then(r => r.data)

// ── Property Listings (public read) ──────────────────────────────────────────
// GET /api/properties/listings/   AllowAny
// Returns: [{ id, property, title, listing_type, price, currency, price_period, status, published_at, ... }]
// ⚠️  No filter params — all client-side filtering
export const getListings = () =>
  api.get('/api/properties/listings/').then(r => r.data)

// GET /api/properties/listings/<pk>/   AllowAny
export const getListing = (pk) =>
  api.get(`/api/properties/listings/${pk}/`).then(r => r.data)

// ── Favorites ────────────────────────────────────────────────────────────────
// GET /api/properties/favorites/   IsAuthenticated
// Returns ALL favorites — filter client-side by user
export const getFavorites = () =>
  api.get('/api/properties/favorites/').then(r => r.data)

// POST /api/properties/favorites/   IsAuthenticated
// Body: { id, user, property_listing }
export const addFavorite = (body) =>
  api.post('/api/properties/favorites/', body).then(r => r.data)

// DELETE /api/properties/favorites/<pk>/   IsAuthenticated
export const removeFavorite = (pk) =>
  api.delete(`/api/properties/favorites/${pk}/`).then(r => r.data)

// ── Property Images ───────────────────────────────────────────────────────────
// POST /api/properties/images/   IsAuthenticated
// Body: { id, property, image_url, is_primary }
// ⚠️  image_url is a URLField — no binary upload supported
export const addPropertyImage = (body) =>
  api.post('/api/properties/images/', body).then(r => r.data)

// ── Property Documents ────────────────────────────────────────────────────────
// POST /api/properties/documents/   IsAuthenticated
// Body: { id, property, document_type, document_url }
// ⚠️  document_url is a URLField — no binary upload supported
export const addPropertyDocument = (body) =>
  api.post('/api/properties/documents/', body).then(r => r.data)

// ── Property Verifications ────────────────────────────────────────────────────
// GET /api/properties/verifications/   IsAuthenticated
// Returns: [{ id, property, status, verified_by, verified_at, remarks, created_at }]
// status values: 'pending' | 'verified' | 'rejected'
// Rule 5: only staff can change status. Users can only read their own property's status.
// Rule 6: a property must be 'verified' before a listing can be created for it.
export const getVerifications = () =>
  api.get('/api/properties/verifications/').then(r => r.data)

// ── Listings — create (owner-only, verified properties only) ──────────────────
// POST /api/properties/listings/   IsAuthenticated
// The backend enforces that the property is verified before allowing listing creation.
// Body: { id, property, title, listing_type, price, currency, price_period, status }
// Rule 6: frontend must only offer this flow when verification status === 'verified'
export const createListing = (body) =>
  api.post('/api/properties/listings/', body).then(r => r.data)

// PATCH /api/properties/listings/<pk>/   IsAuthenticated
export const updateListing = (pk, body) =>
  api.patch(`/api/properties/listings/${pk}/`, body).then(r => r.data)
