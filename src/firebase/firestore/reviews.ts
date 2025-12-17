
import { firebaseConfig } from "@/firebase/config";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export const deleteReview = (id: string) => {
    const docRef = doc(firestore, "reviews", id);
    return deleteDoc(docRef);
};
