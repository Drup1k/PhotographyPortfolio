import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import { usePath } from './routing/usePath'
import { usePhotoLibrary } from './hooks/usePhotoLibrary'
import HomePage from './pages/HomePage'
import PortfolioPage from './pages/PortfolioPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import UnderConstructionPage from './pages/UnderConstructionPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'
import './Gallery.css'

const SITE_NAME = 'Angelique Vi.'

const pageTitles = {
  '/': 'Home',
  '/portfolio': 'Portfolio',
  '/about': 'About Me',
  '/contact': 'Contact',
  '/services': 'Services',
  '/booking': 'Booking',
  '/privacy': 'Privacy',
}

function renderPage(path, library) {
  switch (path) {
    case '/':
      return <HomePage library={library} />
    case '/portfolio':
      return <PortfolioPage library={library} />
    case '/about':
      return <AboutPage />
    case '/contact':
      return <ContactPage />
    case '/services':
    case '/booking':
    case '/privacy':
      return <UnderConstructionPage title={pageTitles[path]} />
    default:
      return <NotFoundPage currentPath={path} />
  }
}

function App() {
  const path = usePath()
  const library = usePhotoLibrary()
  const isHome = path === '/'

  useEffect(() => {
    const pageTitle = pageTitles[path] ?? 'Page not found'
    document.title = `${pageTitle} | ${SITE_NAME}`
  }, [path])

  return (
    <div className="site-layout">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <Sidebar currentPath={path} />

      <main id="main-content" className={isHome ? 'main-home' : 'main-page'}>
        {renderPage(path, library)}
        <Footer />
      </main>
    </div>
  )
}

export default App
