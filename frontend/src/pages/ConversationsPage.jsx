import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getConversations, getMessages } from '../services/chatService.js'
import { getListings } from '../services/propertyService.js'
import { parseDRFError } from '../services/api.js'

export default function ConversationsPage() {
  const { user } = useAuth()
  const [convs,    setConvs]   = useState([])
  const [loading,  setLoading] = useState(true)
  const [error,    setError]   = useState('')

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    setError('')

    // Fetch conversations + listings (for thumbnails/titles) + messages (for last message preview)
    Promise.all([getConversations(), getListings(), getMessages()])
      .then(([convData, listingsData, messagesData]) => {
        if (cancelled) return
        const listings  = Array.isArray(listingsData)  ? listingsData  : []
        const messages  = Array.isArray(messagesData)  ? messagesData  : []
        const convList  = Array.isArray(convData)       ? convData      : []

        const enriched = convList.map(c => {
          // Resolve the listing this conversation is about
          const listing = listings.find(
            l => String(l.id) === String(c.property_listing) ||
                 String(l.id) === String(c.property_listing?.id)
          )
          // Find messages for this conversation, pick the latest
          const convMessages = messages
            .filter(m => String(m.conversation) === String(c.id))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          const lastMsg = convMessages[0]
          const unread  = convMessages.filter(
            m => !m.is_read && String(m.sender) !== String(user.id)
          ).length

          // Format time
          const timeStr = lastMsg
            ? new Date(lastMsg.created_at).toLocaleDateString('en-ET', { month: 'short', day: 'numeric' })
            : new Date(c.created_at).toLocaleDateString('en-ET', { month: 'short', day: 'numeric' })

          const otherPerson = String(c.customer) === String(user.id) ? c.owner_name : c.customer_name

          return {
            id:          c.id,
            listingId:   listing?.id || c.property_listing,
            title:       listing?.title || 'Property',
            img:         listing?.primary_image?.image_url || '',
            agent:       otherPerson || 'Property owner',
            lastMessage: lastMsg?.content || 'Start a conversation…',
            time:        timeStr,
            unread,
          }
        })
        setConvs(enriched)
      })
      .catch(err => { if (!cancelled) setError(parseDRFError(err)) })
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 lg:px-8 py-10">
        <h1 className="text-xl font-bold text-ethio-ink mb-6">My Chats</h1>

        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <span className="inline-block w-9 h-9 border-4 border-ethio-primary/20 border-t-ethio-primary rounded-full animate-spin" />
            <p className="text-sm text-ethio-muted">Loading conversations…</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button onClick={() => window.location.reload()}
              className="px-4 py-2 bg-ethio-primary text-white text-xs font-semibold rounded-full">Retry</button>
          </div>
        )}

        {!loading && !error && convs.length === 0 && (
          <div className="flex flex-col items-center py-20 text-ethio-muted">
            <MessageCircle size={40} className="mb-4 opacity-30" />
            <p className="text-base font-medium">No conversations yet</p>
            <p className="text-sm mt-1">Contact a seller from any property listing to start chatting.</p>
          </div>
        )}

        {!loading && !error && convs.length > 0 && (
          <div className="space-y-2">
            {convs.map(c => (
              <Link
                key={c.id}
                to={`/chat/${c.listingId}`}
                className="flex items-center gap-4 p-4 border border-ethio-border rounded-2xl bg-white hover:border-ethio-primary/50 hover:bg-ethio-tint transition group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-ethio-tint shrink-0">
                  {c.img && <img src={c.img} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-ethio-ink truncate">{c.title}</p>
                    <span className="text-[11px] text-ethio-muted shrink-0">{c.time}</span>
                  </div>
                  <p className="text-xs text-ethio-muted mt-0.5">
                    with <span className="font-semibold">{c.agent}</span>
                  </p>
                  <p className="text-xs text-ethio-muted truncate mt-0.5">{c.lastMessage}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-ethio-primary text-white text-[10px] font-bold flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                  <ArrowRight size={16} className="text-ethio-muted group-hover:text-ethio-primary transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
