import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Eager-load public pages
import Home           from './pages/Home.jsx'
import Login          from './pages/Login.jsx'
import Register       from './pages/Register.jsx'
import Properties     from './pages/Properties.jsx'
import PropertyDetail from './pages/PropertyDetail.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'

// Lazy-load authenticated pages
const UserProfile  = lazy(() => import('./pages/UserProfile.jsx'))
const EditProfile  = lazy(() => import('./pages/EditProfile.jsx'))
const AddProperty  = lazy(() => import('./pages/AddProperty.jsx'))
const ListingPage  = lazy(() => import('./pages/ListingPage.jsx'))
const PaymentPage  = lazy(() => import('./pages/PaymentPage.jsx'))
const ChatPage     = lazy(() => import('./pages/ChatPage.jsx'))

// Simple conversations list page — lists all chats
const ConversationsPage = lazy(() => import('./pages/ConversationsPage.jsx'))

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-ethio-primary/20 border-t-ethio-primary rounded-full animate-spin" />
    </div>
  )
}

const Auth = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"                element={<Home />} />
          <Route path="/properties"      element={<Properties />} />
          <Route path="/property/:id"    element={<PropertyDetail />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ── Authenticated ── */}
          <Route path="/profile"         element={<Auth><UserProfile /></Auth>} />
          <Route path="/edit-profile"    element={<Auth><EditProfile /></Auth>} />
          <Route path="/add-property"    element={<Auth><AddProperty /></Auth>} />
          <Route path="/list-property"   element={<Auth><ListingPage /></Auth>} />
          <Route path="/payment"         element={<Auth><PaymentPage /></Auth>} />
          <Route path="/chat/:propertyId" element={<Auth><ChatPage /></Auth>} />
          <Route path="/conversations"   element={<Auth><ConversationsPage /></Auth>} />

          {/* ── Legacy redirects ── */}
          <Route path="/buyer-profile"   element={<Navigate to="/profile" replace />} />
          <Route path="/seller-profile"  element={<Navigate to="/profile" replace />} />
          <Route path="/seller-dashboard" element={<Navigate to="/profile" replace />} />
          {/* Verification is no longer in the listing flow — redirect to profile */}
          <Route path="/verification"    element={<Navigate to="/profile" replace />} />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
