const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Nếu dùng Firestore:
  databaseURL: "https://your-project-id.firebaseio.com" 
});

const db = admin.firestore(); // Dùng Firestore cho Card/Task
const auth = admin.auth();    // Dùng cho Authentication

module.exports = { db, auth };