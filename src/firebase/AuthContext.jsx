// Purpose: listen and updates state
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../api/firebase';

// React Context API
const AuthContext = createContext(null);

// hook, any component can read auth state (global application state) by eg.: const { currentUser, userLoggedIn } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}

// AuthProvider wraps the entire app in main.jsx so state variables become global
export function AuthProvider({ children }) {
  // State variables:
  // - currentUser = user object with its id, email, etc.
  const [currentUser, setCurrentUser] = useState(null); // useState hook
  // - userLoggedIn = is user logged in?, derived state so you don't need to check everywhere: if (currentUser !== null)
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  // - loading = in process of checking if user is logged in, true means wait, false means it is safe to render routes
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged listener automatically updates the user state when authentication status changes on login, logout, page refresh
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setUserLoggedIn(true);
      } else {
        setCurrentUser(null);
        setUserLoggedIn(false);
      }
      setLoading(false);
    });

    // cleanup listener on unmount
    return unsubscribe;
  }, []); // [] means run once when AuthProvider mounts 

  const value = {
    currentUser,
    userLoggedIn,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
