// Purpose: checks auth state and redirects or blocks routes
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RouteGuard({ children, requireAuth }) {
	const location = useLocation();
	// useAuth() hook from AuthContex.jsx reading in global states like userLoggedIn, loading
	const { userLoggedIn, loading } = useAuth();
	if (loading) {
		// waiting, in process of checking if user is logged in, true means wait, false means it is safe to render routes
		return <div style={{ color: "white" }}>Loading...</div>;
	}

	// Read a custom redirect if provided
	//const location = useLocation();
	const redirectTo = location.state?.redirectTo || "/home";

	// Case 1: route requires auth (private)
	// If logged in show page (render map), otherwise redirect to /home
	if (requireAuth) {
		return userLoggedIn ? children : <Navigate to={redirectTo} replace />;
	}

	// Case 2: route must be public (auth pages)
	// If already logged in, navigate to map (/) blocking access to /home page, otherwise redirect to authentication pages
	return userLoggedIn ? <Navigate to="/" /> : children;
}
