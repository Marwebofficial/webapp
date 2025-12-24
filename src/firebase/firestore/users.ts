
import { firebaseConfig } from "@/firebase/config";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, deleteDoc, serverTimestamp, runTransaction, increment, deleteField } from "firebase/firestore";

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

export const createFundingRequest = (userId: string, amount: number, bankName: string) => {
    const docRef = doc(firestore, "users", userId);
    return updateDoc(docRef, {
        fundingRequest: {
            amount,
            bankName,
            status: 'pending',
            createdAt: serverTimestamp(),
        }
    });
};

export const approveFundingRequest = async (userId: string) => {
    const userDocRef = doc(firestore, "users", userId);

    try {
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists() || !userDoc.data().fundingRequest) {
                throw new Error("User or funding request not found!");
            }

            const fundingRequest = userDoc.data().fundingRequest;
            const charge = 50;
            const amountToReceive = fundingRequest.amount - charge;

            transaction.update(userDocRef, {
                walletBalance: increment(amountToReceive),
                fundingRequest: deleteField()
            });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
    }
};

export const denyFundingRequest = (userId: string) => {
    const docRef = doc(firestore, "users", userId);
    return updateDoc(docRef, { fundingRequest: deleteField() });
};
