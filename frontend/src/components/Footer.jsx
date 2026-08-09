import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, MessageCircle, Clock, Facebook, Instagram, Twitter, Linkedin, Youtube, Apple, Smartphone } from 'lucide-react'
import Logo from './Logo.jsx'

export default function Footer() {
  const [email, setEmail]       = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <footer id="contact" className="footer-wave pt-20 pb-6 text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Newsletter */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 mb-14 flex flex-col lg:flex-row items-center gap-6 reveal">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-ethio-accent/20 text-ethio-accent text-xs font-bold rounded-full mb-2 border border-ethio-accent/30">
              <Mail size={12} /> NEWSLETTER
            </div>
            <h3 className="font-display font-bold text-xl text-white">Get monthly market insights — straight to your inbox</h3>
            <p className="text-sm text-white/60 mt-1">Rent index, neighborhood guides, diaspora tips. No spam.</p>
          </div>
          <form
            className="flex w-full lg:w-auto gap-2"
            onSubmit={(e) => { e.preventDefault(); setSubscribed(true) }}
          >
            <input
              type="email" required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 lg:w-72 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-ethio-accent transition"
            />
            <button type="submit" className="px-5 py-3 bg-ethio-accent text-ethio-ink font-semibold rounded-xl hover:bg-ethio-accent-light transition btn-shine whitespace-nowrap">
              {subscribed ? 'Subscribed ✓' : 'Subscribe'}
            </button>
          </form>
        </div>

        {/* Links grid */}
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <Logo size={40} />
              <div className="font-display font-bold text-xl">Ethio<span className="text-ethio-accent">Delala</span></div>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-sm">
              Ethiopia's most-trusted digital broker. Find, rent, or buy verified properties — with brokers you can actually trust.
            </p>
            <div className="flex items-center gap-2 mb-6">
              {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-ethio-accent hover:text-ethio-ink flex items-center justify-center transition">
                  <Icon size={16} />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <MapPin size={14} className="text-ethio-accent" />
              Bole Road, Friendship Building, Addis Ababa
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {['Properties','Agents','Services','About Us','Contact'].map(l => (
                <li key={l}><a href="#" className="hover:text-ethio-accent transition">{l}</a></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-white mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {['Apartments','Houses','Commercial','Land','Others'].map(l => (
                <li key={l}><a href="#" className="hover:text-ethio-accent transition">{l}</a></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {['Help Center','Trust & Safety','Terms of Use','Privacy Policy','FAQs'].map(l => (
                <li key={l}><a href="#" className="hover:text-ethio-accent transition">{l}</a></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-white mb-4">Contact Us</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2"><Phone size={14} className="text-ethio-accent" /> +251 11 123 4567</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-ethio-accent" /> info@ethiodelala.com</li>
              <li className="flex items-center gap-2"><MessageCircle size={14} className="text-ethio-accent" /> WhatsApp</li>
              <li className="flex items-center gap-2"><Clock size={14} className="text-ethio-accent" /> Mon–Sat 8–18</li>
            </ul>
            <div className="flex items-center gap-2 mt-5">
              {[[Apple,'App Store'],[Smartphone,'Google Play']].map(([Icon, label]) => (
                <a key={label} href="#" className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] flex items-center gap-1.5 transition">
                  <Icon size={14} />
                  <div className="text-left">
                    <div className="text-[8px] text-white/50 leading-none">GET IT ON</div>
                    <div className="font-semibold leading-none">{label}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div>
            © 2025 EthioDelala. All rights reserved.{' '}
            <span className="hidden sm:inline">·</span>{' '}
            <span className="block sm:inline">Powered by Ethio Telecom Technology</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-ethio-accent transition">Privacy</a>
            <a href="#" className="hover:text-ethio-accent transition">Terms</a>
            <a href="#" className="hover:text-ethio-accent transition">Cookies</a>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-full">
              <span>EN</span><span className="text-white/20">/</span>
              <span className="font-ethio">አማ</span><span className="text-white/20">/</span>
              <span>OR</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
