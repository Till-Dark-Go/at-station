import { storage } from "./firebase";
import { ref, getDownloadURL } from "firebase/storage";

export const getStationImageUrl = (stationId) => {
	const storageRef = ref(storage, "station-pics/" + stationId + ".jpg");
	return getDownloadURL(storageRef);
};
