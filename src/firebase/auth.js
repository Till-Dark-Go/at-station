// Purpose: talks to Firebase and triggers state change
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signOut, updateProfile, updateEmail, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider  } from 'firebase/auth';
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


// Update profile display name
export async function doUpdateProfileUsername(newUsername) {
  if (!auth.currentUser) throw new Error("Not signed in");

  await updateProfile(auth.currentUser, { displayName: newUsername });
  
  return true;
}

// Update email (requires reauthentication)
export async function doUpdateEmail(newEmail) {
  if (!auth.currentUser) throw new Error("Not signed in");

 await updateEmail(auth.currentUser, newEmail);
 //await verifyBeforeUpdateEmail(auth.currentUser, newEmail);

  return true;
}

// Update password (requires reauthentication)
export async function doUpdatePassword(newPassword) {
  if (!auth.currentUser) throw new Error("Not signed in");

  await updatePassword(auth.currentUser, newPassword);
 
  return true;
}

// Delete account
export async function doDeleteAuthAccount() {
  if (!auth.currentUser) throw new Error("Not signed in");

  await deleteUser(auth.currentUser);

  return true;
}

// Reauthenticate the user (needed before updating email or password)
// only password sign-up, no google or github
export async function doReauthenticate(currentPassword) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("Not signed in");

  // Not catching erors here, they propagate to function that will call this one, and it will need to handle it
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  return true;
}