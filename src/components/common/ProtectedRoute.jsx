import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import LoadingSpinner from './LoadingSpinner';

/**
 * Gate a route behind authentication. Optionally also require admin role.
 *
 * @param {{ children: React.ReactNode, adminOnly?: boolean }} props
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner size="lg" center />;
  if (!user) return <Navigate to={ROUTES.login} replace />;
  if (adminOnly && profile?.role !== 'admin') return <Navigate to={ROUTES.home} replace />;
  return children;
}
