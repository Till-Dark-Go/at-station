import { db } from "./firebase";
import { getDoc, doc, updateDoc, setDoc } from "firebase/firestore";

const ensureUsedId = (userId) => {
	if (!userId) throw new Error("User must be authenticated");
};

const getStampDoc = async (userId, stationId) =>
	doc(db, "users/" + userId + "/stamps", stationId);

export const updateStamp = async (userId, stationId, timestamp) => {
	ensureUsedId(userId);
	const stampRef = await getStampDoc(userId, stationId);
	console.log(stampRef);
	if ((await getDoc(stampRef)).exists()) {
		await updateDoc(stampRef, {
			"last-visited": timestamp,
		});
	} else {
		await setDoc(stampRef, {
			"first-visited": timestamp,
			"last-visited": timestamp,
		});
	}
};
