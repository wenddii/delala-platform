import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, BadgeCheck, Bed, Bath, Star, MapPin, Eye, Images, TrendingUp, MessageCircle, Phone } from 'lucide-react'

export default function HeroSection() {
  const [viewCount, setViewCount] = useState(0)
  const particleDelays = useRef([...Array(5)].map(() => Math.random() * 3))

  // Animate hero view counter
  useEffect(() => {
    const target = 247, dur = 1800, start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setViewCount(Math.floor(eased * target))
      if (p < 1) requestAnimationFrame(tick)
      else {
        let cur = target
        const iv = setInterval(() => { cur += Math.floor(Math.random() * 3); setViewCount(cur) }, 4000)
        return () => clearInterval(iv)
      }
    }
    const t = setTimeout(() => requestAnimationFrame(tick), 800)
    return () => clearTimeout(t)
  }, [])

  // 3D tilt handlers
  const handleTilt = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left, y = e.clientY - rect.top
    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -8
    const rotY = ((x - rect.width  / 2) / (rect.width  / 2)) *  8
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`
    card.style.animationPlayState = 'paused'
  }
  const handleTiltLeave = (e) => {
    e.currentTarget.style.transform = ''
    e.currentTarget.style.animationPlayState = 'running'
  }

  return (
    <section className="relative mesh-gradient-hero overflow-hidden">
      {/* Background image */}
      <div className="hero-image-stack opacity-30">
        <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80" alt="Addis Ababa skyline" />
      </div>
      {/* Orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-ethio-accent/10 blur-3xl float" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-ethio-primary/20 blur-3xl float-slow" />
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-6 pt-12 lg:pt-20 pb-32 lg:pb-40">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left text */}
          <div className="lg:col-span-7 text-white reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark text-xs font-medium text-white/90 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-ethio-accent" />
              <span>Ethiopia's #1 Verified Real-Estate Marketplace</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] tracking-tight mb-5">
              Find Your <span className="gradient-text">Perfect</span><br />
              Property with{' '}
              <span className="relative inline-block">
                Trust
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6C50 2 100 2 198 6" stroke="#29B6F6" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-white/70 max-w-xl mb-8 leading-relaxed">
              Find, rent, or buy <span className="text-white font-medium">verified properties</span> — with brokers you can actually trust. ID-checked agents, escrow-ready payments, multilingual support.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-ethio-accent" /><span className="text-white/80">100% Verified listings</span></div>
              <div className="flex items-center gap-2"><BadgeCheck size={16} className="text-ethio-accent" /><span className="text-white/80">ID-checked owners</span></div>
            </div>
          </div>

          {/* Right: floating cards */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative hero-stage">
              <div className="hero-glow-1" /><div className="hero-glow-2" />
              {/* Building SVG backdrop */}
              <div className="absolute inset-0 building-3d opacity-20 pointer-events-none">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <defs>
                    <linearGradient id="bldg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#29B6F6"/><stop offset="100%" stopColor="#01579B"/></linearGradient>
                    <linearGradient id="bldg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#54C5F8"/><stop offset="100%" stopColor="#013d6e"/></linearGradient>
                  </defs>
                  <rect x="50" y="200" width="80" height="200" fill="url(#bldg1)" rx="4"/>
                  <rect x="150" y="120" width="100" height="280" fill="url(#bldg2)" rx="4"/>
                  <rect x="270" y="180" width="80" height="220" fill="url(#bldg1)" rx="4" opacity="0.7"/>
                </svg>
              </div>

              {/* Property card */}
              <div className="tilt-card hero-card-1 absolute top-0 right-0 w-72 glass rounded-2xl p-3 z-20 depth-shadow" onMouseMove={handleTilt} onMouseLeave={handleTiltLeave}>
                <div className="absolute -top-3 left-4 z-10 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-500/40">
                  <span className="live-dot w-1.5 h-1.5 bg-white rounded-full" /> LIVE NOW
                </div>
                <div className="relative h-40 rounded-xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" className="w-full h-full object-cover hero-card-img" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-ethio-primary text-white text-[10px] font-bold rounded-md shadow-md">FOR RENT</div>
                  <div className="absolute top-2 right-2 verified-badge p-1.5 rounded-md shadow-md"><ShieldCheck size={14} className="text-white" /></div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur text-white text-[10px] font-semibold rounded-md flex items-center gap-1"><Images size={10} /> 1/12</div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur text-ethio-ink text-[10px] font-bold rounded-md flex items-center gap-1"><Eye size={10} className="text-ethio-primary" /><span>{viewCount}</span></div>
                </div>
                <div className="px-1 pt-3 pb-1">
                  <div className="font-display font-bold text-ethio-ink text-base leading-tight">3BR Modern Apartment in Bole</div>
                  <div className="text-xs text-ethio-muted flex items-center gap-1 mt-1.5"><MapPin size={12} className="text-ethio-primary" /> Bole, Addis Ababa</div>
                  <div className="flex items-center gap-3 text-[11px] text-ethio-muted mt-2.5">
                    <span className="flex items-center gap-1"><Bed size={12} className="text-ethio-primary" />3</span>
                    <span className="flex items-center gap-1"><Bath size={12} className="text-ethio-primary" />2</span>
                    <span className="flex items-center gap-1">120m²</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-ethio-border">
                    <div><div className="font-display font-bold text-ethio-primary text-lg leading-none">ETB 45,000</div><div className="text-[10px] text-ethio-muted">/month · negotiable</div></div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-ethio-accent/10 rounded-md"><Star size={12} className="text-ethio-accent fill-current" /><span className="text-xs font-bold text-ethio-ink">4.9</span></div>
                  </div>
                </div>
              </div>

              {/* Agent card */}
              <div className="tilt-card hero-card-2 absolute bottom-8 left-0 w-60 glass rounded-2xl p-4 z-30 depth-shadow" onMouseMove={handleTilt} onMouseLeave={handleTiltLeave}>
                <div className="absolute -top-2 -right-2 z-10 px-2 py-0.5 bg-ethio-accent text-ethio-ink text-[9px] font-extrabold rounded-full shadow-md tracking-wide">TOP OWNER</div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden ring-[3px] ring-ethio-accent shadow-lg">
                      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80" className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="online-dot absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-ethio-ink truncate">Selam Tesfaye</div>
                    <div className="text-[10px] text-ethio-muted truncate">Senior Delala · ED-2847</div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-ethio-accent fill-current" />)}
                      <span className="text-[10px] text-ethio-muted ml-1">5.0 · 128 reviews</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button className="py-2 bg-ethio-primary text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 hover:bg-ethio-primary-dark transition btn-shine"><MessageCircle size={12} /> Chat</button>
                  <button className="py-2 bg-ethio-tint text-ethio-primary text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 hover:bg-ethio-primary hover:text-white transition"><Phone size={12} /> Call</button>
                </div>
              </div>

              {/* Trust badge */}
              <div className="hero-card-3 absolute top-1/2 right-2 w-44 glass rounded-2xl p-3 z-10 depth-shadow">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl verified-badge flex items-center justify-center"><ShieldCheck size={20} className="text-white" /></div>
                    <div className="trust-ping absolute inset-0 rounded-xl" />
                  </div>
                  <div><div className="text-xs font-bold text-ethio-ink leading-tight">Just Verified</div><div className="text-[10px] text-ethio-muted">2 minutes ago</div></div>
                </div>
              </div>

              {/* Live inquiry */}
              <div className="hero-card-4 absolute top-32 -left-8 w-52 glass-dark rounded-xl p-3 z-40 depth-shadow">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold">MK</div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-white truncate">New inquiry!</div>
                    <div className="text-[10px] text-white/60 truncate">Meron K. just booked a visit</div>
                  </div>
                </div>
              </div>

              {/* Price trend */}
              <div className="hero-card-5 absolute bottom-32 right-8 w-40 glass rounded-xl p-3 z-20 depth-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] text-ethio-muted font-semibold uppercase tracking-wide">This month</div>
                  <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +12%</div>
                </div>
                <div className="font-display font-bold text-ethio-ink text-lg leading-none">+18 views</div>
                <div className="flex items-end gap-0.5 h-6 mt-2">
                  {['bar-1','bar-2','bar-3','bar-4','bar-5','bar-6','bar-7'].map(c => <div key={c} className={`${c} flex-1 bg-ethio-tint rounded-sm`} />)}
                </div>
              </div>

              {/* Floating particles */}
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`hero-particle hero-particle-${i}`} style={{ animationDelay: `${particleDelays.current[i-1]}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-ethio-surface z-10" />
    </section>
  )
}
