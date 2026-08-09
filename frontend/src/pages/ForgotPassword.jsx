import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, CheckCircle, Phone, KeyRound, Lock } from 'lucide-react'
import Logo from '../components/Logo.jsx'

/* ── Shared stable input ─────────────────────── */
function Field({ type = 'text', value, onChange, placeholder, autoComplete, disabled }) {
  const [show, setShow] = useState(false)
  const isPw = type === 'password'
  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <input
        type={isPw ? (show ? 'text' : 'password') : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        style={{
          display: 'block', width: '100%',
          padding: '11px 44px 11px 16px',
          fontSize: 14, lineHeight: '1.5',
          color: '#111827', background: disabled ? '#F9FAFB' : '#fff',
          border: '1.5px solid #D1D5DB', borderRadius: 10,
          outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={e => { if (!disabled) { e.target.style.borderColor = '#01579B'; e.target.style.boxShadow = '0 0 0 3px rgba(1,87,155,0.15)' } }}
        onBlur={e  => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none' }}
      />
      {isPw && (
        <button type="button" onClick={() => setShow(v => !v)}
          aria-label={show ? 'Hide' : 'Show'}
          style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', padding:2, display:'flex', alignItems:'center' }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  )
}

/* ── +251 phone field ────────────────────────── */
// Fixed country-code badge; user enters only the 9 local digits (no leading 0)
function PhoneField({ value, onChange, disabled }) {
  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
    onChange(digits)
  }
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: 'flex', alignItems: 'stretch',
          border: '1.5px solid #D1D5DB', borderRadius: 10,
          overflow: 'hidden', transition: 'border-color 0.15s, box-shadow 0.15s',
          background: disabled ? '#F9FAFB' : '#fff',
        }}
        onFocusCapture={e => { if (!disabled) { e.currentTarget.style.borderColor = '#01579B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(1,87,155,0.15)' } }}
        onBlurCapture={e  => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none' }}
      >
        {/* +251 badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: '#F8FAFC', borderRight: '1.5px solid #D1D5DB', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>🇪🇹</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>+251</span>
        </div>
        {/* digit-only input */}
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          placeholder="911 234 567"
          autoComplete="tel-national"
          disabled={disabled}
          style={{
            flex: 1, border: 'none', outline: 'none', boxShadow: 'none',
            padding: '11px 14px', fontSize: 14, lineHeight: '1.5',
            color: '#111827', background: 'transparent', boxSizing: 'border-box',
          }}
        />
      </div>
      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, marginLeft: 2 }}>
        Enter without the leading 0 — e.g. 911 234 567
      </p>
    </div>
  )
}

/* ── OTP boxes ───────────────────────────────── */
function OtpInput({ value, onChange }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6)

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const next = digits.map((d, j) => j === i ? '' : d).join('')
      onChange(next)
      if (i > 0 && !digits[i]) refs[i - 1].current?.focus()
    }
  }

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, j) => j === i ? char : d).join('')
    onChange(next)
    if (char && i < 5) refs[i + 1].current?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    refs[Math.min(pasted.length, 5)].current?.focus()
    e.preventDefault()
  }

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '20px 0' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          aria-label={`OTP digit ${i + 1}`}
          style={{
            width: 48, height: 52,
            textAlign: 'center', fontSize: 22, fontWeight: 700,
            color: '#111827', background: d ? '#EBF5FB' : '#F9FAFB',
            border: `2px solid ${d ? '#01579B' : '#D1D5DB'}`,
            borderRadius: 12, outline: 'none',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = '#01579B'; e.target.style.boxShadow = '0 0 0 3px rgba(1,87,155,0.15)' }}
          onBlur={e  => { e.target.style.borderColor = d ? '#01579B' : '#D1D5DB'; e.target.style.boxShadow = 'none' }}
        />
      ))}
    </div>
  )
}

