import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import authGoBackButton from "../assets/authGoBackButton.svg";
import google from "../assets/google.svg"
import github from "../assets/github.svg"
import opened_eye from "../assets/opened_eye.svg"
import closed_eye from "../assets/closed_eye.svg"

import { 
  doCreateUserWithEmailAndPassword,
  doSignInWithGoogle,
  doSignInWithGithub
} from "../firebase/auth";

export default function SignUp() {
  const navigate = useNavigate();

  const signUpEmail = useRef(null);
  const signUpPass = useRef(null);
  const signUpUsername = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Shared success handler (same philosophy as LogIn)
  const handleSuccess = () => {
    navigate("/");
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

      await doCreateUserWithEmailAndPassword(email, password);
      handleSuccess();
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please, try another one.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters long.");
      } else {
        setError("Failed to create account: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // GOOGLE SIGN UP
  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError("");

      await doSignInWithGoogle();
      handleSuccess();
    } catch (err) {
      setError("Failed to sign up with Google: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // GITHUB SIGN UP
  const handleGithubSignUp = async () => {
    try {
      setIsLoading(true);
      setError("");

      await doSignInWithGithub();
      handleSuccess();
    } catch (err) {
      if (err.code === "auth/account-exists-with-different-credential") {
        setError(
          "An account already exists with the same email. Try logging in instead."
        );
      } else if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed. Please try again.");
      } else {
        setError("Failed to sign up with GitHub: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle the password"s eye button to show/hide it
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="signUpElements">
      <div className="title">Register for your first ride</div>

      <div className="logInRedirectionText">
        Had a ride before?
        <Link
          to="/auth/log-in"
          className="logInRedirectionTextButton"
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
        <div className="signUpInputs">
          <div className="entryArea">
            <input
              id="signup-username"
              type="text"
              placeholder=" "
              ref={signUpUsername}
              disabled={isLoading}
              autoComplete="username"
              required
            />
            <label htmlFor="signup-username" className="labelLine">Username</label >
          </div>

          <div className="entryArea">
            <input
              id="signup-email"
              type="email"
              placeholder=" "
              ref={signUpEmail}
              disabled={isLoading}
              autoComplete="email"
              required
            />
            <label htmlFor="signup-email" className="labelLine">Email</label >
          </div>

          <div className="entryArea">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder=" "
              ref={signUpPass}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
            <label htmlFor="signup-password" className="labelLine">Password</label >
            <div className="showHidePassIcon">
                <img src={showPassword ? opened_eye : closed_eye} alt={showPassword ? "Opened eye icon" : "Closed eye icon"}
                    onClick={() => setShowPassword(!showPassword)} 
                    role="button" 
                    />
            </div>
          </div>
        </div>

        <label className="termsHolder">
          <input type="checkbox" aria-required="true" required />
          <span className="checkMark" aria-hidden="true"></span>
          <div>I agree to Terms & Conditions</div>
        </label>

        {error && <div className="errorMessage" role="alert">{error}</div>}

        <button
          type="submit"
          className="createAccount"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? "Creating an account..." : "Create an account"}
        </button>
      </form>

      <div className="signUpVia">
        <div className="line" aria-hidden="true"></div>
        <div className="text">or sign up via</div>
        <div className="line right" aria-hidden="true"></div>
      </div>

      <div className="signUpOptions">
        <button
          type="button"
          className="googleSignUp"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
        >
          <img src={google} alt="Google icon" aria-hidden="true" />Google
        </button>

        <button
          type="button"
          className="githubSignUp"
          onClick={handleGithubSignUp}
          disabled={isLoading}
        >
          <img src={github} alt="Github icon" aria-hidden="true" />GitHub
        </button>
      </div>

      <Link to="/auth" className="goBack">
        <img
          src={authGoBackButton}
          alt="Go back to main authentication page"
          role="button"
        />
      </Link>
    </div>
  );
}
