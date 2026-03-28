import { Link, useNavigate } from "react-router-dom";
import { useRef, useState} from "react";
import '../../assets/styles/signup_and_login.css'

import authGoBackButton from "../../assets/images/authGoBackButton.svg";
import google from "../../assets/images/google.svg"
import github from "../../assets/images/github.svg"
import opened_eye from "../../assets/images/opened_eye.svg"
import closed_eye from "../../assets/images/closed_eye.svg"

// Imports for creating Firestore user document in users collection
import { auth } from "../../api/firebase";      
import { updateProfile, signOut, fetchSignInMethodsForEmail } from "firebase/auth";
//import { updateProfile, signOut } from "firebase/auth";      

import { doCreateUserWithEmailAndPassword, doSignInWithGoogle, doSignInWithGithub } from "../../firebase/auth";
import { ensureUserDocument } from "../../firebase/oAuth.js";



export default function SignUp() {
  const navigate = useNavigate();

  const signUpEmail = useRef(null);
  const signUpPass = useRef(null);
  const signUpUsername = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const providerMap = {
  Google: "google.com",
  GitHub: "github.com",
  };

  // EMAIL / PASSWORD SIGN UP
  const handleSignUp = async () => {
    const email = signUpEmail.current.value;
    const password = signUpPass.current.value;

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const forbiddenChars = /[ /\\|*]/;  // Regex expression

      if (forbiddenChars.test(password)) {  // Regex built-in function to test if forbidden chars are in the password
        throw new Error("Password contains forbidden characters (space, /, \\, |, *)");
      }

      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0 && !methods.includes("password")) {
        throw new Error("This email is already registered with Google or GitHub.");
      }

      const result = await doCreateUserWithEmailAndPassword(email, password);
      // Get auth user and username what will allow to write to users/{uid} document after signup
      const user = result.user || auth.currentUser;
      const username = signUpUsername.current.value;
      // Sets displayName inside Firebase Auth what will allow to write to users/{uid} document after signup
      await updateProfile(user, { displayName: username });

      // Ensure Firestore user exists
      await ensureUserDocument(user);

      await signOut(auth); 
      navigate("/home/log-in", { state: { redirectTo: "/home/log-in" } });


    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please, try another one.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters long.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // oAuth (Google or Github signup)
  const handleOAuthSignUp = async (providerFn, providerName) => {
    try {
      setIsLoading(true);
      setError('');

      // Trigger the OAuth popup for Google/GitHub
      const result = await providerFn();
      // Get auth user what will allow to write to users/{uid} document after signup
      const user = result.user || auth.currentUser;

      // Retrieve the email and all sign-in methods associated with it
      const email = user.email;
      const methods = await fetchSignInMethodsForEmail(auth, email);
      const currentProvider = providerMap[providerName]; // "google.com" or "github.com"

      if (methods.length > 0 && !methods.includes(currentProvider)) {
        // This email exists with a different sign-in method (github sigup doesn't override password/email and other way around)
        // However, doesn't work for google:
        // Certain email domains have a trusted provider. Example: Google is the trusted provider for @gmail.com.
        // If the user first registers a Gmail via another provider (e.g., email/password or github),
        // a later Google sign-in will overrule the first registration.
        await signOut(auth); // log out the partially signed-in session
        throw new Error("This email is already registered with a different sign-in method.");
      }

      // Ensure Firestore user document exists
      await ensureUserDocument(user);

      // On sucessfull OAuth (Google/Github) signup stay logged in and go to map
      navigate('/'); 

    } catch (err) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError(`An account already exists with this email using a different login method. Try logging in with the original provider.`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else {
        setError('Failed to sign up with ' + providerName + ': ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle the password"s eye button to show/hide it
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="main-block">
      <div className="title">Register for your first ride</div>

      <div className="redirection-text">
        Had a ride before?
        <Link
          to="/home/log-in"
          className="redirection-text-button"
        >
          Log in
        </Link>
      </div>

      {}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSignUp();
        }}
        id="signup-form"
      >
        <div className="inputs-holder">
            <div className="entry-area">
              <input
                id="signup-username"
                type="text"
                placeholder=" "
                ref={signUpUsername}
                disabled={isLoading}
                autoComplete="username"
                required
              />
              <label htmlFor="signup-username" className="label-line">Username</label >
            </div>

            <div className="entry-area">
              <input
                id="signup-email"
                type="email"
                placeholder=" "
                ref={signUpEmail}
                disabled={isLoading}
                autoComplete="email"
                required
              />
              <label htmlFor="signup-email" className="label-line">Email</label >
          </div>

          <div className="entry-area">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder=" "
              ref={signUpPass}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
            <label htmlFor="signup-password" className="label-line">Password</label >
            <div className="show-hide-pass-icon">
                <img src={showPassword ? opened_eye : closed_eye} alt={showPassword ? "Opened eye icon" : "Closed eye icon"}
                    onClick={() => setShowPassword(!showPassword)} 
                    role="button" 
                    />
            </div>
          </div>
        </div>

        <label className="terms-holder">
          <input type="checkbox" aria-required="true" required />
          <span className="check-mark" aria-hidden="true"></span>
          <div>I agree to Terms & Conditions</div>
        </label>

        {error && <div className="error-message" role="alert">{error}</div>}

        <button
          type="submit"
          className="action-button proceed-to-account"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? "Creating an account..." : "Create an account"}
        </button>
      </form>

      <div className="enter-via">
        <div className="line" aria-hidden="true"></div>
        <div className="text">or sign up via</div>
        <div className="line right" aria-hidden="true"></div>
      </div>

      <div className="account-options">
        <button
          type="button"
          className="action-button google"
          onClick={() => handleOAuthSignUp(doSignInWithGoogle, 'Google')}
          disabled={isLoading}
        >
          <img src={google} alt="Google icon" aria-hidden="true" />Google
        </button>

        <button
          type="button"
          className="action-button github"
          onClick={() => handleOAuthSignUp(doSignInWithGithub, 'GitHub')}
          disabled={isLoading}
        >
          <img src={github} alt="Github icon" aria-hidden="true" />GitHub
        </button>
      </div>

      <Link to="/home" className="go-back">
        <img
          src={authGoBackButton}
          alt="Go back to main authentication page"
          role="button"
        />
      </Link>
    </div>
  );
}