import { storage } from "./firebase";
import { ref, getDownloadURL } from "firebase/storage";

export const setStationImage = (stationId, img) => {
	const storageRef = ref(storage, "station-pics/" + stationId + ".jpg"); // change jpg to * later
	// console.log(storageRef.fullPath);
	getDownloadURL(storageRef)
		.then((url) => {
			img.current.setAttribute("src", url);
		})
		.catch((error) => {
			throw new Error(error);
		});
};
