import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import HeroSection from '../components/home/HeroSection.jsx'
import SearchForm from '../components/home/SearchForm.jsx'
import SearchResults from '../components/home/SearchResults.jsx'
import CategoryTiles from '../components/home/CategoryTiles.jsx'
import FeaturedListings from '../components/home/FeaturedListings.jsx'
import WhyEthioDelala from '../components/home/WhyEthioDelala.jsx'
import VerifiedShowcase from '../components/home/VerifiedShowcase.jsx'
import BrowseByCity from '../components/home/BrowseByCity.jsx'
import HowItWorks from '../components/home/HowItWorks.jsx'
import Testimonials from '../components/home/Testimonials.jsx'
import StatsBar from '../components/home/StatsBar.jsx'
import CtaBanner from '../components/home/CtaBanner.jsx'
import BlogSection from '../components/home/BlogSection.jsx'

export default function Home() {
  const [searchResults, setSearchResults] = useState(null)
  const resultsRef = useRef(null)
  const location   = useLocation()

  // Reveal on scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Handle scroll-to after navigating from another page
  useEffect(() => {
    const scrollTo = location.state?.scrollTo
    if (!scrollTo) return
    // Wait for sections to render then scroll
    const timer = setTimeout(() => {
      const el = document.querySelector(scrollTo)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => clearTimeout(timer)
  }, [location.state])

  const handleSearch = (results) => {
    setSearchResults(results)
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  return (
    <>
      <Navbar />
      <HeroSection />
      <SearchForm onSearch={handleSearch} />
      {searchResults && (
        <div ref={resultsRef}>
          <SearchResults results={searchResults} onClose={() => setSearchResults(null)} />
        </div>
      )}
      <CategoryTiles />
      <FeaturedListings />
      <WhyEthioDelala />
      <VerifiedShowcase />
      <BrowseByCity />
      <HowItWorks />
      <Testimonials />
      <StatsBar />
      <CtaBanner />
      <BlogSection />
      <Footer />
    </>
  )
}
