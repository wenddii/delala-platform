import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Send, ArrowLeft, Phone, CheckCheck } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getListing } from '../services/propertyService.js'
import {
  getConversations, createConversation,
  getMessages, sendMessage, markMessageRead,
} from '../services/chatService.js'
import { parseDRFError } from '../services/api.js'
import { formatPrice } from '../data/properties.js'

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function formatMsgTime(isoStr) {
  if (!isoStr) return nowTime()
  const d = new Date(isoStr)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function ChatPage() {
  const { propertyId } = useParams()   // this is actually a listing id
  const { user }       = useAuth()
  const bottomRef      = useRef(null)

  const [listing,    setListing]    = useState(null)
  const [convId,     setConvId]     = useState(null)
  const [messages,   setMessages]   = useState([])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(true)
  const [sending,    setSending]    = useState(false)
  const [error,      setError]      = useState('')

  // Normalise listing shape
  const normListing = (l) => {
    const prop = l.property || {}
    return {
      ...l,
      listing:   l.listing_type || '',
      img:       l.primary_image?.image_url || '',
      agent:     l.owner_name   || 'Property Owner',
      verified:  l.is_verified  ?? false,
      agentPhone:l.owner_phone  || '+251912345678',
      price:     l.price        || 0,
      beds:      prop.bedrooms  ?? 0,
      baths:     prop.bathrooms ?? 0,
    }
  }

  // On mount: load listing, find/create conversation, load messages
  useEffect(() => {
    if (!user || !propertyId) return
    let cancelled = false
    setLoading(true)
    setError('')

    getListing(propertyId)
      .then(async (listingData) => {
        if (cancelled) return
        const norm = normListing(listingData)
        setListing(norm)

        // Rule 20/21: user cannot start a conversation with themselves
        const listingOwnerId = listingData.owner || listingData.property?.owner
        if (String(listingOwnerId) === String(user.id)) {
          setError('You cannot contact yourself — this is your own listing.')
          setLoading(false)
          return
        }

        // Rule 24: listing must be active before conversations can be created
        if (listingData.status && listingData.status !== 'active') {
          setError('This listing is not currently available for messaging.')
          setLoading(false)
          return
        }

        // Find existing conversation for this listing, or create one
        const convs = await getConversations()
        const existing = (Array.isArray(convs) ? convs : []).find(
          c => String(c.property_listing) === String(propertyId) ||
               String(c.property_listing?.id) === String(propertyId)
        )

        let cid
        if (existing) {
          cid = existing.id
        } else {
          // Rule 23: backend derives sender/owner from auth token — never send owner/customer
          const newConv = await createConversation({
            id:               crypto.randomUUID(),
            property_listing: propertyId,
          })
          cid = newConv.id
        }
        if (cancelled) return
        setConvId(cid)

        // Load messages for this conversation
        const allMsgs = await getMessages()
        if (cancelled) return
        const mine = (Array.isArray(allMsgs) ? allMsgs : [])
          .filter(m => String(m.conversation) === String(cid))
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        setMessages(mine)

        // Mark unread messages as read
        mine
          .filter(m => !m.is_read && String(m.sender) !== String(user.id))
          .forEach(m => markMessageRead(m.id).catch(() => {}))
      })
      .catch(err => { if (!cancelled) setError(parseDRFError(err)) })
      .finally(()  => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [propertyId, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || !convId || sending) return
    setSending(true)
    // Optimistic UI
    const optimistic = { id: `tmp-${Date.now()}`, conversation: convId, sender: user.id, content: text, is_read: false, created_at: new Date().toISOString(), _sending: true }
    setMessages(prev => [...prev, optimistic])
    setInput('')
    try {
      const saved = await sendMessage({
        id:           crypto.randomUUID(),
        conversation: convId,
        // Rule 23: sender is derived server-side from the auth token — never sent from frontend
        content:      text,
      })
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...saved, _sending: false } : m))
    } catch (_) {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }, [input, convId, sending, user])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F8FF', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ display: 'inline-block', width: 36, height: 36, border: '4px solid rgba(1,87,155,0.15)', borderTopColor: '#01579B', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>Loading chat… (first load may take 30–60 s)</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F8FF', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>{error || 'Listing not found'}</p>
          <Link to="/properties" style={{ color: '#01579B', fontSize: 13 }}>← Back to listings</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F8FF', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: 700, width: '100%', margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Property bar */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '14px 18px', marginBottom: 12, boxShadow: '0 2px 12px rgba(1,87,155,0.07)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to={`/property/${listing.id}`} style={{ color: '#01579B', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
            <ArrowLeft size={16}/> Back
          </Link>
          <div style={{ width: 1, height: 32, background: '#E5E7EB' }} />
          <div style={{ width: 48, height: 38, borderRadius: 8, overflow: 'hidden', background: '#BAE6FD', flexShrink: 0 }}>
            {listing.img && <img src={listing.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.title}</p>
            <p style={{ fontSize: 12, color: '#01579B', margin: '2px 0 0', fontWeight: 600 }}>
              {formatPrice(Number(listing.price) || 0, listing.listing)}
            </p>
          </div>
          <a href={`tel:${listing.agentPhone}`} style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', textDecoration: 'none' }} title="Call seller">
            <Phone size={16}/>
          </a>
        </div>

        {/* Seller info */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '14px 18px', marginBottom: 12, boxShadow: '0 2px 12px rgba(1,87,155,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#01579B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
            {listing.agent?.[0]?.toUpperCase() ?? 'S'}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{listing.agent}</p>
            <p style={{ fontSize: 11, color: '#22C55E', margin: '2px 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }}/> Online
            </p>
          </div>
          {listing.verified && (
            <span style={{ marginLeft: 'auto', padding: '3px 10px', background: '#DCFCE7', color: '#166534', fontSize: 11, fontWeight: 700, borderRadius: 20 }}>Verified</span>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 12, boxShadow: '0 2px 12px rgba(1,87,155,0.07)', overflowY: 'auto', minHeight: 300, maxHeight: 'calc(100vh - 380px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 'auto' }}>
              No messages yet. Say hello!
            </p>
          )}
          {messages.map(msg => {
            const isMe = String(msg.sender) === String(user.id)
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end', opacity: msg._sending ? 0.6 : 1 }}>
                {!isMe && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#01579B', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                    {listing.agent?.[0]?.toUpperCase() ?? 'S'}
                  </div>
                )}
                <div style={{ maxWidth: '72%' }}>
                  <div style={{ padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isMe ? '#01579B' : '#F0F8FF', color: isMe ? '#fff' : '#111827', fontSize: 14, lineHeight: '1.5' }}>
                    {msg.content}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>{formatMsgTime(msg.created_at)}</span>
                    {isMe && <CheckCheck size={12} style={{ color: msg.is_read ? '#22C55E' : '#9CA3AF' }}/>}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '10px 12px', boxShadow: '0 2px 12px rgba(1,87,155,0.07)', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            rows={1}
            style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: 14, lineHeight: '1.5', color: '#111827', background: 'transparent', fontFamily: 'inherit', maxHeight: 120, overflowY: 'auto' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', flexShrink: 0, background: input.trim() && !sending ? '#01579B' : '#E5E7EB', color: input.trim() && !sending ? '#fff' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !sending ? 'pointer' : 'not-allowed' }}
            aria-label="Send message"
          >
            <Send size={16}/>
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
