require('firebase/firestore');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const email = 'samuelmarvel21@gmail.com';

const makeAdmin = async () => {
  try {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No user found with that email.');
      return;
    }

    querySnapshot.forEach(async (userDoc) => {
      console.log('User found:', userDoc.id);
      const userRef = doc(firestore, 'users', userDoc.id);
      await updateDoc(userRef, { role: 'admin' });
      console.log('User role updated to admin.');
    });
  } catch (error) {
    console.error('Error updating user role:', error);
  }
};

makeAdmin();
