
const admin = require('firebase-admin');

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'dataconnect-f35af',
  });
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    admin.app();
  } else {
    console.error('Firebase Admin initialization error:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

const getTopThreeDataPlans = async () => {
  try {
    console.log('Fetching the first 3 data plans from the database...');
    const dataPlansRef = db.collection('dataPlans');
    const snapshot = await dataPlansRef.limit(3).get();

    if (snapshot.empty) {
      console.log('No data plans found.');
      return;
    }

    console.log('Found the following data plans:');
    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });

  } catch (error) {
    console.error('An error occurred while fetching data plans:', error);
  } finally {
    // The script will exit automatically after the async operation is complete.
  }
};

getTopThreeDataPlans();
