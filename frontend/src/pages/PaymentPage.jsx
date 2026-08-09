import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Zap, Star, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { updateListing } from '../services/propertyService.js'
import { parseDRFError } from '../services/api.js'

/**
 * PaymentPage
 *
 * Receives selectedProps from ListingPage via router state.
 * Each prop object should have: id (property id), listing_id (listing id), price, listing (listing_type), title.
 *
 * "Activating" a listing = PATCHing its status to 'active' via updateListing().
 * Payment gateway integration is a future TODO — currently only status update is performed.
 */

const PLANS = [
  {
    id:    'free',
    label: 'Free',
    desc:  'List your property at no cost. Standard visibility.',
    rate:  0,
    icon:  <CheckCircle size={22} />,
    color: '#6B7280',
    bg:    '#F9FAFB',
    border:'#D1D5DB',
  },
  {
    id:    'boost',
    label: 'Boost',
    desc:  '3% of property price. Featured placement + highlighted badge.',
    rate:  0.03,
    icon:  <Zap size={22} />,
    color: '#01579B',
    bg:    '#E3F2FD',
    border:'#29B6F6',
  },
  {
    id:    'premium',
    label: 'Premium Boost',
    desc:  '5% of property price. Homepage spotlight + priority search ranking.',
    rate:  0.05,
    icon:  <Star size={22} />,
    color: '#7C3AED',
    bg:    '#F5F3FF',
    border:'#A78BFA',
  },
]

const METHODS = [
  { id: 'telebirr', label: 'Tele birr' },
  { id: 'cbebirr',  label: 'CBE birr'  },
]

export default function PaymentPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  const [plan,    setPlan]    = useState('free')
  const [method,  setMethod]  = useState('telebirr')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const selectedIds   = location.state?.selectedIds   || []
  const selectedProps = location.state?.selectedProps || []

  const selectedPlan = PLANS.find(p => p.id === plan)
  const feeRows = selectedProps.map(p => ({
    ...p,
    fee: Math.round((Number(p.price) || 0) * selectedPlan.rate),
  }))
  const total = feeRows.reduce((s, r) => s + r.fee, 0)

  const handlePublish = async () => {
    if (plan !== 'free' && !method) {
      setError('Choose a payment method.')
      return
    }
    setLoading(true)
    setError('')
    try {
      // TODO: integrate a real payment gateway here before activating.
      // For now we activate listings directly (status → 'active').
      // Each selectedProp may carry listing_id (from ListingPage enrichment).
      await Promise.all(
        selectedProps.map(p => {
          const listingId = p.listing_id || p.id
          return updateListing(listingId, { status: 'active' }).catch(err => {
            // Non-fatal: listing may not exist yet if property was just created
            console.warn('Could not activate listing', listingId, parseDRFError(err))
          })
        })
      )
      navigate('/properties', { state: { paymentSuccess: true } })
    } catch (err) {
      setError(parseDRFError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-10">

        <div className="flex justify-end mb-6">
          <button onClick={() => navigate('/profile')}
            className="px-4 py-1.5 bg-ethio-accent text-white text-xs font-semibold rounded-full hover:opacity-90 transition">
            save &amp; exit
          </button>
        </div>

        <h1 className="text-2xl font-bold text-ethio-ink mb-2">Choose a listing plan</h1>
        <p className="text-sm text-ethio-muted mb-6">
          Select how you want to list your {selectedProps.length === 1 ? 'property' : 'properties'}.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        {/* Plan selector */}
        <div className="space-y-3 mb-7">
          {PLANS.map(p => {
            const isActive = plan === p.id
            return (
              <button key={p.id} type="button" onClick={() => setPlan(p.id)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:16, padding:'16px 18px', borderRadius:14, cursor:'pointer', textAlign:'left', border:`2px solid ${isActive ? p.border : '#E5E7EB'}`, background: isActive ? p.bg : '#fff', transition:'all 0.15s' }}>
                <span style={{ color: isActive ? p.color : '#9CA3AF', flexShrink: 0 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: isActive ? p.color : '#111827' }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{p.desc}</div>
                </div>
                {isActive && (
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Fee breakdown */}
        {selectedProps.length > 0 && (
          <div className="border border-ethio-border rounded-2xl overflow-hidden mb-6">
            <div className="divide-y divide-ethio-border">
              {feeRows.map((p, i) => (
                <div key={p.id || i} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="text-ethio-muted truncate max-w-[200px]">{p.title || `Property ${i + 1}`}</span>
                  <span className="font-semibold text-ethio-ink shrink-0 ml-4">
                    {plan === 'free'
                      ? <span className="text-green-600 font-bold">Free</span>
                      : `ETB ${p.fee.toLocaleString()}`}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-ethio-border bg-ethio-tint">
              <span className="font-bold text-ethio-primary">Total</span>
              <span className="font-bold text-ethio-primary text-lg">
                {plan === 'free' ? 'ETB 0 — Free' : `ETB ${total.toLocaleString()}`}
              </span>
            </div>
          </div>
        )}

        {/* Payment method */}
        {plan !== 'free' && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-ethio-ink mb-3">Payment method</p>
            <div className="space-y-3">
              {METHODS.map(m => (
                <label key={m.id}
                  className={`flex items-center gap-3 px-5 py-3.5 border-2 rounded-xl cursor-pointer transition ${
                    method === m.id ? 'border-ethio-primary bg-ethio-tint' : 'border-ethio-border bg-white hover:border-ethio-primary/40'
                  }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                    method === m.id ? 'border-ethio-primary' : 'border-ethio-border'
                  }`}>
                    {method === m.id && <div className="w-2.5 h-2.5 rounded-full bg-ethio-primary" />}
                  </div>
                  <input type="radio" name="method" value={m.id} checked={method === m.id}
                    onChange={() => setMethod(m.id)} className="sr-only" />
                  <span className="text-sm font-medium text-ethio-ink">{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Publish button */}
        <button
          onClick={handlePublish}
          disabled={loading}
          className="w-full py-3.5 bg-ethio-primary text-white font-bold rounded-xl hover:bg-ethio-primary-dark transition disabled:opacity-60 text-sm shadow-card"
        >
          {loading
            ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : plan === 'free'
              ? '✓ List for free — Publish now'
              : `Pay ETB ${total.toLocaleString()} & Publish`}
        </button>

        {plan === 'free' && (
          <p className="text-center text-xs text-ethio-muted mt-3">
            No payment required. Your listing goes live immediately.
          </p>
        )}
      </main>
    </div>
  )
}
