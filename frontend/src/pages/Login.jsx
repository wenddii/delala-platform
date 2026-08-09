import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'

// ── Shared input style helpers ──────────────────────────────────────────────
const baseInput = {
  display: 'block', width: '100%',
  fontSize: 14, lineHeight: '1.5',
  color: '#111827', background: '#fff',
  border: '1.5px solid #D1D5DB', borderRadius: 10,
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}
const onFocus = e => { e.target.style.borderColor = '#01579B'; e.target.style.boxShadow = '0 0 0 3px rgba(1,87,155,0.15)' }
const onBlur  = e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none' }

// ── +251 phone field ─────────────────────────────────────────────────────────
// Shows a fixed "+251" badge; user types only the local digits (e.g. 911234567)
function PhoneField({ value, onChange }) {
  const handleChange = (e) => {
    // Allow only digits, max 9 digits (Ethiopian local number without leading 0)
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
    onChange(digits)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', border: '1.5px solid #D1D5DB', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.15s, box-shadow 0.15s' }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = '#01579B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(1,87,155,0.15)' }}
        onBlurCapture={e  => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none' }}
      >
        {/* +251 badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: '#F8FAFC', borderRight: '1.5px solid #D1D5DB', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>🇪🇹</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>+251</span>
        </div>
        {/* digit input */}
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          placeholder="911 234 567"
          autoComplete="tel-national"
          style={{ ...baseInput, border: 'none', borderRadius: 0, padding: '12px 14px', flex: 1, outline: 'none', boxShadow: 'none' }}
        />
      </div>
      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, marginLeft: 2 }}>
        Enter your number without the leading 0 (e.g. 911 234 567)
      </p>
    </div>
  )
}

// ── Password field ────────────────────────────────────────────────────────────
function PasswordField({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{ ...baseInput, padding: '12px 44px 12px 16px' }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <button type="button" onClick={() => setShow(v => !v)} aria-label={show ? 'Hide password' : 'Show password'}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2, display: 'flex', alignItems: 'center' }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

// ── Login page ────────────────────────────────────────────────────────────────
export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from     = location.state?.from || null

  const [phone,    setPhone]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!phone.trim())    { setError('Phone number is required.'); return }
    if (phone.length < 9) { setError('Enter your full 9-digit local number (e.g. 911 234 567).'); return }
    if (!password.trim()) { setError('Password is required.');     return }

    // Send full international format to the backend
    const fullPhone = `+251${phone.trim()}`
    try {
      await login(fullPhone, password)
      navigate(from || '/profile', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 20, padding: '40px 32px 32px', boxShadow: '0 8px 40px rgba(1,87,155,0.10)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <Logo size={44} />
          <div>
            <p style={{ fontWeight: 800, fontSize: 17, color: '#01579B', lineHeight: 1, margin: 0 }}>Ethio Delala</p>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>Find your home</p>
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Welcome back</h2>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 22px' }}>Sign in to your account to continue.</p>

        {error && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Phone number <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <PhoneField value={phone} onChange={setPhone} />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Password <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <PasswordField value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />

          <button type="submit" disabled={loading} style={{
            display: 'block', width: '100%', padding: '13px', marginTop: 10,
            background: loading ? '#9CA3AF' : '#01579B', color: '#fff',
            fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 10,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
          }}>
            {loading
              ? <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', verticalAlign: 'middle' }} />
              : 'Log in'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/forgot-password" style={{ display: 'block', fontSize: 13, color: '#01579B', marginBottom: 10, textDecoration: 'none' }}>
            Forgot password?
          </Link>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#01579B', fontWeight: 700, textDecoration: 'none' }}>Sign Up</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
