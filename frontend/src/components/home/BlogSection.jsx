import { ArrowRight, Calendar } from 'lucide-react'

const POSTS = [
  {
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    badge: 'MARKET REPORT', badgeColor: 'bg-ethio-primary',
    date: 'May 10, 2025', read: '6 min read',
    title: 'Q2 2025: Addis Rent Index Sees 8% Climb in Bole',
    excerpt: "Rental prices in Addis's most popular neighborhoods continue their steady upward trend. Here's what investors and renters need to know.",
  },
  {
    img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    badge: 'HOW-TO', badgeColor: 'bg-ethio-accent',
    date: 'May 02, 2025', read: '8 min read',
    title: 'How to Rent in Addis Without Falling for a Scam',
    excerpt: 'A diaspora-tested checklist: what to verify, what to ask, and the red flags that should send you running.',
  },
  {
    img: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
    badge: 'INVESTMENT', badgeColor: 'bg-ethio-ink',
    date: 'Apr 24, 2025', read: '10 min read',
    title: 'Living in Bole: A Complete Neighborhood Guide for 2025',
    excerpt: 'From schools to restaurants, transit to safety — everything you need to know about Addis\'s most international district.',
  },
]

export default function BlogSection() {
  return (
    <section id="blog" className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 reveal">
          <div>
            <div className="inline-block px-3 py-1 bg-ethio-tint text-ethio-primary text-xs font-bold rounded-full mb-3 border border-ethio-primary/10">
              MARKET INSIGHTS
            </div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-ethio-ink">
              Latest from the <span className="gradient-text-primary">EthioDelala blog</span>
            </h2>
          </div>
          <a href="#" className="text-sm font-semibold text-ethio-primary flex items-center gap-1.5 hover:gap-2.5 transition-all self-start md:self-end">
            All articles <ArrowRight size={16} />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6 reveal">
          {POSTS.map((p) => (
            <article key={p.title} className="bg-white rounded-2xl overflow-hidden border border-ethio-border card-3d group">
              <div className="relative h-48 img-zoom overflow-hidden">
                <img src={p.img} className="w-full h-full object-cover" alt="" />
                <div className={`absolute top-3 left-3 px-2.5 py-1 ${p.badgeColor} text-white text-[11px] font-bold rounded-md`}>
                  {p.badge}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-ethio-muted mb-3">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {p.date}</span>
                  <span>·</span>
                  <span>{p.read}</span>
                </div>
                <h3 className="font-display font-bold text-ethio-ink text-lg leading-snug mb-2 group-hover:text-ethio-primary transition">
                  {p.title}
                </h3>
                <p className="text-sm text-ethio-muted leading-relaxed mb-4">{p.excerpt}</p>
                <a href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ethio-primary group-hover:gap-2.5 transition-all">
                  Read article <ArrowRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
