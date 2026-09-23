import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getUser, isAuthenticated } from '../auth/session.ts'
import type { Role } from '../types/api.ts'

interface ProtectedRouteProps {
  /** When set, only this role may see the nested routes. */
  role?: Role
}

export default function ProtectedRoute({ role }: ProtectedRouteProps) {
  const location = useLocation()
  const user = getUser()

  if (!isAuthenticated() || user === null) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role !== undefined && user.role !== role) {
    return <Navigate to={user.role === 'student' ? '/profile' : '/students'} replace />
  }

  return <Outlet />
}
