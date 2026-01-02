import { useRef, useState } from 'react';
import { 
  doCreateUserWithEmailAndPassword, 
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doSignInWithGithub  // Add this import
} from '../firebase/auth';

export default function AuthPage() {
  const signUpEmail = useRef(null);
  const signUpPass = useRef(null);
  
  const logInEmail = useRef(null);
  const logInPass = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // SIGN UP FUNCTION
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

  // LOG IN FUNCTION
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

  // GOOGLE SIGN IN
  const handleGoogleSignIn = async () => {
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

  // GITHUB SIGN IN
  const handleGithubSignIn = async () => {
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

  return (
    <div className='authPage'>
      {success && <div className='success-message'>{success}</div>}
      {error && <div className='error-message'>{error}</div>}
      
      {/* SIGN UP SECTION */}
      <div className='signUp'>
        <h2>Sign Up</h2>
        <input 
          type='email' 
          ref={signUpEmail} 
          placeholder="Email"
          disabled={isLoading}
        />  
        <input 
          type='password' 
          ref={signUpPass} 
          placeholder="Password (min 6 characters)"
          disabled={isLoading}
        />
        <button 
          onClick={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </div>

      {/* LOG IN SECTION */}
      <div className='logIn'>
        <h2>Log In</h2>
        <input 
          type='email' 
          ref={logInEmail} 
          placeholder="Email"
          disabled={isLoading}
        />
        <input 
          type='password' 
          ref={logInPass} 
          placeholder="Password"
          disabled={isLoading}
        />
        <button 
          onClick={handleLogIn}
          disabled={isLoading}
        >
          {isLoading ? 'Logging In...' : 'Log In'}
        </button>
      </div>

      {/* SOCIAL LOGINS */}
      <div className='otherServices'>
        <button 
          className='googleButton'
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Log In with Google'}
        </button>
        
        {/* GitHub Button */}
        <button 
          className='githubButton'
          onClick={handleGithubSignIn}
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Log In with GitHub'}
        </button>
      </div>
    </div>
  );
}