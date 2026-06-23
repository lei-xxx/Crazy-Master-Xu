
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import SignFlowNav from './components/SignFlowNav'
import Footer from './components/Footer'
import StartupLoader from './components/StartupLoader'
import HomePage from './pages/HomePage'
import PortfolioPage from './pages/PortfolioPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ContactPage from './pages/ContactPage'
import { publicAsset } from './lib/utils'

function AppContent() {
  const location = useLocation()

  // 页面切换时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Contact', href: '/contact' }
  ]

  return (
    <div className="min-h-screen">
      <SignFlowNav
        logo={publicAsset('/xulei-wordmark-logo.png')}
        logoAlt="Xu Lei Logo"
        links={navLinks}
      />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:slug" element={<ProjectDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
      <StartupLoader />
      <Toaster position="top-right" />
    </div>
  )
}

function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

  return (
    <Router basename={basename}>
      <AppContent />
    </Router>
  )
}

export default App
