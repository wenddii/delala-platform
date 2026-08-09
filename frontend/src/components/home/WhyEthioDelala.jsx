import { ArrowRight, Check, Users, Tag, Languages, Lock } from 'lucide-react'

const FEATURES = [
  { icon: Users,     title: 'Verified Agents',     desc: 'Background-checked, licensed, and trained. Meet your Delala with confidence.' },
  { icon: Tag,       title: 'Transparent Pricing', desc: 'Every fee, commission, and charge shown upfront. No surprises at closing.' },
  { icon: Languages, title: 'Multi-language',      desc: 'Full support in English, አማርኛ, and Afan Oromo. Speak your language.' },
  { icon: Lock,      title: 'Escrow & Dispute',    desc: 'Funds held safely. 24-hour dispute resolution. Your money is protected.' },
]

const POINTS = [
  { title: '4-Level Verification',  sub: 'From phone to ownership docs, every layer is checked' },
  { title: 'Transparent Pricing',   sub: 'No hidden fees, clear commission shown upfront' },
  { title: 'Diaspora-Friendly',     sub: 'Remote buying with Power of Attorney + video tours' },
]

export default function WhyEthioDelala() {
  return (
    <section id="why-ethiodelala" className="py-16 lg:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 reveal">
            <div className="inline-block px-3 py-1 bg-ethio-tint text-ethio-primary text-xs font-bold rounded-full mb-3 border border-ethio-primary/10">WHY ETHIODELALA</div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-ethio-ink mb-4 leading-tight">More than listings — <span className="gradient-text-primary">a complete trust system</span></h2>
            <p className="text-ethio-muted leading-relaxed mb-6">We built EthioDelala to solve the most painful parts of renting or buying property in Ethiopia. No more fraud, ghost agents, or surprise fees.</p>
            <div className="space-y-3">
              {POINTS.map(p => (
                <div key={p.title} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full verified-badge flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={14} className="text-white" /></div>
                  <div><div className="font-semibold text-ethio-ink text-sm">{p.title}</div><div className="text-xs text-ethio-muted">{p.sub}</div></div>
                </div>
              ))}
            </div>
            <a href="#trust" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ethio-primary mt-6 hover:gap-2.5 transition-all">
              Learn about trust & safety <ArrowRight size={16} />
            </a>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4 reveal">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-gradient-to-br from-ethio-tint to-white rounded-2xl p-6 border border-ethio-primary/10 card-3d">
                <div className="w-12 h-12 rounded-2xl icon-3d flex items-center justify-center mb-4"><Icon size={24} className="text-ethio-primary" /></div>
                <h3 className="font-display font-bold text-ethio-ink mb-2">{title}</h3>
                <p className="text-sm text-ethio-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
