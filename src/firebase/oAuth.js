import { db } from "../api/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const DEFAULT_STATION_ID = "bern";

// We keep separate OAuth SignUp and LogIn functions because app flow differs
// (different navigation after success), even though Firebase treats them the same.
// Auth logic is shared via ensureUserDocument, but UI/navigation stays separate.
export async function ensureUserDocument(user) {
	const userRef = doc(db, "users", user.uid);
	const userSnap = await getDoc(userRef);

	// If it does not exist create Firestore user document for users collection
	if (!userSnap.exists()) {
		// Create Firestore user document for users collection
		// It is Client side document creation, with issue that
		// if client fails after signup (network), user may exist in Auth but not in Firestore
		// Later we can do hybride with Cloud Function to solve it
		await setDoc(userRef, {
			email: user.email,
			displayName: user.displayName ?? null,
			currentStationId: DEFAULT_STATION_ID,
		});
	}
}
