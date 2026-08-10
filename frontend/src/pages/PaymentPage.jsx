/**
 * PaymentPage.jsx
 *
 * Business rules implemented:
 *  - Rule 6/7: Listing is CREATED here (after plan selection), not in AddProperty.
 *    The user selects listing_type (sale/rent) and price, then the listing is
 *    POSTed to the backend.
 *  - Rule 7: Payment is a future TODO. For now the listing is created immediately
 *    with status 'active'. When a real payment gateway is added, the listing should
 *    only be created/activated AFTER payment confirmation.
 *  - Rule 6: The backend enforces that only verified properties can be listed.
 *    If the backend rejects the request, the error is shown to the user.
 *  - Rule 1/5: owner is derived server-side; we never send owner in the listing body.
 */
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Zap, Star, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { createListing } from '../services/propertyService.js'
import { parseDRFError } from '../services/api.js'

const uid = () => crypto.randomUUID()

const PLANS = [
  { id: 'free',    label: 'Free',          rate: 0,    icon: <CheckCircle size={22} />, color: '#6B7280', bg: '#F9FAFB', border: '#D1D5DB',
    desc: 'List at no cost. Standard visibility.' },
  { id: 'boost',   label: 'Boost',         rate: 0.03, icon: <Zap size={22} />,         color: '#01579B', bg: '#E3F2FD', border: '#29B6F6',
    desc: '3% of listing price. Featured placement + highlighted badge.' },
  { id: 'premium', label: 'Premium Boost', rate: 0.05, icon: <Star size={22} />,        color: '#7C3AED', bg: '#F5F3FF', border: '#A78BFA',
    desc: '5% of listing price. Homepage spotlight + priority ranking.' },
]

const METHODS = [
  { id: 'telebirr', label: 'Tele Birr' },
  { id: 'cbebirr',  label: 'CBE Birr'  },
]

const inp = {
  display: 'block', width: '100%', padding: '10px 14px', fontSize: 14,
  color: '#111827', background: '#F9FAFB', border: '1.5px solid #D1D5DB',
  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}
const onF = e => { e.target.style.borderColor = '#01579B'; e.target.style.boxShadow = '0 0 0 3px rgba(1,87,155,0.15)' }
const onB = e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none' }

