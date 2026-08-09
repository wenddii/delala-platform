import { BadgeCheck, ArrowRight, Phone, IdCard, FileCheck, Crown } from 'lucide-react'

const STEPS = [
  { icon: Phone,     label: 'Phone',     sub: 'OTP verified' },
  { icon: IdCard,    label: 'ID Check',  sub: 'Kebele + National' },
  { icon: FileCheck, label: 'Ownership', sub: 'Title deed' },
  { icon: Crown,     label: 'Certified', sub: 'Top Delala', accent: true },
]

export default function VerifiedShowcase() {
  return (
    <section className="py-12 mesh-gradient-mint">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="bg-white rounded-3xl p-6 lg:p-10 border border-ethio-border shadow-soft reveal overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-ethio-tint opacity-50" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-ethio-accent/10" />
          <div className="relative grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-ethio-tint text-ethio-primary text-xs font-bold rounded-full mb-3">
                <BadgeCheck size={12} /> VERIFIED BY ETHIODELALA
              </div>
              <h2 className="font-display font-bold text-2xl lg:text-3xl text-ethio-ink leading-tight mb-3">
                Every listing, <span className="gradient-text-primary">independently verified</span>
              </h2>
              <p className="text-sm text-ethio-muted mb-5">From ownership documents to agent ID checks — we don't list what we haven't verified. That's our promise.</p>
              <a href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ethio-primary hover:gap-2.5 transition-all">
                See verification process <ArrowRight size={16} />
              </a>
            </div>
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STEPS.map(({ icon: Icon, label, sub, accent }) => (
                  <div key={label} className="bg-gradient-to-br from-ethio-tint to-white rounded-2xl p-4 border border-ethio-primary/10 text-center card-3d">
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${accent ? 'icon-3d-accent' : 'verified-badge'}`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="text-[11px] font-bold text-ethio-ink">{label}</div>
                    <div className="text-[10px] text-ethio-muted">{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
