
import { firebaseConfig } from "@/firebase/config";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDocs } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export const addPlan = (collectionName: string, data: any) => {
    const plansCollection = collection(firestore, collectionName);
    return addDoc(plansCollection, {
        ...data,
        createdAt: serverTimestamp(),
    });
};

export const updatePlan = (collectionName: string, id: string, data: any) => {
    const docRef = doc(firestore, collectionName, id);
    return updateDoc(docRef, data);
};

export const deletePlan = (collectionName: string, id: string) => {
    const docRef = doc(firestore, collectionName, id);
    return deleteDoc(docRef);
};

export const getPlans = (collectionName: string) => {
    const plansCollection = collection(firestore, collectionName);
    return getDocs(plansCollection);
};
