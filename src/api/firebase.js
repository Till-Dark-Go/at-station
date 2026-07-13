// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Exports for frontend use
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics is optional and loaded lazily so that ad/tracker blockers
// (which block "firebase/analytics" as a tracking script) can never crash
// app startup. Any failure here is swallowed intentionally.
export let analytics = null;
if (typeof window !== "undefined") {
	import("firebase/analytics")
		.then(async ({ getAnalytics, isSupported }) => {
			if (await isSupported()) {
				analytics = getAnalytics(app);
			}
		})
		.catch(() => {
			// Blocked by an extension or unsupported environment — ignore.
		});
}
