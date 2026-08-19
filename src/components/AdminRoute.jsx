import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser, hasAdminRole } from '../service/currentUser'

const AdminRoute = ({ children }) => {
  const location = useLocation()
  const user = getCurrentUser()

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (!hasAdminRole(user)) return <Navigate to="/home" replace />

  return children
}

export default AdminRoute
