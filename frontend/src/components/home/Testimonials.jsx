import { Star, Globe, MapPin, Briefcase } from 'lucide-react'

const ITEMS = [
  {
    quote: '"Bought a property in Bole from Washington DC without flying. The video tour, document signing, and Power of Attorney support were flawless.',
    highlight: 'This is the future.',
    name: 'Meron Alemu',
    role: 'Diaspora buyer · Washington, USA',
    Icon: Globe,
    img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80',
  },
  {
    quote: '"Found a clean 2BR in Sarbet in 3 days. The Delala was polite, the listing was exactly as shown, and the payment was escrowed until I got my keys.',
    highlight: 'No stress at all.',
    name: 'Binyam Tesfa',
    role: 'Renter · Addis Ababa',
    Icon: MapPin,
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
  },
  {
    quote: '"I left my old brokerage to operate under EthioDelala. The leads are qualified, the brand is trusted, and I earn more.',
    highlight: 'My business tripled in 6 months.',
    name: 'Hanna Bekele',
    role: 'Senior Delala · 8 yrs experience',
    Icon: Briefcase,
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&q=80',
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 lg:py-24 bg-ethio-ink relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(27,79,114,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(224,122,62,0.2) 0%, transparent 50%)' }}
      />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative">
        <div className="text-center mb-12 reveal">
          <div className="inline-block px-3 py-1 bg-white/10 text-ethio-accent text-xs font-bold rounded-full mb-3 border border-white/10">
            TESTIMONIALS
          </div>
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-white mb-3">
            Trusted by thousands across <span className="gradient-text">Ethiopia & the diaspora</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Real stories from renters, buyers, owners, and Delalas who found success with EthioDelala.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 reveal">
          {ITEMS.map((t) => (
            <div key={t.name} className="testimonial-card rounded-2xl p-6 card-3d">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-ethio-accent fill-current" />
                ))}
              </div>
              <p className="text-sm text-ethio-ink leading-relaxed mb-5">
                {t.quote}{' '}
                <span className="text-ethio-primary font-semibold">{t.highlight}"</span>
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-ethio-border">
                <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-ethio-accent">
                  <img src={t.img} className="w-full h-full object-cover" alt={t.name} />
                </div>
                <div>
                  <div className="font-semibold text-ethio-ink text-sm">{t.name}</div>
                  <div className="text-xs text-ethio-muted flex items-center gap-1">
                    <t.Icon size={12} /> {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
