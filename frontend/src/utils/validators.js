export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidEthiopianPhone(phone) {
  const stripped = phone.replace(/\s/g, '')
  return stripped === '' || /^\d{9,10}$/.test(stripped)
}

export function getPasswordStrength(password) {
  if (!password) return { level: '', score: 0, color: '', width: '0%' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { level: 'Weak',   score, color: '#EF4444', width: '25%' }
  if (score === 2) return { level: 'Fair',   score, color: '#F59E0B', width: '50%' }
  if (score === 3) return { level: 'Good',   score, color: '#3B82F6', width: '75%' }
  return               { level: 'Strong', score, color: '#16A34A', width: '100%' }
}

export function priceValToETB(v) {
  if (v >= 100) return '80K+'
  return Math.round(10 + (v / 100) * 70) + 'K'
}
