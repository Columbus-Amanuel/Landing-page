import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import { isStaffRole, isSuperAdminRole } from '@/lib/roles';
import LoadingSpinner from './LoadingSpinner';

/**
 * Gate a route behind authentication. Optionally require staff admin or super-admin.
 *
 * @param {{ children: React.ReactNode, adminOnly?: boolean, superAdminOnly?: boolean }} props
 */
export default function ProtectedRoute({ children, adminOnly = false, superAdminOnly = false }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner size="lg" center />;
  if (!user) return <Navigate to={ROUTES.login} replace />;
  if (superAdminOnly && !isSuperAdminRole(profile?.role)) {
    return <Navigate to={ROUTES.admin} replace />;
  }
  if (adminOnly && !isStaffRole(profile?.role)) return <Navigate to={ROUTES.home} replace />;
  return children;
}
