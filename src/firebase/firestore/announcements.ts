
import { firebaseConfig } from "@/firebase/config";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const announcementsCollection = collection(firestore, "announcements");

export const addAnnouncement = (data: { message: string }) => {
    return addDoc(announcementsCollection, {
        ...data,
        createdAt: serverTimestamp(),
    });
};

export const updateAnnouncement = (id: string, data: { message: string }) => {
    const docRef = doc(firestore, "announcements", id);
    return updateDoc(docRef, data);
};

export const deleteAnnouncement = (id: string) => {
    const docRef = doc(firestore, "announcements", id);
    return deleteDoc(docRef);
};
