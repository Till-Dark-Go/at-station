import { Link } from 'react-router-dom'
import authGoBackButton from '../assets/authGoBackButton.svg';

import { useEffect, useRef, useState } from 'react';
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doSignInWithGithub 
} from '../firebase/auth';

export default function LogIn() {

    const logInEmail = useRef(null);
    const logInPass = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // LOG IN 
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
            setSuccess('');
            
            await doSignInWithEmailAndPassword(email, password);
            setSuccess('Login successful! Welcome back!');
            
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
    
    // GOOGLE LOG IN
    const handleGoogleLogIn = async () => {
        try {
            setIsLoading(true);
            setError('');
            setSuccess('');
            
            await doSignInWithGoogle();
            setSuccess('Google sign-in successful!');
            
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
            setSuccess('');
            
            await doSignInWithGithub();
            setSuccess('GitHub sign-in successful!');
            
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

    useEffect(() => {
        console.log('SUCCESS: ' + success)
    }, [success]);

    useEffect(() => {
        console.log('ERROR: ' + error);
    }, [error]);

    return (
        <div className="logInElements">
            <div className="title">Log in to an existing account</div>
            <div>
                <div className="signUpRedirectionText">Don't have an account?
                    <Link to = '/auth/sign-up'>
                        <div className="signUpRedirectionTextButton">Sign up</div>
                    </Link>
                </div>
                <div className="logInInputs">
                    <div className="entryArea">
                        <input type="email" placeholder=' ' ref={logInEmail} disabled={isLoading} required/>
                        <div className='labelLine'>Email</div>
                    </div>
                    <div className='entryArea'>
                        <input type="password" placeholder=' ' ref={logInPass} disabled={isLoading} required/>
                        <div className='labelLine'>Password</div>
                    </div>
                </div>
            </div>
            <button className='logIntoAccount'
                onClick={handleLogIn}
                disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log in'}
            </button>
            <div className='logInVia'>
                <div className='line'></div>
                <div className='text'>or log in via</div>
                <div className='line right'></div>
            </div>
            <div className='logInOptions'>
                <button className='googleLogIn'
                    onClick={handleGoogleLogIn}
                    disabled={isLoading}>
                    Google
                </button>
                <button className='githubLogIn'
                    onClick={handleGithubLogIn}
                    disabled={isLoading}>
                    GitHub
                </button>
            </div>
            <Link to = '/auth/sign-up' className='goBack'><img src={authGoBackButton} alt = 'Go back to sign up' /></Link>
        </div>
    )
}