import { storage } from "./firebase";
import { ref, getDownloadURL } from "firebase/storage";


export const getStationImage = (stationId) => {
    const storageRef = ref(storage, "station-pics/" + stationId + ".jpg"); // change jpg to * later
    // console.log(storageRef.fullPath);
    getDownloadURL(storageRef).then((url) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
            const blob = xhr.response;
        };
        xhr.open('GET', url);
    })
}