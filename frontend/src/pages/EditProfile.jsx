import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Check } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { uploadToImgBB } from '../utils/imageUpload.js'

const inp = {
  display: 'block', width: '100%', padding: '11px 14px',
  fontSize: 14, lineHeight: '1.5', color: '#111827',
  background: '#fff', border: '1.5px solid #D1D5DB',
  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}
const focus = (e) => { e.target.style.borderColor = '#01579B'; e.target.style.boxShadow = '0 0 0 3px rgba(1,87,155,0.15)' }
const blur  = (e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none' }

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export default function EditProfile() {
  const { user, updateProfile, loading } = useAuth()
  const navigate  = useNavigate()
  const avatarRef = useRef(null)

  const [name,       setName]          = useState(user?.name       || user?.full_name || '')
  const [email,      setEmail]          = useState(user?.email      || '')
  const [phone,      setPhone]          = useState(user?.phone      || user?.phone_number || '')
  const [avatarPrev, setAvatarPrev]     = useState(user?.avatarUrl  || null)
  const [avatarFile, setAvatarFile]     = useState(null)   // pending File to upload on save
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saved,      setSaved]          = useState(false)
  const [error,      setError]          = useState('')

  // Show a local preview immediately on file pick, defer actual upload to save time
  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Validate — only images
    if (!file.type.startsWith('image/')) {
      setError('Avatar must be an image file (JPG, PNG, WebP, etc.).')
      return
    }
    setError('')
    setAvatarFile(file)
    // Local blob URL just for the preview — not sent to backend
    setAvatarPrev(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim())  { setError('Full name is required.');    return }
    if (!phone.trim()) { setError('Phone number is required.'); return }
    try {
      let hostedAvatarUrl = user?.avatarUrl || null

      // If the user picked a new avatar file, upload it to ImgBB first
      if (avatarFile) {
        setAvatarUploading(true)
        hostedAvatarUrl = await uploadToImgBB(avatarFile, `avatar-${Date.now()}`)
        setAvatarUploading(false)
        // Update the preview to the now-permanent URL
        setAvatarPrev(hostedAvatarUrl)
        setAvatarFile(null)
      }

      await updateProfile({
        name:      name.trim(),
        full_name: name.trim(),
        email:     email.trim(),
        phone:     phone.trim(),
        avatarUrl: hostedAvatarUrl,
      })
      setSaved(true)
      setTimeout(() => navigate('/profile'), 1200)
    } catch (err) {
      setAvatarUploading(false)
      setError(err.message || 'Could not save profile.')
    }
  }

  const isBusy = loading || avatarUploading || saved

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar />
      <main style={{ maxWidth: 520, margin: '0 auto', padding: '40px 16px 80px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 28 }}>Edit profile</h1>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ position: 'relative', width: 88, height: 88 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: avatarPrev ? 'transparent' : '#01579B', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #E3F2FD' }}>
              {avatarPrev
                ? <img src={avatarPrev} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#fff', fontSize: 32, fontWeight: 700 }}>{name?.[0]?.toUpperCase() ?? 'U'}</span>
              }
            </div>
            <button type="button" onClick={() => avatarRef.current?.click()}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#01579B', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              aria-label="Change photo">
              <Camera size={14} style={{ color: '#fff' }} />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
          </div>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>Click the camera to upload a photo</p>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>{error}</div>
        )}
        {saved && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={16} /> Profile saved! Redirecting…
          </div>
        )}

        <form onSubmit={handleSave} noValidate style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 4px 20px rgba(1,87,155,0.07)', border: '1px solid #E5E7EB' }}>
          <Field label="Full name" required>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={inp} onFocus={focus} onBlur={blur} />
          </Field>
          <Field label="Phone number" required>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#546E7A', fontWeight: 600, pointerEvents: 'none' }}>🇪🇹 +251</span>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="91 234 5678" style={{ ...inp, paddingLeft: 76 }} onFocus={focus} onBlur={blur} />
            </div>
          </Field>
          <Field label="Email">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inp} onFocus={focus} onBlur={blur} />
          </Field>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={() => navigate('/profile')}
              style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #D1D5DB', background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={isBusy}
              style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: isBusy ? '#9CA3AF' : '#01579B', fontSize: 14, fontWeight: 700, color: '#fff', cursor: isBusy ? 'not-allowed' : 'pointer' }}>
              {saved
                ? '✓ Saved!'
                : avatarUploading
                  ? <span style={{ display:'inline-flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                      <span style={{ display:'inline-block', width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
                      Uploading photo…
                    </span>
                  : loading
                    ? <span style={{ display:'inline-block', width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', verticalAlign:'middle' }} />
                    : 'Save changes'}
            </button>
          </div>
        </form>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
