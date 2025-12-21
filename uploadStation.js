// A ONE TIME script run from terminal for uploading the stations from JSON to Firebase

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import stationData from './stations.json' assert { type: 'json' };  // This is our manually created JSON file

const firebaseConfig = {
    // ...
};

const app = initializeApp(firebaseConfig);  // Connects the code to Firebase project using the configurations above
const db = getFirestore(app);  // Gets the Firestore DATABASE (the service we need to record data) 

// Personal method I create with the name uploadStation - it's NOT an inbuilt thing for Firebase
async function uploadStations() {  // async allows to use await which is needed for asynchronous operations - things that take time, like network requests

    for (const station of stationsData.stations)  // We do .stations bc that's how our collection in JSON is named
    {
        // So for each instance of data in the "stations" in JSON
        try {
            // Create an ID from the station name - most likely will be unique so it will do
            const stationID = station.name.toLowerCase().replace(/\s+/g, '-');  // remove all repeating whitespaces and replace them with -
            // E.g. Zurich HB will turn into an ID "zurih-hb"

            /*
                doc (
                    db - which database to use (our variable from above)
                    'stations' - name of the COLLECTION which holds documents
                    stationID - ID of the DOCUMENT
                    , {document record like fields and values}
                )
            */
            await setDoc(doc(db, 'stations', stationID), {  // await tells the code to firstly WAIT for this part to complete,
                name: station.name,
                coordinates: {latitude: station.coordinates.latitude, longtitude: station.cooridnates.longtitude},
                country: station.country
            });

            console.log("SUCCESS --------");  // and only then print that everyhing is successful AFTER we're completed the part above
        } catch (e)
        {
            console.log("FAILED ============, ", error);
        }
    }
}

uploadStations();  // Calling this method so it executes when we run the script in the terminal