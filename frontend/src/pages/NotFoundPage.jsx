import NavLink from '../components/NavLink'

function NotFoundPage({ currentPath }) {
  return (
    <div className="text-page">
      <h1 className="page-title">Page not found</h1>
      <p>
        This page does not exist. Go back to the{' '}
        <NavLink to="/" currentPath={currentPath}>
          homepage
        </NavLink>
        .
      </p>
    </div>
  )
}

export default NotFoundPage
