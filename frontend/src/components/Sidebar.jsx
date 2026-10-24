import NavLink from './NavLink'

const mainLinks = [
  { to: '/', label: 'Home' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/about', label: 'About Me' },
  { to: '/contact', label: 'Contact' },
]

// These pages exist, but are still under construction.
const underConstructionLinks = [
  { to: '/services', label: 'Services' },
  { to: '/booking', label: 'Booking' },
  { to: '/privacy', label: 'Privacy' },
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
        <nav aria-label="Pages under construction">
          <p className="small-label">Under construction</p>
          <ul>
            {underConstructionLinks.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} currentPath={currentPath}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

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
