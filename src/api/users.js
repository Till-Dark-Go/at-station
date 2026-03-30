import {
	doc,
	setDoc,
	updateDoc,
	getDoc,
	serverTimestamp,
	increment,
	runTransaction,
} from "firebase/firestore";
import { db, auth } from "./firebase";

// Delete user
export async function deleteUserDocument() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  try {
    const userRef = doc(db, "users", user.uid);
    await deleteDoc(userRef);
  } catch (err) {
    console.error("Failed to delete Firestore user document:", err);
    throw err;
  }
}

// Reset user data including stamps and current station
export async function resetUserData() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  try {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      stampsCount: 0,
      currentStationId: "bern"
    });
    return true;
  } catch (err) {
    console.error("Failed to reset user data:", err);
    throw err;
  }
}

// Get the full user document
export async function getUserDoc() {
	const user = auth.currentUser;
	if (!user) throw new Error("Not signed in");

	try {
		const userRef = doc(db, "users", user.uid);
		const snap = await getDoc(userRef);
		return snap.exists() ? snap.data() : null;
	} catch (err) {
		console.error("Error fetching user document:", err);
		return null;
	}
}

// Get specific field from user doc
export async function getUserField(fieldName) {
	try {
		const userDoc = await getUserDoc();
		return userDoc ? userDoc[fieldName] : null;
	} catch (err) {
		console.error(`Error getting field ${fieldName}:`, err);
		return null;
	}
}

// Update specific field in user doc users/{uid}
export async function updateUserField(fieldName, value) {
	const user = auth.currentUser;
	if (!user) throw new Error("Not signed in");

	try {
		const userRef = doc(db, "users", user.uid);
		await updateDoc(userRef, { [fieldName]: value });
		return true;
	} catch (err) {
		console.error(`Failed to update field ${fieldName}:`, err);
		return false;
	}
}

// Examples for email, displayName, currentStationId, stampsCount
export const getEmail = () => getUserField("email");
export const getDisplayName = () => getUserField("displayName");
export const getCurrentStationId = () => getUserField("currentStationId");
export const getStampsCount = () => getUserField("stampsCount");

export const updateDisplayName = (name) => updateUserField("displayName", name);
export const updateCurrentStation = (stationId) =>
	updateUserField("currentStationId", stationId);
export const updateEmail = (email) => updateUserField("email", email);

// Add (or update) a stamp document users/{uid}/stamps/{stationId}
export async function addStamp(stationId) {
	const user = auth.currentUser;
	if (!user) throw new Error("Not signed in");

	const stampRef = doc(db, "users", user.uid, "stamps", stationId);
	const userRef = doc(db, "users", user.uid);

	try {
		return await runTransaction(db, async (tx) => {
			const stampSnap = await tx.get(stampRef);
			if (stampSnap.exists()) return { created: false };

			// create stamp
			tx.set(stampRef, { earnedAt: serverTimestamp() });

			// increment stampsCount safely
			try {
				tx.update(userRef, { stampsCount: increment(1) });
			} catch {
				tx.set(userRef, { stampsCount: 1 }, { merge: true });
			}

			return { created: true };
		});
	} catch (err) {
		console.error("Failed to add stamp:", err);
		return { created: false, error: err };
	}
}