
import { firebaseConfig } from "@/firebase/config";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export const updateFundingRequest = (id: string, data: { status: string }) => {
    const docRef = doc(firestore, "funding", id);
    return updateDoc(docRef, data);
};
