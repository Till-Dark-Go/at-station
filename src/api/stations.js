// All read-only station-related Firestore logic like fetch/filter/sort stations
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"; // firestore methods
import { db } from "../firebase"; // connection to firestore

/**
 * Fetch all stations from Firestore.
 * Returns an array of objects: { id, name, latitude, longitude, country }
 */
export async function getStations() {
  try {
    const snapshot = await getDocs(collection(db, "stations")); // fetch all documents from "stations" collection
    return snapshot.docs.map(doc => ({ id: doc.id,...doc.data()})); // extract data from each document and convert to objects, return an array of objects
  } catch (e) {
    console.error("Error fetching stations:", e);
    return []; // return an empty array
  }
}

/**
 * Fetch stations by country
 */
export async function getStationsByCountry(country) {
  try {
    const q = query(collection(db, "stations"), where("country", "==", country));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id,...doc.data()}));
  } catch (e) {
    console.error("Error fetching stations by country:", e);
    return [];
  }
}

/**
 * Fetch stations ordered by name
 */
export async function getStationsSorted() {
  const q = query(collection(db, "stations"), orderBy("name"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}
export async function getStationsSorted() {
  try {
    const q = query(collection(db, "stations"), orderBy("name"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id,...doc.data()}));
  } catch (e) {
    console.error("Error fetching sorted stations:", e);
    return [];
  }
}