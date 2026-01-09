/**
 * Admin Script
 * Uploads stations from stations.json into "stations" Firestore.
 *
 * To run this script you need your own service account key json file from: Project settings > Service accounts > Generate new private key.
 * Remember to add it to .gitignore (in gitignore: service-account-key.json).
 * To run in console: node scripts/upload-stations.js
 */

import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Read stations.json
const stationsPath = path.resolve("./scripts/stations.json");
const stationsData = JSON.parse(fs.readFileSync(stationsPath, "utf-8"));

// Read service account key
const serviceAccountPath = path.resolve("./scripts/service-account-key.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Initialize Firebase Admin with service account to ignore Firestore rules
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

async function uploadStations() {
  // async allows to use await which is needed for asynchronous operations - things that take time, like network requests
  for (const station of stationsData.stations) {
    // We do .stations bc that's how our collection in JSON is named
    // So for each instance of data in the "stations" in JSON
    try {
      // Create an ID from the station name - most likely will be unique so it will do
      const stationID = station.name.toLowerCase().replace(/\s+/g, "-"); // remove all repeating whitespaces and replace them with -
      // E.g. Zurich HB will turn into an ID "zurih-hb"

      /*
                doc (
                    db - which database to use (our variable from above)
                    'stations' - name of the COLLECTION which holds documents
                    stationID - ID of the DOCUMENT
                    , {document record like fields and values}
                )
            */
      // Admin SDK syntax version of Client SDK syntax: await setDoc(doc(db, 'stations', stationID), {});
      await db.collection("stations").doc(stationID).set({
        // await tells the code to firstly WAIT for this part to complete,
        // Remember when exporting outside Firestore stationID is implicitly known by Firestore
        name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
        country: station.country,
      });

      console.log(`Imported: ${station.name}`);
    } catch (error) {
      console.log(`FAILED ============, `, error);
    }
  }
}

uploadStations().catch(console.error);
