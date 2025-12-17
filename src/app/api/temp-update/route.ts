
import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-1844236037-692e1",
  "appId": "1:1075181041430:web:1166e3b57968ac80a60237",
  "apiKey": "AIzaSyCrOxbXCx7-rALzO-g2pKnKInlQm0x-dRU",
  "authDomain": "studio-1844236037-692e1.firebaseapp.com",
  "messagingSenderId": "1075181041430"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const firestore = getFirestore();

export async function GET(request: Request) {
  try {
    const planRef = doc(firestore, "dataPlans", "airtel", "plans", "1GB for 420");
    await updateDoc(planRef, {
      id: "426"
    });
    return NextResponse.json({ message: "Plan updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
