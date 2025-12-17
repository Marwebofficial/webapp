
import { firebaseConfig } from "@/firebase/config";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const networkStatusCollection = collection(firestore, "networkStatus");

export const addNetworkStatus = (data: any) => {
    return addDoc(networkStatusCollection, {
        ...data,
        createdAt: serverTimestamp(),
    });
};

export const updateNetworkStatus = (id: string, data: any) => {
    const docRef = doc(firestore, "networkStatus", id);
    return updateDoc(docRef, data);
};

export const deleteNetworkStatus = (id: string) => {
    const docRef = doc(firestore, "networkStatus", id);
    return deleteDoc(docRef);
};
