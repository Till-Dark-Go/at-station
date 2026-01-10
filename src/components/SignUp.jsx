import { Link } from 'react-router-dom'
import authGoBackButton from '../assets/authGoBackButton.svg';

import { useEffect, useRef, useState } from 'react';
import { 
  doCreateUserWithEmailAndPassword,
  doSignInWithGoogle,
  doSignInWithGithub   // This also works as SIGN UP with Google or other services for the FIRST TIME
} from '../firebase/auth';

export default function SignUp() {

    const signUpEmail = useRef(null);
    const signUpPass = useRef(null);
    const signUpUsername = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // SIGN UP
    const handleSignUp = async () => {
        const email = signUpEmail.current.value;
        const password = signUpPass.current.value;

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            setSuccess('');
            
            await doCreateUserWithEmailAndPassword(email, password);
            setSuccess('Account created successfully! Redirecting...');
            
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else {
                setError('Failed to create account: ' + err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    // GOOGLE SIGN UP

    const handleGoogleSignUp = async () => {
        try {
            setIsLoading(true);
            setError('');
            setSuccess('');

            await doSignInWithGoogle();
            setSuccess('Google sign-in successful!');
        } catch (err) {
            setError("Failed to sign in with Google: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // GITHUB SIGN UP

    const handleGithubSignUp = async () => {
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
        <div className="signUpElements">
            <div className="title">Register for your first ride</div>
            <div>
                <div className="logInRedirectionText">Had a ride before?
                    <Link to = '/auth/log-in'>
                        <div className="logInRedirectionTextButton"> Log in</div>
                    </Link>
                </div>
                <div className='signUpInputs'>
                    <div className='entryArea'>
                        <input type="text" placeholder=' ' ref={signUpUsername} disabled={isLoading} required/>
                        <div className='labelLine'>Username</div>
                    </div>
                    <div className='entryArea'>
                        <input type="email" placeholder=' ' ref={signUpEmail} disabled={isLoading} required/>
                        <div className='labelLine'>Email</div>
                    </div>
                    <div className='entryArea'>
                        <input type="password" placeholder=' ' ref={signUpPass} disabled={isLoading} required/>
                        <div className='labelLine'>Password</div>
                    </div>
                </div>
                <label className='termsHolder'>
                    <input type="checkbox" required/>
                    <span className='checkMark'></span>
                    <div>I agree to Terms & Conditions</div>
                </label>
            </div>
            {/* This MAY NOT be a BUTTON in the future when I add useNavigation */}
            <button className='createAccount'
                onClick={handleSignUp}
                disabled={isLoading}>
                {isLoading ? 'Creating an account...' : 'Create an account'}
            </button> 
            <div className='signUpVia'>
                <div className='line'></div>
                <div className='text'>or sign up via</div>
                <div className='line right'></div>
            </div>
            <div className='signUpOptions'>
                <button className='googleSignUp'
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}>
                    Google
                </button>
                <button className='githubSignUp'
                    onClick={handleGithubSignUp}
                    disabled={isLoading}>
                    GitHub
                </button>
            </div>
            <Link to = '/auth' className='goBack'><img src={authGoBackButton} alt = 'Go back to main authentication page' /></Link>
        </div>
    )
}