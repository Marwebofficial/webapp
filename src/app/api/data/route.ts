
import { NextResponse } from 'next/server';
import axios from 'axios'; // Import axios

// In a real-world application, these should be stored in environment variables
const GONGOZ_API_KEY = 'cf1711071e40e0a69671c5b8d05cd8f328278933';
const GONGOZ_API_URL = process.env.GONGOZ_API_URL || 'https://www.gongozconcept.com/api/data/';

export async function POST(request: Request) {
  try {
    const { network_id, mobile_number, plan_id } = await request.json();

    if (!network_id || !mobile_number || !plan_id) {
      return NextResponse.json({ error: 'Missing required fields: network_id, mobile_number, and plan_id are required.' }, { status: 400 });
    }

    // Prepare the data payload for the external API
    var data = JSON.stringify({
      "network": network_id, // Map internal network_id to external network
      "mobile_number": mobile_number,
      "plan": plan_id,         // Map internal plan_id to external plan
      "Ported_number": true
    });

    var config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: GONGOZ_API_URL,
      headers: { 
        'Authorization': `Token ${GONGOZ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data : data
    };

    const response = await axios(config);

    // Forward the success response from the provider to our client
    return NextResponse.json(response.data, { status: response.status });

  } catch (error: any) {
    console.error('Error in /api/data:', error);
    let errorMessage = 'An internal server error occurred.';
    let statusCode = 500;

    // Check if the error is from axios and has a response
    if (axios.isAxiosError(error) && error.response) {
        // Log the detailed error from the external API
        console.error('External API Error:', error.response.data);
        errorMessage = error.response.data?.error || error.message;
        statusCode = error.response.status || 500;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
