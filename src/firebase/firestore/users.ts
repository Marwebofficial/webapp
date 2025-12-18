
import { firebaseConfig } from "@/firebase/config";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, deleteDoc } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export const updateUserRole = (id: string, role: string) => {
    const docRef = doc(firestore, "users", id);
    return updateDoc(docRef, { role });
};

export const deleteUser = (id: string) => {
    const docRef = doc(firestore, "users", id);
    return deleteDoc(docRef);
};

export const clearUserWallet = (id: string) => {
    const docRef = doc(firestore, "users", id);
    return updateDoc(docRef, { walletBalance: 0 });
};
