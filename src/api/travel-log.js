import { db } from "./firebase";
import {
	collection,
	addDoc,
	getDocs,
	doc,
	serverTimestamp,
} from "firebase/firestore";

const ensureUsedId = (userId) => {
	if (!userId) throw new Error("User must be authenticated");
};

const getLogRef = (userId) => collection(db, "users", userId, "travel-log");

export const createTravelEntry = async (
	userId,
	originId,
	destinationId,
	startTime,
	endTime,
) => {
	ensureUsedId(userId);
	const logsRef = getLogRef(userId);
	const entryRef = await addDoc(logsRef, {
		originId,
		destinationId,
		startTime,
		endTime,
	});
	return entryRef.id;
};
