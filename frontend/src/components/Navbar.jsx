import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Search, Bell, Plus, ArrowRight, Menu, Globe,
  ChevronDown, X, LogOut, User, MessageCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from './Logo.jsx'

// Nav: Home, Properties, How It Works, About, Contact
const NAV_LINKS = [
  { label: 'Home',         href: '/',                isRoute: true  },
  { label: 'Properties',   href: '/properties',      isRoute: true  },
  { label: 'How It Works', href: '#how-it-works',    isRoute: false },
  { label: 'About',        href: '#why-ethiodelala', isRoute: false },
  { label: 'Contact',      href: '#contact',         isRoute: false },
]

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lang,       setLang]       = useState('EN')
  const [langOpen,   setLangOpen]   = useState(false)
  const [userOpen,   setUserOpen]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ,    setSearchQ]    = useState('')
  const searchInputRef = useRef(null)
  const langRef  = useRef(null)
  const userRef  = useRef(null)
  const navigate = useNavigate()
  const { isAuthenticated, isSeller, user, logout } = useAuth()

  // Shrink on scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const fn = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50)
  }, [searchOpen])

  const handleAnchorNav = (href) => {
    // If already on home page, just scroll
    if (window.location.pathname === '/') {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      // Navigate home then scroll after arrival
      navigate('/', { state: { scrollTo: href } })
    }
  }
  const closeSearch = () => { setSearchOpen(false); setSearchQ('') }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQ.trim()) return
    closeSearch()
    // If signed in, search can also match user names; otherwise properties only
    navigate(`/properties?q=${encodeURIComponent(searchQ.trim())}`)
  }

  const handleLogout = () => {
    logout()
    setUserOpen(false)
    navigate('/')
  }

  return (
    <>
      {/* ── Dark top utility bar (restored from original) ── */}
      <div className="bg-ethio-ink text-white/80 text-xs border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between h-9">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="pulse-dot" /> All systems operational
            </span>
            <span className="hidden md:inline text-white/40">·</span>
            <span className="hidden md:inline">+251 11 123 4567</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#help"    className="hidden sm:inline hover:text-white transition">Help Center</a>
            <a href="#agents"  className="hidden sm:inline hover:text-white transition">For Agents</a>

            {/* Language switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1.5 hover:text-white transition"
                aria-label="Select language"
              >
                <Globe size={14} /><span>{lang}</span><ChevronDown size={12} />
              </button>
              <div className={`lang-menu absolute right-0 top-full mt-2 bg-white text-ethio-ink rounded-xl shadow-soft-lg border border-ethio-border overflow-hidden min-w-[160px] z-50 ${langOpen ? 'open' : ''}`}>
                {[['EN','🇬🇧','English'],['AM','🇪🇹','አማርኛ'],['OR','🇪🇹','Afan Oromo']].map(([code, flag, label]) => (
                  <button key={code}
                    onClick={() => { setLang(code); setLangOpen(false) }}
                    className="w-full text-left px-4 py-2.5 hover:bg-ethio-tint flex items-center gap-2 text-sm"
                  >
                    <span className="text-base">{flag}</span> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main sticky header ── */}
      <header
        id="site-header"
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-ethio-border transition-all duration-300 ${scrolled ? 'header-shrunk' : ''}`}
      >
        <div
          id="header-inner"
          className={`max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-20'}`}
        >
          {/* ── Logo (left only, no duplicate on right) ── */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="EthioDelala home">
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Logo size={40} />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-lg tracking-tight">
                Ethio<span className="text-ethio-primary">Delala</span>
              </div>
              <div className="text-[10px] text-ethio-muted -mt-0.5 hidden sm:block">
                Powered by Ethio Telecom
              </div>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href, isRoute }) =>
              isRoute ? (
                <NavLink
                  key={label}
                  to={href}
                  end={href === '/'}
                  className={({ isActive }) =>
                    `px-3.5 py-2 text-sm font-medium rounded-lg transition ${
                      isActive
                        ? 'text-ethio-primary bg-ethio-tint font-semibold'
                        : 'text-ethio-muted hover:text-ethio-primary hover:bg-ethio-tint'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ) : (
                <button
                  key={label}
                  onClick={() => handleAnchorNav(href)}
                  className="px-3.5 py-2 text-sm font-medium text-ethio-muted hover:text-ethio-primary transition rounded-lg hover:bg-ethio-tint"
                >
                  {label}
                </button>
              )
            )}
          </nav>

          {/* ── Right CTAs ── */}
          <div className="flex items-center gap-2">

            {/* Search — expands inline on click */}
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center gap-1">
                <input
                  ref={searchInputRef}
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder={isAuthenticated ? 'Search properties or people…' : 'Search properties…'}
                  className="w-56 px-3 py-2 text-sm border border-ethio-border rounded-lg outline-none focus:border-ethio-primary focus:ring-2 focus:ring-ethio-primary/20 transition bg-white text-ethio-ink"
                  aria-label="Search"
                />
                <button type="submit" className="flex items-center justify-center w-9 h-9 rounded-lg bg-ethio-primary text-white hover:bg-ethio-primary-dark transition" aria-label="Search">
                  <Search size={15} />
                </button>
                <button type="button" onClick={closeSearch} className="flex items-center justify-center w-9 h-9 rounded-lg text-ethio-muted hover:bg-ethio-tint transition" aria-label="Close search">
                  <X size={15} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  if (!isAuthenticated && false) { navigate('/login'); return } // search is public
                  setSearchOpen(true)
                }}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl text-ethio-muted hover:text-ethio-primary hover:bg-ethio-tint transition"
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            )}

            {/* Chat icon — only shown when authenticated */}
            {isAuthenticated && (
              <Link
                to="/conversations"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl text-ethio-muted hover:text-ethio-primary hover:bg-ethio-tint transition relative"
                aria-label="My chats"
              >
                <MessageCircle size={16} />
              </Link>
            )}

            {/* Bell (authenticated only) */}
            {isAuthenticated && (
              <button
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl text-ethio-muted hover:text-ethio-primary hover:bg-ethio-tint transition relative"
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-ethio-accent rounded-full" />
              </button>
            )}

            {/* Seller: List Properties */}
            {isSeller && (
              <Link
                to="/list-property"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-ethio-accent rounded-xl hover:opacity-90 transition shadow-soft"
              >
                <Plus size={16} /> List Properties
              </Link>
            )}

            {/* Unauthenticated: List Properties */}
            {!isAuthenticated && (
              <Link
                to="/login"
                state={{ intent: 'add-property' }}
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-ethio-primary border border-ethio-primary/20 rounded-xl hover:bg-ethio-tint transition"
              >
                <Plus size={16} /> List Properties
              </Link>
            )}

            {/* Authenticated: user dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-ethio-tint transition"
                  aria-label="User menu"
                  aria-expanded={userOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-ethio-primary flex items-center justify-center text-white text-xs font-bold select-none">
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold text-ethio-ink max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown size={14} className="text-ethio-muted" />
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-soft-lg border border-ethio-border overflow-hidden min-w-[200px] z-50">
                    <div className="px-4 py-3 border-b border-ethio-border">
                      <div className="text-sm font-semibold text-ethio-ink truncate">{user?.name}</div>
                      <div className="text-xs text-ethio-muted mt-0.5 capitalize">
                        {isSeller ? 'Seller / Owner' : user?.role}
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ethio-ink hover:bg-ethio-tint transition"
                    >
                      <User size={15} className="text-ethio-primary" /> My Profile
                    </Link>

                    <Link
                      to="/conversations"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ethio-ink hover:bg-ethio-tint transition"
                    >
                      <MessageCircle size={15} className="text-ethio-primary" /> My Chats
                    </Link>

                    <Link
                      to="/add-property"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ethio-ink hover:bg-ethio-tint transition"
                    >
                      <Plus size={15} className="text-ethio-primary" /> Add Property
                    </Link>

                    <div className="border-t border-ethio-border">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                      >
                        <LogOut size={15} /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Sign In button */
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-ethio-primary rounded-xl hover:bg-ethio-primary-dark transition btn-shine shadow-soft"
              >
                Sign In <ArrowRight size={16} />
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              id="mobile-toggle"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-ethio-ink hover:bg-ethio-tint"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div id="mobile-menu" className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ethio-ink/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="mobile-menu open absolute right-0 top-0 bottom-0 w-80 bg-white shadow-soft-lg p-6 overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2"
              >
                <Logo size={32} />
                <span className="font-display font-bold">
                  Ethio<span className="text-ethio-primary">Delala</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-ethio-tint flex items-center justify-center"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* User info strip */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 p-3 bg-ethio-tint rounded-xl mb-5">
                <div className="w-9 h-9 rounded-full bg-ethio-primary flex items-center justify-center text-white text-sm font-bold select-none">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-ethio-ink">{user?.name}</div>
                  <div className="text-xs text-ethio-muted capitalize">
                    {isSeller ? 'Seller / Owner' : user?.role}
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex flex-col gap-1 mb-6">
              {NAV_LINKS.map(({ label, href, isRoute }) =>
                isRoute ? (
                  <Link
                    key={label}
                    to={href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl hover:bg-ethio-tint text-ethio-ink font-medium text-sm"
                  >
                    {label}
                  </Link>
                ) : (
                  <button
                    key={label}
                    onClick={() => { setMobileOpen(false); handleAnchorNav(href) }}
                    className="px-4 py-3 rounded-xl hover:bg-ethio-tint text-ethio-ink font-medium text-sm text-left"
                  >
                    {label}
                  </button>
                )
              )}
            </nav>

            {/* Action buttons */}
            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 w-full py-3 px-4 bg-white border border-ethio-primary/30 text-ethio-primary font-semibold rounded-xl text-sm"
                  >
                    <User size={16} /> My Profile
                  </Link>
                  <Link
                    to="/conversations"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 w-full py-3 px-4 bg-white border border-ethio-primary/30 text-ethio-primary font-semibold rounded-xl text-sm"
                  >
                    <MessageCircle size={16} /> My Chats
                  </Link>
                  <Link
                    to="/list-property"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-ethio-accent text-white font-semibold rounded-xl text-sm"
                  >
                    <Plus size={16} /> List Properties
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false) }}
                    className="w-full py-3 text-center border border-red-200 text-red-500 font-semibold rounded-xl bg-white text-sm"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    state={{ intent: 'add-property' }}
                    onClick={() => setMobileOpen(false)}
                    className="block w-full py-3 text-center bg-white border border-ethio-primary/30 text-ethio-primary font-semibold rounded-xl text-sm"
                  >
                    List Properties
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full py-3 text-center bg-ethio-primary text-white font-semibold rounded-xl text-sm"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
