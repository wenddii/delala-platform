/**
 * chatService.js
 *
 * Wraps /api/chat/ endpoints.
 * All endpoints require IsAuthenticated.
 *
 * Models:
 *   Conversation: { id, property_listing, customer, owner, created_at }
 *   Message:      { id, conversation, sender, content, is_read, created_at }
 *
 * ⚠️  chat/urls.py uses <int:pk> for conversations and messages,
 *     but the model id field is CharField(max_length=50).
 *     This is a backend inconsistency — using string PKs in requests.
 */
import api from './api.js'

// GET /api/chat/conversations/   — all conversations for authenticated user
export const getConversations = () =>
  api.get('/api/chat/conversations/').then(r => r.data)

// POST /api/chat/conversations/
// Body: { id, property_listing, customer, owner }
export const createConversation = (body) =>
  api.post('/api/chat/conversations/', body).then(r => r.data)

// GET /api/chat/conversations/<pk>/
export const getConversation = (pk) =>
  api.get(`/api/chat/conversations/${pk}/`).then(r => r.data)

// GET /api/chat/messages/   — all messages (filter by conversation client-side)
export const getMessages = () =>
  api.get('/api/chat/messages/').then(r => r.data)

// POST /api/chat/messages/
// Body: { id, conversation, sender, content }
export const sendMessage = (body) =>
  api.post('/api/chat/messages/', body).then(r => r.data)

// PATCH /api/chat/messages/<pk>/   — mark as read
export const markMessageRead = (pk) =>
  api.patch(`/api/chat/messages/${pk}/`, { is_read: true }).then(r => r.data)
