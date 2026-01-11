import { Link, useNavigate } from 'react-router-dom';
import authGoBackButton from '../assets/authGoBackButton.svg';
import google from '../assets/google.svg'
import github from '../assets/github.svg'
import opened_eye from '../assets/opened_eye.svg'
import closed_eye from '../assets/closed_eye.svg'

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
        setError('Please fill in all fields.');
        return;
        }

        try {
        setIsLoading(true);
        setError('');

        await doSignInWithEmailAndPassword(email, password);
        handleSuccess();
        } catch (err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
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
    
    // Toggle the password's eye button to show/hide it
    const [showPassword, setShowPassword] = useState(false);

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
                id="login-form"
            >
                <div className="logInInputs">
                <div className="entryArea">
                    <input
                    id="login-email"
                    type="email"
                    placeholder=" "
                    ref={logInEmail}
                    disabled={isLoading}
                    autoComplete="email"
                    required
                    />
                    <label htmlFor="login-email" className="labelLine">Email</label>
                </div>

                <div className="entryArea">
                    <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder=" "
                    ref={logInPass}
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                    />
                    <label htmlFor="login-password" className="labelLine">Password</label>
                    <div className='showHidePassIcon'>
                        <img src={showPassword ? opened_eye : closed_eye} alt={showPassword ? "Opened eye icon" : "Closed eye icon"}
                            onClick={() => setShowPassword(!showPassword)} 
                            role="button" />
                    </div>
                </div>
                </div>

                {error && <div className="errorMessage">{error}</div>}

                <button
                type="submit"
                className="logIntoAccount"
                disabled={isLoading}
                aria-busy={isLoading}
                >
                {isLoading ? 'Logging in...' : 'Log in'}
                </button>
            </form>

            <div className="logInVia">
                <div className="line" aria-hidden="true" />
                <div className="text">or log in via</div>
                <div className="line right" aria-hidden="true" />
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
                    <img src={google} alt="Google icon" aria-hidden="true" />Google
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
                    <img src={github} alt="Github icon" aria-hidden="true" />GitHub
                </button>
            </div>

            <Link to="/auth/sign-up" className="goBack">
                <img src={authGoBackButton} alt="Go back to sign up" 
                    role="button" />
            </Link>
        </div>
    );
}
