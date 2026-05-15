const admin = require('firebase-admin');

let firebaseApp = null;

const initializeFirebase = () => {
  if (!firebaseApp) {
    try {
      // For production, use service account JSON
      if (process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
        });
      } else {
        // For development, use default credentials
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
      }
      firebaseApp = admin;
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
    }
  }
  return firebaseApp;
};

const getFirebaseApp = () => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};

module.exports = { initializeFirebase, getFirebaseApp };