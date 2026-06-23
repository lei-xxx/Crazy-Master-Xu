import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import HomeNav from './components/HomeNav'
import Footer from './components/Footer'
import StartupLoader from './components/StartupLoader'
import PortfolioPage from './pages/PortfolioPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ContactPage from './pages/ContactPage'
import { isInsideShellFrame, publicAsset, syncShellRoute } from './lib/utils'
import './index.css'


function installShellRouteSync() {
  if (!isInsideShellFrame()) return

  const getPath = () => `${window.location.pathname}${window.location.search}${window.location.hash}`
  const sync = () => syncShellRoute(getPath())
  const originalPushState = window.history.pushState.bind(window.history)
  const originalReplaceState = window.history.replaceState.bind(window.history)

  window.history.pushState = (...args) => {
    originalPushState(...args)
    sync()
  }

  window.history.replaceState = (...args) => {
    originalReplaceState(...args)
    sync()
  }

  window.addEventListener('popstate', sync)
  sync()
}

installShellRouteSync()

function HomeRedirect() {
  useEffect(() => {
    window.location.assign(import.meta.env.BASE_URL)
  }, [])

  return null
}

function PortfolioEntry() {
  const location = useLocation()
  const projectSlug = new URLSearchParams(location.search).get('project')

  return projectSlug ? <ProjectDetailPage initialSlug={projectSlug} /> : <PortfolioPage />
}

function LegacyPages() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <HomeNav
        logo={publicAsset('/xulei-wordmark-logo.png')}
        logoAlt="Xu Lei Logo"
      />
      <main>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/portfolio" element={<PortfolioEntry />} />
          <Route path="/portfolio/:slug" element={<ProjectDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/portfolio" replace />} />
        </Routes>
      </main>
      <Footer />
      <StartupLoader />
      <Toaster position="top-right" />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <LegacyPages />
    </Router>
  </React.StrictMode>,
)
