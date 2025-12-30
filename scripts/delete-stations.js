/**
 * Admin Script
 * Deletes all documents from the "stations" collection in Firestore.
 * 
 * To run this script you need your own service account key JSON file from: 
 * Project settings > Service accounts > Generate new private key.
 * Remember to add it to .gitignore (service-account-key.json).
 * To run in console: node scripts/delete-stations.js
 */

import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Read service account key
const serviceAccountPath = path.resolve("./scripts/service-account-key.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Initialize Firebase Admin with service account (ignores Firestore rules)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function deleteStations() {
  try {
    // Get all documents in "stations" collection
    const snapshot = await db.collection("stations").get();

    if (snapshot.empty) {
      console.log("No stations to delete.");
      return;
    }

    // Use a batch to delete all documents at once
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref); // Delete each document
      console.log(`Queued for deletion: ${doc.id}`);
    });

    // Commit the batch
    await batch.commit();
    console.log("All stations deleted successfully.");
  } catch (error) {
    console.error("Error deleting stations:", error);
  }
}

// Run the deletion function
deleteStations().catch(console.error);
