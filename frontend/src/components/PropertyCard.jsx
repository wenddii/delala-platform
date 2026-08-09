import { Link } from 'react-router-dom'
import { Heart, Bookmark } from 'lucide-react'
import { formatPrice } from '../data/properties.js'

/**
 * Reusable property card matching Figma design.
 * showSave  — filled bookmark (saved properties)
 * showHeart — filled red heart (liked properties)
 */
export default function PropertyCard({ property, showHeart = false, showSave = false, className = '' }) {
  return (
    <Link
      to={`/property/${property.id}`}
      className={`block bg-white rounded-xl shadow-card hover:shadow-card-lg transition-shadow overflow-hidden group ${className}`}
      aria-label={property.title}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-ethio-tint overflow-hidden">
        {property.img ? (
          <img
            src={property.img}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-ethio-tint" />
        )}

        {/* Liked — filled red heart */}
        {showHeart && (
          <div className="absolute top-2 right-2 text-red-500 drop-shadow">
            <Heart size={18} fill="currentColor" />
          </div>
        )}

        {/* Saved — filled bookmark */}
        {showSave && (
          <div className="absolute top-2 right-2 text-ethio-primary drop-shadow">
            <Bookmark size={18} fill="currentColor" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className={`text-xs font-semibold mb-1 ${
          property.listing === 'sale' ? 'text-ethio-for-sale' : 'text-ethio-primary'
        }`}>
          {property.listing === 'sale' ? 'For sale' : 'For rent'}
        </p>
        <p className="text-sm font-semibold text-ethio-ink leading-snug line-clamp-1">
          {property.title}
        </p>
        <p className="text-xs text-ethio-muted mt-0.5">
          {formatPrice(property.price, property.listing)}
        </p>
      </div>
    </Link>
  )
}
