import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import InputField from './InputField.jsx'
import { getPasswordStrength } from '../utils/validators.js'

export default function PasswordInput({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  showStrength = false,
}) {
  const [show, setShow] = useState(false)
  const strength = showStrength && value ? getPasswordStrength(value) : null

  return (
    <div>
      <InputField
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        error={error}
        autoComplete={autoComplete}
      >
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-md flex items-center justify-center transition-colors"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </InputField>

      {showStrength && value && strength && (
        <div className="mt-2">
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: '#D6DEE3' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: strength.width, background: strength.color }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-xs" style={{ color: '#8A94A0' }}>
            <span className="font-medium">Password strength</span>
            <span style={{ color: strength.color, fontWeight: 600 }}>{strength.level}</span>
          </div>
        </div>
      )}
    </div>
  )
}
