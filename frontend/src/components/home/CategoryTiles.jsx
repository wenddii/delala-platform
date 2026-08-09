import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Building, Home, Briefcase, Mountain, Palmtree } from 'lucide-react'

const cats = [
  { icon: Building,  label: 'Apartments', count: '4,820', type: 'apartment', accent: false },
  { icon: Home,      label: 'Houses',     count: '3,210', type: 'house',     accent: false },
  { icon: Briefcase, label: 'Commercial', count: '1,540', type: 'commercial',accent: false },
  { icon: Mountain,  label: 'Land',       count: '2,180', type: 'land',      accent: false },
  { icon: Palmtree,  label: 'Vacation',   count: '420',   type: 'vacation',  accent: true  },
]

export default function CategoryTiles() {
  const navigate = useNavigate()

  return (
    <section className="pt-32 lg:pt-40 py-16 lg:py-20 mesh-gradient-mint">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 reveal">
          <div>
            <div className="inline-block px-3 py-1 bg-white text-ethio-primary text-xs font-bold rounded-full mb-3 border border-ethio-primary/10">
              BROWSE BY CATEGORY
            </div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-ethio-ink">
              Find what fits your <span className="gradient-text-primary">lifestyle</span>
            </h2>
          </div>
          <button
            onClick={() => navigate('/properties')}
            className="text-sm font-semibold text-ethio-primary flex items-center gap-1.5 hover:gap-2.5 transition-all self-start md:self-end"
          >
            View all categories <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 reveal">
          {cats.map(({ icon: Icon, label, count, type, accent }) => (
            <button
              key={label}
              onClick={() => navigate(`/properties?type=${type}`)}
              className={`group relative rounded-2xl p-6 border transition card-3d overflow-hidden text-left w-full ${
                accent
                  ? 'bg-gradient-to-br from-ethio-primary to-ethio-primary-dark text-white border-ethio-primary col-span-2 md:col-span-1'
                  : 'bg-white border-ethio-border hover:border-ethio-primary/30'
              }`}
            >
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${accent ? 'bg-white/10' : 'bg-ethio-tint'}`} />
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${accent ? 'icon-3d-accent' : 'icon-3d'}`}>
                  <Icon size={28} className={accent ? 'text-white' : 'text-ethio-primary'} />
                </div>
                <div className={`font-display font-bold ${accent ? '' : 'text-ethio-ink'}`}>{label}</div>
                <div className={`text-xs mt-0.5 ${accent ? 'text-white/70' : 'text-ethio-muted'}`}>{count} listings</div>
                <div className={`mt-3 pt-3 flex items-center justify-between ${accent ? 'border-t border-white/10' : 'border-t border-ethio-border'}`}>
                  <span className={`text-[11px] font-semibold ${accent ? 'text-ethio-accent' : 'text-ethio-primary'}`}>Explore</span>
                  <ArrowUpRight size={16} className={`${accent ? 'text-ethio-accent' : 'text-ethio-primary'} group-hover:rotate-45 transition-transform`} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
