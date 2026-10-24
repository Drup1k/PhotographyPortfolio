import { useEffect, useState } from 'react'

// A very small router, so no extra package is needed.
// It reads the address bar (for example /portfolio) and tells React when it changes.

function readCurrentPath() {
  // Remove a trailing slash, so "/portfolio/" and "/portfolio" are the same page.
  return window.location.pathname.replace(/\/+$/, '') || '/'
}

// Changes the address bar without reloading the page.
export function navigateTo(path) {
  if (path === readCurrentPath()) {
    return
  }

  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}

// Returns the current path and updates when the visitor navigates
// (links, or the browser back and forward buttons).
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
