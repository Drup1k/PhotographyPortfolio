import { navigateTo } from '../routing/usePath'

// A normal link (so it also works with right-click and "open in new tab"),
// but a plain click changes the page without reloading the website.
function NavLink({ to, currentPath, children }) {
  const isActive = to === currentPath

  function handleClick(event) {
    const isPlainLeftClick =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

    if (isPlainLeftClick) {
      event.preventDefault()
      navigateTo(to)
    }
  }

  return (
    <a href={to} onClick={handleClick} aria-current={isActive ? 'page' : undefined}>
      {children}
    </a>
  )
}

export default NavLink
