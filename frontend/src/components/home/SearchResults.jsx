import { useState } from 'react'
import { CheckCircle2, Bookmark, X, ArrowRight, Bed, User, SearchX, Check } from 'lucide-react'
import { formatPrice } from '../../data/properties.js'

export default function SearchResults({ results, onClose }) {
  const [saved, setSaved] = useState(false)
  if (!results) return null

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <section className="pt-8 pb-12 bg-ethio-surface">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="bg-white rounded-3xl shadow-soft-lg border border-ethio-border overflow-hidden">
          {/* Header */}
          <div className="p-5 lg:p-6 border-b border-ethio-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-ethio-primary font-semibold mb-1">
                <CheckCircle2 size={14} />
                <span>{results.count > 0 ? 'SEARCH COMPLETE' : 'NO EXACT MATCHES'}</span>
              </div>
              <h3 className="font-display font-bold text-xl lg:text-2xl text-ethio-ink">
                <span className="text-ethio-primary">{results.count}</span> properties found
              </h3>
              <p className="text-sm text-ethio-muted mt-0.5">{results.summary}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSave}
                className={`px-3 py-2 text-xs font-semibold border rounded-lg transition flex items-center gap-1.5 ${saved ? 'bg-ethio-primary text-white border-ethio-primary' : 'text-ethio-primary border-ethio-primary/20 hover:bg-ethio-tint'}`}>
                {saved ? <Check size={14} /> : <Bookmark size={14} />}
                {saved ? 'Saved!' : 'Save search'}
              </button>
              <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-ethio-tint text-ethio-muted hover:text-ethio-ink flex items-center justify-center transition">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Active filters */}
          <div className="px-5 lg:px-6 py-3 bg-ethio-surface border-b border-ethio-border flex flex-wrap items-center gap-2">
            {results.activeFilters.length === 0
              ? <span className="text-xs text-ethio-muted">No filters applied — showing all listings</span>
              : <>
                  <span className="text-xs text-ethio-muted font-medium mr-1">Active:</span>
                  {results.activeFilters.map(f => (
                    <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 bg-ethio-tint text-ethio-primary text-[11px] font-semibold rounded-full">
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </span>
                  ))}
                </>
            }
          </div>

          {/* Results grid */}
          <div className="p-5 lg:p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.items.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-ethio-tint flex items-center justify-center mb-4">
                  <SearchX size={32} className="text-ethio-primary" />
                </div>
                <h4 className="font-display font-bold text-ethio-ink text-lg mb-1">No matches found</h4>
                <p className="text-sm text-ethio-muted mb-4">Try widening your price range, removing a filter, or selecting a different city.</p>
                <button type="button" onClick={onClose} className="px-4 py-2 bg-ethio-primary text-white text-sm font-semibold rounded-lg hover:bg-ethio-primary-dark transition">Clear all filters</button>
              </div>
            ) : (
              results.items.map(p => (
                <article key={p.id} className="bg-white rounded-2xl overflow-hidden border border-ethio-border card-3d group">
                  <div className="relative h-44 img-zoom overflow-hidden">
                    <img src={p.img} className="w-full h-full object-cover" alt="" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-ethio-primary text-white text-[10px] font-bold rounded">{p.listing === 'rent' ? 'FOR RENT' : 'FOR SALE'}</div>
                    {p.verified && <div className="absolute top-2 right-2 verified-badge p-1 rounded-md"><Check size={12} className="text-white" /></div>}
                  </div>
                  <div className="p-4">
                    <h4 className="font-display font-bold text-ethio-ink text-sm leading-snug line-clamp-1">{p.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-ethio-muted mt-1.5 mb-3">
                      {p.beds > 0 && <span className="flex items-center gap-1"><Bed size={12} className="text-ethio-primary" />{p.beds}BR</span>}
                      <span className="flex items-center gap-1"><User size={12} className="text-ethio-primary" />{p.agent}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-ethio-border">
                      <div className="font-display font-bold text-ethio-primary text-sm">{formatPrice(p.price, p.listing)}</div>
                      <button className="text-[11px] font-semibold text-ethio-primary flex items-center gap-1 group-hover:gap-2 transition-all">View <ArrowRight size={12} /></button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-5 lg:p-6 border-t border-ethio-border bg-ethio-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-ethio-muted">Showing top {results.items.length} matches · <span className="text-ethio-primary font-semibold">Save this search</span> to get email alerts.</p>
            <a href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ethio-primary hover:gap-2.5 transition-all">
              See all results <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
