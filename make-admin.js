
// This script uses the Firebase Admin SDK to grant admin privileges to a user.
// Usage: node make-admin.js <user-email>

const admin = require('firebase-admin');

// IMPORTANT: The Firebase Admin SDK needs to be initialized with credentials.
// This code assumes you have a service account key file configured
// via the GOOGLE_APPLICATION_CREDENTIALS environment variable.
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'dataconnect-f35af', // Your actual project ID
  });
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    // Ignore "duplicate app" error during hot-reloads
    admin.app();
  } else {
    console.error('Firebase Admin initialization error:', error);
    process.exit(1);
  }
}


const db = admin.firestore();
const auth = admin.auth();

// Get the email from the command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Error: Please provide the user\'s email as a command-line argument.');
  console.log('Usage: node make-admin.js <user-email>');
  process.exit(1);
}

const makeAdmin = async () => {
  try {
    console.log(`Attempting to make '${email}' an admin...`);
    
    // Find the user by email using the Auth service
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;
    
    console.log(`Found user: ${uid}`);

    // Update the user's document in Firestore
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.set({
      role: 'admin'
    }, { merge: true }); // Use merge:true to avoid overwriting other fields

    console.log(`Successfully updated Firestore document for user ${uid}.`);

    // (Optional but recommended) Set a custom claim for the user
    await auth.setCustomUserClaims(uid, { admin: true });
    
    console.log('Successfully set custom claim. User is now an admin.');
    console.log('Please ask the user to log out and log back in for the changes to take effect.');

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`Error: User with email '${email}' not found in Firebase Authentication.`);
    } else {
      console.error('An error occurred:', error);
    }
    process.exit(1);
  }
};

makeAdmin();
