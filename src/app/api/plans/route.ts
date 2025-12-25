
import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { initializeFirebase } from "@/firebase/initialize";

const { firestore } = initializeFirebase();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network');

    if (!network) {
        return NextResponse.json({ error: 'Network is required' }, { status: 400 });
    }

    try {
        const plansCollection = collection(firestore, 'dataPlans');
        const plansQuery = query(plansCollection, where('provider', '==', network));
        const plansSnapshot = await getDocs(plansQuery);
        const plans = plansSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                amount: data.amount,
                provider: data.provider,
                data_id: data.data_id
            };
        });
        return NextResponse.json(plans);
    } catch (error) {
        console.error("Error fetching plans:", error);
        return NextResponse.json({ error: 'Error fetching plans' }, { status: 500 });
    }
}
