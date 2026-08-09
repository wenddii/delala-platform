import { Zap, Plus, ShieldCheck, Users, MapPin } from 'lucide-react'
import Logo from '../Logo.jsx'

export default function CtaBanner() {
  return (
    <section className="py-16 lg:py-20 mesh-gradient-mint">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="bg-gradient-to-br from-ethio-ink via-ethio-ink to-ethio-primary-dark rounded-3xl p-8 lg:p-14 relative overflow-hidden depth-shadow">
          {/* Decorative blurs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-ethio-accent/20 blur-3xl float" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-ethio-primary/40 blur-3xl float-slow" />
          <div className="absolute top-1/2 right-1/4 w-4 h-4 rounded-full bg-ethio-accent/60 float-fast" />
          <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-white/30 float" />
          <div className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-ethio-accent float-fast" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            {/* Left text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-ethio-accent text-xs font-bold rounded-full mb-4 border border-white/10">
                <Zap size={12} /> FREE TO START
              </div>
              <h2 className="font-display font-bold text-3xl lg:text-5xl text-white leading-tight mb-4">
                Own a property?{' '}
                <br />
                <span className="gradient-text">List it free in 5 min.</span>
              </h2>
              <p className="text-white/70 leading-relaxed mb-6 max-w-md">
                Join 12,000+ owners and 2,400+ Delalas already using EthioDelala. Get verified, get inquiries, get paid — all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#list"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-br from-ethio-accent to-ethio-accent-light text-ethio-ink font-semibold rounded-xl shadow-accent-glow hover:shadow-soft-lg transition btn-shine"
                >
                  <Plus size={16} /> List Your Property
                </a>
              </div>
            </div>

            {/* Right: animated logo */}
            <div className="relative">
              <div className="relative h-96 flex items-center justify-center">
                <div className="logo-stage absolute inset-0 flex items-center justify-center">
                  <div className="logo-ring logo-ring-1" />
                  <div className="logo-ring logo-ring-2" />
                  <div className="logo-ring logo-ring-3" />
                  <div className="orbit">
                    <div className="orbit-dot orbit-dot-1" />
                    <div className="orbit-dot orbit-dot-2" />
                    <div className="orbit-dot orbit-dot-3" />
                    <div className="orbit-dot orbit-dot-4" />
                  </div>
                  <div className="logo-glow" />
                  <div className="logo-conic" />
                  <div className="logo-core">
                    <div className="logo-hex">
                      <Logo size={64} variant="white" />
                    </div>
                    <div className="logo-pin">
                      <MapPin size={12} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="logo-wordmark">
                  <span className="logo-wordmark-text">Ethio</span>
                  <span className="logo-wordmark-accent">Delala</span>
                </div>

                {/* Floating side cards */}
                <div className="logo-side-card logo-side-card-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-ethio-accent/20 flex items-center justify-center">
                      <ShieldCheck size={16} className="text-ethio-accent" />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/60 uppercase tracking-wider">Verified</div>
                      <div className="text-white text-xs font-semibold">100% Listings</div>
                    </div>
                  </div>
                </div>

                <div className="logo-side-card logo-side-card-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-ethio-primary/30 flex items-center justify-center">
                      <Users size={16} className="text-ethio-primary-light" />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/60 uppercase tracking-wider">Trusted by</div>
                      <div className="text-white text-xs font-semibold">12,000+ Users</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
