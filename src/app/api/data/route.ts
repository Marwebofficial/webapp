
import { NextResponse } from 'next/server';

// In a real-world application, these should be stored in environment variables
const GONGOZ_API_KEY = process.env.GONGOZ_API_KEY || 'your_gongozconcept_api_key_placeholder';
const GONGOZ_API_URL = process.env.GONGOZ_API_URL || 'https://gongozconcept.com/api/data/';

export async function POST(request: Request) {
  try {
    const { network_id, mobile_number, plan_id } = await request.json();

    if (!network_id || !mobile_number || !plan_id) {
      return NextResponse.json({ error: 'Missing required fields: network_id, mobile_number, and plan_id are required.' }, { status: 400 });
    }

    // This is a placeholder for where you would map your internal IDs to what GongozConcept expects, if they are different.
    // For now, we assume they are the same.
    const externalNetworkId = network_id;
    const externalPlanId = plan_id;

    const response = await fetch(GONGOZ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GONGOZ_API_KEY}`,
      },
      body: JSON.stringify({
        network_id: externalNetworkId,
        mobile_number: mobile_number,
        plan_id: externalPlanId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // If the API returns an error, forward it to the client
      return NextResponse.json({ error: result.error || 'Data purchase failed at the provider.' }, { status: response.status });
    }

    // Forward the success response from the provider to our client
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error in /api/data:', error);
    let errorMessage = 'An internal server error occurred.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