/* ── Progress steps ──────────────────────────── */
function Steps({ current }) {
  const steps = [
    { n: 1, label: 'Phone', icon: Phone   },
    { n: 2, label: 'Verify', icon: KeyRound },
    { n: 3, label: 'Reset', icon: Lock    },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28 }}>
      {steps.map((s, idx) => {
        const done    = current > s.n
        const active  = current === s.n
        const Icon    = s.icon
        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done ? '#01579B' : active ? '#EBF5FB' : '#F3F4F6',
                border: `2px solid ${done || active ? '#01579B' : '#E5E7EB'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {done
                  ? <CheckCircle size={18} style={{ color: '#fff' }} />
                  : <Icon size={16} style={{ color: active ? '#01579B' : '#9CA3AF' }} />
                }
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#01579B' : done ? '#374151' : '#9CA3AF' }}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{
                width: 48, height: 2, margin: '0 4px',
                background: done ? '#01579B' : '#E5E7EB',
                marginBottom: 18, transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Main page ───────────────────────────────── */
export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step,     setStep]     = useState(1)   // 1 | 2 | 3
  const [phone,    setPhone]    = useState('')   // local digits only (no +251, no leading 0)
  const [otp,      setOtp]      = useState('')
  const [newPw,    setNewPw]    = useState('')
  const [confirmPw,setConfirmPw]= useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [resendSec,setResendSec]= useState(0)
  const timerRef = useRef(null)

  // Countdown for resend
  useEffect(() => {
    if (resendSec > 0) {
      timerRef.current = setTimeout(() => setResendSec(s => s - 1), 1000)
    }
    return () => clearTimeout(timerRef.current)
  }, [resendSec])

  const startResendTimer = () => setResendSec(60)

  /* Step 1 — send OTP */
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!phone.trim())    { setError('Enter your phone number.'); return }
    if (phone.length < 9) { setError('Enter your full 9-digit local number (e.g. 911 234 567).'); return }
    setLoading(true)
    // TODO: call real OTP endpoint — POST /api/accounts/password-reset/ with { phone_number: `+251${phone}` }
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setStep(2)
    startResendTimer()
  }

  /* Step 2 — verify OTP */
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (otp.replace(/\D/g, '').length < 6) { setError('Enter the 6-digit code.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    // Mock: accept any 6-digit OTP
    setStep(3)
  }

  /* Step 2 — resend */
  const handleResend = async () => {
    if (resendSec > 0) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setOtp('')
    startResendTimer()
  }

  /* Step 3 — reset password */
  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    if (newPw.length < 6)         { setError('Password must be at least 6 characters.'); return }
    if (newPw !== confirmPw)       { setError("Passwords don't match."); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setStep(4) // success
  }

  const cardStyle = {
    width: '100%', maxWidth: 400,
    background: '#fff', border: '1px solid #E5E7EB',
    borderRadius: 20, padding: '36px 32px 28px',
    boxShadow: '0 8px 40px rgba(1,87,155,0.10)',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={cardStyle}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <Logo size={40} />
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#01579B', lineHeight: 1, margin: 0 }}>Ethio delala</p>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>Find your home</p>
          </div>
        </div>

        {step < 4 && <Steps current={step} />}

        {error && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
            {error}
          </div>
        )}

        {/* ── STEP 1: enter phone ── */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Forgot your password?</h2>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px', lineHeight: 1.6 }}>
              No problem. Enter your registered phone number and we'll send a verification code.
            </p>
            <form onSubmit={handleSendOtp} noValidate>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Phone number <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <PhoneField value={phone} onChange={setPhone} />
              <button type="submit" disabled={loading} style={submitBtnStyle(loading)}>
                {loading ? <Spinner /> : 'Send verification code'}
              </button>
            </form>
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#01579B', textDecoration: 'none', fontWeight: 600 }}>
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </div>
          </>
        )}

        {/* ── STEP 2: enter OTP ── */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Enter verification code</h2>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 4px', lineHeight: 1.6 }}>
              A 6-digit code was sent to
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#01579B', margin: '0 0 4px' }}>
              +251{phone}
            </p>
            <button type="button" onClick={() => { setStep(1); setOtp(''); setError('') }}
              style={{ background: 'none', border: 'none', fontSize: 12, color: '#9CA3AF', cursor: 'pointer', padding: 0, marginBottom: 4, textDecoration: 'underline' }}>
              Change number
            </button>

            <form onSubmit={handleVerifyOtp} noValidate>
              <OtpInput value={otp} onChange={setOtp} />

              <button type="submit" disabled={loading || otp.replace(/\D/g,'').length < 6} style={submitBtnStyle(loading || otp.replace(/\D/g,'').length < 6)}>
                {loading ? <Spinner /> : 'Verify code'}
              </button>
            </form>

            {/* Resend */}
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              {resendSec > 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                  Resend code in <strong style={{ color: '#374151' }}>{resendSec}s</strong>
                </p>
              ) : (
                <button type="button" onClick={handleResend}
                  style={{ background: 'none', border: 'none', fontSize: 13, color: '#01579B', cursor: 'pointer', fontWeight: 600 }}>
                  Didn't receive a code? Resend
                </button>
              )}
            </div>
          </>
        )}

        {/* ── STEP 3: new password ── */}
        {step === 3 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Create new password</h2>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px', lineHeight: 1.6 }}>
              Your identity is verified. Choose a strong new password.
            </p>
            <form onSubmit={handleReset} noValidate>
              <Field type="password" value={newPw}     onChange={e => setNewPw(e.target.value)}     placeholder="New password (min. 6 chars)"  autoComplete="new-password" />
              <Field type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm new password"          autoComplete="new-password" />

              {/* Strength bar */}
              {newPw.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ height: 4, borderRadius: 4, background: '#E5E7EB', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4, transition: 'width 0.3s, background 0.3s',
                      width: newPw.length < 6 ? '25%' : newPw.length < 10 ? '60%' : '100%',
                      background: newPw.length < 6 ? '#EF4444' : newPw.length < 10 ? '#F59E0B' : '#22C55E',
                    }} />
                  </div>
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                    {newPw.length < 6 ? 'Weak — add more characters' : newPw.length < 10 ? 'Fair — getting better' : '✓ Strong password'}
                  </p>
                </div>
              )}

              <button type="submit" disabled={loading} style={submitBtnStyle(loading)}>
                {loading ? <Spinner /> : 'Reset password'}
              </button>
            </form>
          </>
        )}

        {/* ── STEP 4: success ── */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle size={32} style={{ color: '#16A34A' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Password reset!</h2>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 24px', lineHeight: 1.6 }}>
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Link to="/login" style={{
              display: 'block', width: '100%', padding: '12px 16px',
              background: '#01579B', color: '#fff', fontWeight: 700, fontSize: 15,
              borderRadius: 10, textDecoration: 'none', textAlign: 'center',
              boxSizing: 'border-box',
            }}>
              Sign in now
            </Link>
          </div>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ── Helpers ─────────────────────────────────── */
function submitBtnStyle(disabled) {
  return {
    display: 'block', width: '100%', padding: '12px 16px',
    background: disabled ? '#9CA3AF' : '#01579B',
    color: '#fff', fontWeight: 700, fontSize: 15,
    border: 'none', borderRadius: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s', boxSizing: 'border-box',
  }
}

function Spinner() {
  return (
    <span style={{ display:'inline-block', width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', verticalAlign:'middle' }} />
  )
}
