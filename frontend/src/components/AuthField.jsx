// Exact replica of .field / .input-wrap / .field-error from the HTML auth page
import { useState } from 'react'
import { AlertCircle, Eye, EyeOff, Check } from 'lucide-react'

export function AuthField({ label, id, name, type = 'text', placeholder, value, onChange, error, autoComplete, required, optional, suffix }) {
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
          {optional && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> (optional)</span>}
        </label>
      )}
      <div className={`input-wrap${suffix ? ' has-suffix' : ''}${error ? ' error' : ''}`}>
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
      {error && (
        <div className="field-error">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export function AuthPasswordField({ label, id, name, placeholder, value, onChange, error, autoComplete, showStrength, minLength }) {
  const [show, setShow] = useState(false)
  const strength = showStrength && value ? getStrength(value) : null

  return (
    <div className="field">
      {label && <label className="field-label" htmlFor={id}>{label}</label>}
      <div className={`input-wrap has-eye${error ? ' error' : ''}`}>
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          minLength={minLength}
        />
        <button
          type="button"
          className="eye-btn"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow(s => !s)}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {showStrength && value && strength && (
        <div className="strength show">
          <div
            className="strength-bar"
            style={{ '--w': strength.width, '--c': strength.color }}
          />
          <div className="strength-label">
            <span className="lbl">Password strength</span>
            <span className="lvl" style={{ color: strength.color, fontWeight: 600 }}>{strength.level}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="field-error">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export function AuthCheckbox({ id, checked, onChange, children }) {
  return (
    <label className="check">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />
      <span className="box">
        <Check size={11} />
      </span>
      {children}
    </label>
  )
}

function getStrength(pwd) {
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return { level: 'Weak',   color: '#EF4444', width: '25%' }
  if (score === 2) return { level: 'Fair',   color: '#F59E0B', width: '50%' }
  if (score === 3) return { level: 'Good',   color: '#3B82F6', width: '75%' }
  return               { level: 'Strong', color: '#16A34A', width: '100%' }
}
