
import { firebaseConfig } from "@/firebase/config";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const blogCollection = collection(firestore, "blogPosts");

export const getBlogPosts = () => {
    return getDocs(blogCollection);
};

export const addBlogPost = (data: any) => {
    return addDoc(blogCollection, {
        ...data,
        createdAt: serverTimestamp(),
    });
};

export const updateBlogPost = (id: string, data: any) => {
    const docRef = doc(firestore, "blogPosts", id);
    return updateDoc(docRef, data);
};

export const deleteBlogPost = (id: string) => {
    const docRef = doc(firestore, "blogPosts", id);
    return deleteDoc(docRef);
};
