import { useEffect, useState } from 'react'

// On GitHub Pages, the application is hosted below /PhotographyPortfolio/.
// In local development, BASE_URL is simply /.
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

function readCurrentPath() {
  const pathname = window.location.pathname
  const pathWithoutBase =
    basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
      ? pathname.slice(basePath.length)
      : pathname

  return pathWithoutBase.replace(/\/+$/, '') || '/'
}

// Build correct links for both local development and GitHub Pages.
export function siteUrl(path) {
  return `${basePath}${path}`
}

// Change pages without reloading the whole application.
export function navigateTo(path) {
  if (path === readCurrentPath()) {
    return
  }

  window.history.pushState({}, '', siteUrl(path))
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}

export function usePath() {
  const [path, setPath] = useState(readCurrentPath)

  useEffect(() => {
    function updatePath() {
      setPath(readCurrentPath())
    }

    window.addEventListener('popstate', updatePath)
    return () => window.removeEventListener('popstate', updatePath)
  }, [])

  return path
}
