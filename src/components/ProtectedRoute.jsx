import { Navigate, useLocation } from 'react-router-dom'

/**
 * Prevents unauthenticated users from rendering private pages.
 *
 * Add an access token to localStorage after login, then wrap any page that
 * requires authentication with this component.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const accessToken = localStorage.getItem('accessToken')

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
