import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'

// ── Shared style helpers ──────────────────────────────────────────────────────
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

// ── Plain text field ──────────────────────────────────────────────────────────
function TextField({ type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{ ...baseInput, padding: '12px 16px' }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  )
}

// ── +251 phone field ──────────────────────────────────────────────────────────
// Fixed +251 prefix badge; user enters only local digits (no leading 0), max 9 digits
function PhoneField({ value, onChange }) {
  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
    onChange(digits)
  }

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{ display: 'flex', alignItems: 'stretch', border: '1.5px solid #D1D5DB', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.15s, box-shadow 0.15s' }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = '#01579B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(1,87,155,0.15)' }}
        onBlurCapture={e  => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none' }}
      >
        {/* prefix badge */}
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
      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, marginBottom: 12, marginLeft: 2 }}>
        Enter without the leading 0 — e.g. 911 234 567
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

// ── Field label ───────────────────────────────────────────────────────────────
function Label({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
      {children}{required && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}
    </label>
  )
}

// ── Register page ─────────────────────────────────────────────────────────────
export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [name,  setName]  = useState('')
  const [phone, setPhone] = useState('')   // local digits only, no +251
  const [email, setEmail] = useState('')
  const [pw,    setPw]    = useState('')
  const [cpw,   setCpw]   = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim())    { setError('Full name is required.'); return }
    if (!phone.trim())   { setError('Phone number is required.'); return }
    if (phone.length < 9){ setError('Enter your full 9-digit local number (e.g. 911 234 567).'); return }
    if (pw.length < 6)   { setError('Password must be at least 6 characters.'); return }
    if (pw !== cpw)      { setError("Passwords don't match."); return }

    // Prepend +251 for the backend
    const fullPhone = `+251${phone.trim()}`
    try {
      await register(name.trim(), email.trim(), fullPhone, pw)
      navigate('/profile', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 20, padding: '40px 32px 32px', boxShadow: '0 8px 40px rgba(1,87,155,0.10)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Logo size={44} />
          <div>
            <p style={{ fontWeight: 800, fontSize: 17, color: '#01579B', lineHeight: 1, margin: 0 }}>Ethio Delala</p>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>Find your home</p>
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Create your account</h2>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 22px' }}>Browse, save, and list properties all in one place.</p>

        {error && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Label required>Full name</Label>
          <TextField value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Abebe Kebede" autoComplete="name" />

          <Label required>Phone number</Label>
          <PhoneField value={phone} onChange={setPhone} />

          <Label>Email <span style={{ fontSize: 11, fontWeight: 400, color: '#9CA3AF' }}>(optional)</span></Label>
          <TextField type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />

          <Label required>Password</Label>
          <PasswordField value={pw}  onChange={e => setPw(e.target.value)}  placeholder="At least 6 characters" autoComplete="new-password" />

          <Label required>Confirm password</Label>
          <PasswordField value={cpw} onChange={e => setCpw(e.target.value)} placeholder="Repeat your password"   autoComplete="new-password" />

          <button type="submit" disabled={loading} style={{
            display: 'block', width: '100%', padding: '13px', marginTop: 6,
            background: loading ? '#9CA3AF' : '#01579B', color: '#fff',
            fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 10,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
          }}>
            {loading
              ? <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', verticalAlign: 'middle' }} />
              : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#01579B', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
