import { useEffect, useRef, useState } from 'react'

const STATS = [
  { target: 12000, suffix: '+', label: 'Verified Listings' },
  { target: 8,     suffix: '',  label: 'Major Cities' },
  { target: 2400,  suffix: '+', label: 'ID-Checked Delalas' },
  { target: 98,    suffix: '%', label: 'Satisfaction Rate' },
]

function Counter({ target }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const dur = 1800
        const start = performance.now()
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setVal(Math.floor(eased * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.disconnect()
      }
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  return <span ref={ref} className="counter stat-num">{val.toLocaleString()}</span>
}

export default function StatsBar() {
  return (
    <section className="py-12 bg-ethio-primary relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at 0% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 100% 50%, rgba(224,122,62,0.3) 0%, transparent 50%)' }}
      />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {STATS.map((s) => (
            <div key={s.label} className="reveal">
              <div className="font-display font-bold text-4xl lg:text-5xl">
                <Counter target={s.target} />
                <span className="text-ethio-accent">{s.suffix}</span>
              </div>
              <div className="text-sm text-white/80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
