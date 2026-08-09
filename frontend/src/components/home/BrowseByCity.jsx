import { ArrowRight, ArrowUpRight } from 'lucide-react'

const CITIES = [
  { name:'Bole',      count:'1,820', img:'https://images.unsplash.com/photo-1448630360428-65456885c650?w=600&q=80' },
  { name:'CMC',       count:'940',   img:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80' },
  { name:'Sarbet',    count:'620',   img:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80' },
  { name:'Kazanchis', count:'580',   img:'https://images.unsplash.com/photo-1496564203457-11bb12075d90?w=600&q=80' },
  { name:'4 Kilo',    count:'410',   img:'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=600&q=80' },
  { name:'Adama',     count:'720',   img:'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600&q=80' },
  { name:'Bahir Dar', count:'520',   img:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80' },
  { name:'Hawassa',   count:'390',   img:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80' },
]

export default function BrowseByCity() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 reveal">
          <div>
            <div className="inline-block px-3 py-1 bg-ethio-tint text-ethio-primary text-xs font-bold rounded-full mb-3 border border-ethio-primary/10">EXPLORE BY LOCATION</div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-ethio-ink">Browse by <span className="gradient-text-primary">city & neighborhood</span></h2>
          </div>
          <a href="#" className="text-sm font-semibold text-ethio-primary flex items-center gap-1.5 hover:gap-2.5 transition-all self-start md:self-end">All locations <ArrowRight size={16} /></a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 reveal">
          {CITIES.map(c => (
            <a key={c.name} href="#" className="group relative rounded-2xl overflow-hidden h-48 card-3d">
              <img src={c.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-ethio-ink via-ethio-ink/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="font-display font-bold text-lg">{c.name}</div>
                <div className="text-xs text-white/80">{c.count} listings</div>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <ArrowUpRight size={16} className="text-white" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
