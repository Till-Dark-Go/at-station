import { Link, useNavigate } from 'react-router-dom';
import authGoBackButton from '../../assets/images/authGoBackButton.svg';
import google from '../../assets/images/google.svg'
import github from '../../assets/images/github.svg'
import opened_eye from '../../assets/images/opened_eye.svg'
import closed_eye from '../../assets/images/closed_eye.svg'
import '../../assets/styles/signup_and_login.css'

import { useRef, useState } from 'react';

import { doSignInWithEmailAndPassword, doSignInWithGoogle, doSignInWithGithub } from '../../firebase/auth';

import { ensureUserDocument } from "../../firebase/oAuth.js";

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
            if (err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/user-not-found') {
                setError('User does not exist. You need to signup first.');
            } else if (err.code === 'auth/account-exists-with-different-credential') {
                setError('An account already exists with this email using a different login method. Try logging in with the original provider.');
            } else {
                setError('Failed to log in: ' + err.message);
            }
        } finally {
                setIsLoading(false);
        }
    };

    const handleOAuthLogin = async (providerFn) => {
        try {
            setIsLoading(true);
            setError('');

            const result = await providerFn();
            const user = result.user || auth.currentUser;

            await ensureUserDocument(user);

            handleSuccess();
        } catch (err) {
            if (err.code === 'auth/account-exists-with-different-credential') {
                setError('An account already exists with this email using a different login method. Try logging in with the original provider.');
            } else if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in popup was closed. Please try again.');
            } else {
                setError('Failed to log in: ' + err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };


    
    // Toggle the password's eye button to show/hide it
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="main-block">
            <div className="title">Log in to an existing account</div>

            <div className="redirection-text">
                Don&apos;t have an account?
                <Link
                to="/home/sign-up"
                className="redirection-text-button"
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
                <div className="inputs-holder">
                    <div className="entry-area">
                        <input
                        id="login-email"
                        type="email"
                        placeholder=" "
                        ref={logInEmail}
                        disabled={isLoading}
                        autoComplete="email"
                        required
                        />
                        <label htmlFor="login-email" className="label-line">Email</label>
                    </div>

                    <div className="entry-area">
                        <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder=" "
                        ref={logInPass}
                        disabled={isLoading}
                        autoComplete="current-password"
                        required
                        />
                        <label htmlFor="login-password" className="label-line">Password</label>
                        <div className='show-hide-pass-icon'>
                            <img src={showPassword ? opened_eye : closed_eye} alt={showPassword ? "Opened eye icon" : "Closed eye icon"}
                                onClick={() => setShowPassword(!showPassword)} 
                                role="button" />
                        </div>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                type="submit"
                className="action-button proceed-to-account"
                disabled={isLoading}
                aria-busy={isLoading}
                >
                {isLoading ? 'Logging in...' : 'Log in'}
                </button>
            </form>

            <div className="enter-via">
                <div className="line" aria-hidden="true" />
                <div className="text">or log in via</div>
                <div className="line right" aria-hidden="true" />
            </div>

            <div className="account-options">
                <button
                type="button"
                className="action-button google"
                onClick={() => handleOAuthLogin(doSignInWithGoogle)}
                disabled={isLoading}
                >
                    <img src={google} alt="Google icon" aria-hidden="true" />Google
                </button>

                <button
                type="button"
                className="action-button github"
                onClick={() => handleOAuthLogin(doSignInWithGithub)}
                disabled={isLoading}
                >
                    <img src={github} alt="Github icon" aria-hidden="true" />GitHub
                </button>
            </div>

            <Link to="/home/sign-up" className="go-back">
                <img src={authGoBackButton} alt="Go back to sign up" 
                    role="button" />
            </Link>
        </div>
    );
}