import NavLink from './NavLink'

const mainLinks = [
  { to: '/', label: 'Home' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/about', label: 'About Me' },
  { to: '/contact', label: 'Contact' },
]

const socialPlaceholders = ['Instagram', 'Pinterest', 'LinkedIn']

function Sidebar({ currentPath }) {
  return (
    <header className="sidebar">
      <NavLink to="/" currentPath={currentPath}>
        <span className="brand">Angelique Vi.</span>
      </NavLink>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <ul>
          {mainLinks.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} currentPath={currentPath}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-extra">
        <div>
          <p className="small-label">Social media</p>
          <ul>
            {socialPlaceholders.map((name) => (
              <li key={name}>{name} (link coming soon)</li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Sidebar
