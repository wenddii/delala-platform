import { Search, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react'

const STEPS = [
  { num:'1', label:'Step One', icon:Search, title:'Search Property', desc:'Browse verified listings with transparent pricing and real photos. Filter by city, budget, beds, and amenities.', facts:['12,000+ listings','8 cities'], accent:false },
  { num:'2', label:'Step Two', icon:ShieldCheck, title:'Verify & Connect', desc:'Every listing is independently verified. Connect directly with ID-checked Delalas, schedule tours, ask questions.', facts:['ID-checked agents','24/7 support'], accent:false },
  { num:'3', label:'Step Three', icon:KeyRound, title:'Close the Deal', desc:'Finalize the deal through escrow-ready payments, transparent contracts, and a smooth key handover. Move in with peace of mind.', facts:['Escrow ready','Move-in support'], accent:true },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 lg:py-24 mesh-gradient-mint relative overflow-hidden">
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-ethio-accent/10 blur-3xl float" />
      <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-ethio-primary/10 blur-3xl float-slow" />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative">
        <div className="text-center mb-12 reveal">
          <div className="inline-block px-3 py-1 bg-white text-ethio-primary text-xs font-bold rounded-full mb-3 border border-ethio-primary/10">HOW IT WORKS</div>
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-ethio-ink mb-3">Three simple steps to your <span className="gradient-text-primary">new home</span></h2>
          <p className="text-ethio-muted max-w-xl mx-auto">From discovery to keys in your hand — we make the journey transparent, secure, and surprisingly fast.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(s => {
            const Icon = s.icon
            return (
              <div key={s.num} className="relative reveal">
                <div className="bg-white rounded-3xl p-7 border border-ethio-border card-3d h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-2xl text-white font-display font-bold text-xl flex items-center justify-center ${s.accent ? 'bg-gradient-to-br from-ethio-accent to-ethio-accent-light shadow-accent-glow' : 'bg-gradient-to-br from-ethio-primary to-ethio-primary-dark shadow-glow'}`}>{s.num}</div>
                    <div className={`text-[10px] uppercase tracking-widest font-bold ${s.accent ? 'text-ethio-accent' : 'text-ethio-primary'}`}>{s.label}</div>
                  </div>
                  <div className={`w-20 h-20 mx-auto my-4 rounded-2xl flex items-center justify-center ${s.accent ? 'icon-3d-accent' : 'icon-3d'}`}>
                    <Icon size={40} className={s.accent ? 'text-white' : 'text-ethio-primary'} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-ethio-ink text-center mb-2">{s.title}</h3>
                  <p className="text-sm text-ethio-muted text-center leading-relaxed">{s.desc}</p>
                  <div className="mt-5 pt-5 border-t border-ethio-border flex items-center gap-2 text-xs text-ethio-muted">
                    {s.facts.map((f, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <CheckCircle2 size={14} className={s.accent ? 'text-ethio-accent' : 'text-ethio-primary'} /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
