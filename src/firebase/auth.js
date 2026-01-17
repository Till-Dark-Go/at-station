// Purpose: talks to Firebase and triggers state change
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../api/firebase';

// Sign up with email/password
export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Log in with email/password
export const doSignInWithEmailAndPassword = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Google sign in
export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
};

// GitHub sign in
export const doSignInWithGithub = async () => {
  const provider = new GithubAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
};

// Sign out
export const doSignOut = () => {
  return signOut(auth);
};