// Purpose: checks auth state and redirects or blocks routes
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  // useAuth() hook from AuthContex.jsx reading in global states like userLoggedIn, loading 
    const { userLoggedIn, loading } = useAuth();

  // waiting, in process of checking if user is logged in, true means wait, false means it is safe to render routes
  if (loading) {
    // return null;
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  // If logged in show page, otherwise redirect to /auth
  return userLoggedIn ? children : <Navigate to="/auth" />;
}
