import { Link, useNavigate } from 'react-router-dom';
import authGoBackButton from '../assets/authGoBackButton.svg';
import { useRef, useState } from 'react';

import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doSignInWithGithub,
} from '../firebase/auth';


export default function LogIn() {
  const navigate = useNavigate();

  const logInEmail = useRef(null);
  const logInPass = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Shared helper for successful auth
  const handleSuccess = () => {
        // Firebase auth state changes and AuthContext will update automatically via onAuthStateChanged
        // ProtectedRoute will allow access
        navigate('/'); // Redirect to Map.jsx
    };

    // EMAIL / PASSWORD LOGIN
    const handleLogIn = async () => {
        const email = logInEmail.current.value;
        const password = logInPass.current.value;

        if (!email || !password) {
        setError('Please fill in all fields');
        return;
        }

        try {
        setIsLoading(true);
        setError('');

        await doSignInWithEmailAndPassword(email, password);
        handleSuccess();
        } catch (err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password');
        } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address');
        } else {
                setError('Failed to log in: ' + err.message);
        }
        } finally {
                setIsLoading(false);
        }
    };

    // GOOGLE LOGIN
    const handleGoogleLogIn = async () => {
        try {
            setIsLoading(true);
            setError('');

            await doSignInWithGoogle();
            handleSuccess();
        } catch (err) {
            setError('Failed to sign in with Google: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // GITHUB LOG IN
    const handleGithubLogIn = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            await doSignInWithGithub();
            handleSuccess();
            
        } catch (err) {
            // Handle specific GitHub errors
            if (err.code === 'auth/account-exists-with-different-credential') {
                setError('An account already exists with the same email. Try signing in with a different method.');
            } else if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in popup was closed. Please try again.');
            } else {
                setError('Failed to sign in with GitHub: ' + err.message);
            }
            } finally {
                setIsLoading(false);
            }
    };

    return (
        <div className="logInElements">
        <div className="title">Log in to an existing account</div>

        <div className="signUpRedirectionText">
            Don&apos;t have an account?
            <Link
            to="/auth/sign-up"
            className="signUpRedirectionTextButton"
            >
            Sign up
            </Link>
        </div>

        {}
        <form
            onSubmit={(e) => {
            e.preventDefault();
            handleLogIn();
            }}
        >
            <div className="logInInputs">
            <div className="entryArea">
                <input
                type="email"
                placeholder=" "
                ref={logInEmail}
                disabled={isLoading}
                required
                />
                <div className="labelLine">Email</div>
            </div>

            <div className="entryArea">
                <input
                type="password"
                placeholder=" "
                ref={logInPass}
                disabled={isLoading}
                required
                />
                <div className="labelLine">Password</div>
            </div>
            </div>

            {error && <div className="errorMessage">{error}</div>}

            <button
            type="submit"
            className="logIntoAccount"
            disabled={isLoading}
            >
            {isLoading ? 'Logging in...' : 'Log in'}
            </button>
        </form>

        <div className="logInVia">
            <div className="line" />
            <div className="text">or log in via</div>
            <div className="line right" />
        </div>

        <div className="logInOptions">
            <button
            type="button"
            className="googleLogIn"
            onClick={async () => {
                setIsLoading(true);
                setError('');
                try {
                await doSignInWithGoogle();
                handleSuccess();
                } catch (err) {
                setError(err.message);
                } finally {
                setIsLoading(false);
                }
            }}
            disabled={isLoading}
            >
            Google
            </button>

            <button
            type="button"
            className="githubLogIn"
            onClick={async () => {
                setIsLoading(true);
                setError('');
                try {
                await doSignInWithGithub();
                handleSuccess();
                } catch (err) {
                setError(err.message);
                } finally {
                setIsLoading(false);
                }
            }}
            disabled={isLoading}
            >
            GitHub
            </button>
        </div>

        <Link to="/auth/sign-up" className="goBack">
            <img src={authGoBackButton} alt="Go back to sign up" />
        </Link>
        </div>
    );
}