export default function PaymentPage() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const selectedProps = location.state?.selectedProps || []

  const [plan,        setPlan]        = useState('free')
  const [method,      setMethod]      = useState('telebirr')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  // Per-property listing details: price and listing_type
  const [listingData, setListingData] = useState(
    () => Object.fromEntries(selectedProps.map(p => [p.id, { price: '', listing_type: 'sale' }]))
  )

  const setField = (propId, field, val) =>
    setListingData(prev => ({ ...prev, [propId]: { ...prev[propId], [field]: val } }))

  const selectedPlan = PLANS.find(p => p.id === plan)

  const feeRows = selectedProps.map(p => {
    const ld  = listingData[p.id] || {}
    const price = Number(String(ld.price || '').replace(/\D/g, '')) || 0
    return { ...p, price, fee: Math.round(price * selectedPlan.rate) }
  })
  const total = feeRows.reduce((s, r) => s + r.fee, 0)

  const handlePublish = async () => {
    // Validate all props have price + listing_type
    for (const p of selectedProps) {
      const ld = listingData[p.id] || {}
      if (!ld.price || !String(ld.price).replace(/\D/g, '')) {
        setError(`Enter a price for "${p.title}".`); return
      }
    }
    if (plan !== 'free' && !method) { setError('Choose a payment method.'); return }
    setLoading(true)
    setError('')

    try {
      // TODO: integrate payment gateway here before creating listings.
      // For now we create listings immediately (status → 'active').
      // Rule 6: backend will reject if property is not verified.
      await Promise.all(
        selectedProps.map(p => {
          const ld    = listingData[p.id] || {}
          const price = Number(String(ld.price || '').replace(/\D/g, ''))
          return createListing({
            id:           uid(),
            property:     p.id,
            title:        p.title || 'Property listing',
            listing_type: ld.listing_type || 'sale',
            price:        String(price),
            currency:     'ETB',
            price_period: ld.listing_type === 'rent' ? 'monthly' : 'total',
            status:       'active',
          })
        })
      )
      navigate('/properties', { state: { paymentSuccess: true } })
    } catch (err) {
      setError(parseDRFError(err) || err?.message || 'Failed to create listing.')
    } finally {
      setLoading(false)
    }
  }

  if (selectedProps.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center text-ethio-muted">
          <p className="text-base font-semibold mb-4">No properties selected.</p>
          <button onClick={() => navigate('/list-property')}
            className="px-5 py-2 bg-ethio-primary text-white text-sm font-semibold rounded-full">
            ← Back to listing
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-ethio-ink">Create listing</h1>
          <button onClick={() => navigate('/profile')}
            className="px-4 py-1.5 bg-ethio-accent text-white text-xs font-semibold rounded-full hover:opacity-90 transition">
            Save &amp; exit
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        {/* ── Per-property price + listing type ── */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-ethio-ink mb-3">Listing details</p>
          <div className="space-y-4">
            {selectedProps.map(p => {
              const ld = listingData[p.id] || {}
              return (
                <div key={p.id} className="p-4 border border-ethio-border rounded-2xl bg-ethio-tint/30">
                  <p className="text-sm font-bold text-ethio-ink mb-3 truncate">{p.title}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                        Listing type <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select value={ld.listing_type || 'sale'}
                        onChange={e => setField(p.id, 'listing_type', e.target.value)}
                        style={inp} onFocus={onF} onBlur={onB}>
                        <option value="sale">For sale</option>
                        <option value="rent">For rent</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                        Price (ETB{ld.listing_type === 'rent' ? '/mo' : ''}) <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text" inputMode="numeric"
                        value={ld.price ? Number(String(ld.price).replace(/\D/g,'')).toLocaleString() : ''}
                        onChange={e => setField(p.id, 'price', e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 2500000" style={inp} onFocus={onF} onBlur={onB} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Plan selector ── */}
        <p className="text-sm font-semibold text-ethio-ink mb-3">Visibility plan</p>
        <div className="space-y-3 mb-6">
          {PLANS.map(p => {
            const active = plan === p.id
            return (
              <button key={p.id} type="button" onClick={() => setPlan(p.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 14, cursor: 'pointer', textAlign: 'left', border: `2px solid ${active ? p.border : '#E5E7EB'}`, background: active ? p.bg : '#fff', transition: 'all 0.15s' }}>
                <span style={{ color: active ? p.color : '#9CA3AF', flexShrink: 0 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: active ? p.color : '#111827' }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{p.desc}</div>
                </div>
                {active && (
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Fee breakdown ── */}
        {plan !== 'free' && (
          <div className="border border-ethio-border rounded-2xl overflow-hidden mb-6">
            <div className="divide-y divide-ethio-border">
              {feeRows.map((r, i) => (
                <div key={r.id || i} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="text-ethio-muted truncate max-w-[200px]">{r.title || `Property ${i + 1}`}</span>
                  <span className="font-semibold text-ethio-ink shrink-0 ml-4">ETB {r.fee.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-ethio-border bg-ethio-tint">
              <span className="font-bold text-ethio-primary">Total</span>
              <span className="font-bold text-ethio-primary text-lg">ETB {total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* ── Payment method ── */}
        {plan !== 'free' && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-ethio-ink mb-3">Payment method</p>
            <div className="space-y-3">
              {METHODS.map(m => (
                <label key={m.id}
                  className={`flex items-center gap-3 px-5 py-3.5 border-2 rounded-xl cursor-pointer transition ${method === m.id ? 'border-ethio-primary bg-ethio-tint' : 'border-ethio-border bg-white hover:border-ethio-primary/40'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${method === m.id ? 'border-ethio-primary' : 'border-ethio-border'}`}>
                    {method === m.id && <div className="w-2.5 h-2.5 rounded-full bg-ethio-primary" />}
                  </div>
                  <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="sr-only" />
                  <span className="text-sm font-medium text-ethio-ink">{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button onClick={handlePublish} disabled={loading}
          className="w-full py-3.5 bg-ethio-primary text-white font-bold rounded-xl hover:bg-ethio-primary-dark transition disabled:opacity-60 text-sm shadow-card">
          {loading
            ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : plan === 'free'
              ? '✓ Publish listing for free'
              : `Pay ETB ${total.toLocaleString()} & Publish`}
        </button>
        {plan === 'free' && (
          <p className="text-center text-xs text-ethio-muted mt-3">No payment required. Your listing goes live immediately.</p>
        )}
      </main>
    </div>
  )
}
