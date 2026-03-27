import { db, storage } from "./firebase";
import {
	getDoc,
	doc,
	updateDoc,
	setDoc,
	collection,
	limit,
	startAfter,
	query,
	getDocs,
	orderBy,
	where,
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

const ensureUsedId = (userId) => {
	if (!userId) throw new Error("User must be authenticated");
};

const getStampDoc = (userId, stationId) =>
	doc(db, "users", userId, "stamps", stationId);

const getStampsCollection = (userId) =>
	collection(db, "users", userId, "stamps");

const getStationImageUrl = (stationId) => {
	const storageRef = ref(storage, `station-pics/${stationId}.jpg`);
	return getDownloadURL(storageRef).catch(() => null);
};

const getStationMeta = (stationId) =>
	getDoc(doc(db, "stations", stationId)).then((snap) =>
		snap.exists() ? snap.data() : {},
	);

export const updateStamp = async (userId, stationId, timestamp) => {
	ensureUsedId(userId);
	const stampRef = getStampDoc(userId, stationId);
	if ((await getDoc(stampRef)).exists()) {
		await updateDoc(stampRef, { "last-visited": timestamp });
	} else {
		await setDoc(stampRef, {
			"first-visited": timestamp,
			"last-visited": timestamp,
		});
	}
};

export const getStampsPage = async (userId, pageSize, lastDoc = null) => {
	ensureUsedId(userId);
	const stampsRef = getStampsCollection(userId);

	let q = query(stampsRef, orderBy("last-visited", "desc"), limit(pageSize));
	if (lastDoc) q = query(q, startAfter(lastDoc));

	const snapshot = await getDocs(q);

	const stamps = await Promise.all(
		snapshot.docs.map(async (d) => {
			const data = d.data();
			const [imageUrl, meta] = await Promise.all([
				getStationImageUrl(d.id),
				getStationMeta(d.id),
			]);
			return {
				id: d.id,
				name: meta.name ?? d.id,
				country: meta.country ?? "",
				latitude: meta.latitude ?? null,
				longitude: meta.longitude ?? null,
				imageUrl,
				"first-visited":
					data["first-visited"]?.toDate().toLocaleDateString() ??
					null,
				"last-visited":
					data["last-visited"]?.toDate().toLocaleDateString() ?? null,
			};
		}),
	);

	return {
		stamps,
		lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
	};
};

export const getStationTravelLog = async (userId, stationId) => {
	ensureUsedId(userId);
	const travelLogRef = collection(db, "users", userId, "travel-log");

	const [asDestination, asOrigin] = await Promise.all([
		getDocs(query(travelLogRef, where("destinationId", "==", stationId))),
		getDocs(query(travelLogRef, where("originId", "==", stationId))),
	]);

	const rawEntries = [
		...asDestination.docs.map((d) => d.data()),
		...asOrigin.docs.map((d) => d.data()),
	];

	const entries = await Promise.all(
		rawEntries.map(async (entry) => {
			const [destinationMeta, originMeta] = await Promise.all([
				getStationMeta(entry.destinationId),
				getStationMeta(entry.originId),
			]);
			return {
				destination: destinationMeta.name ?? entry.destinationId,
				origin: originMeta.name ?? entry.originId,
				startTime: entry.startTime?.toDate() ?? null,
				endTime: entry.endTime?.toDate() ?? null,
			};
		}),
	);

	// Sort by most recent first
	entries.sort((a, b) => (b.startTime ?? 0) - (a.startTime ?? 0));

	return entries;
};
