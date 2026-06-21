import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Spinner } from '../components/common/Spinner.jsx';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // While AuthContext's silent refresh attempt is still in flight, we
  // don't yet know if the user is logged in -- rendering a redirect too
  // early would bounce an already-logged-in user back to /login on every
  // page refresh.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}