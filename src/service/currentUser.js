import { jwtDecode } from 'jwt-decode'

export const getCurrentUser = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) return null

  try {
    return jwtDecode(token)
  } catch {
    return null
  }
}

export const hasAdminRole = (user) => {
  const roles = [user?.role, user?.user_role, user?.role_name, ...(Array.isArray(user?.roles) ? user.roles : [])]
  return roles.some((role) => String(role).toLowerCase() === 'admin')
}
