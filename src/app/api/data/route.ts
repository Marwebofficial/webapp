
import { NextResponse } from 'next/server';
import axios from 'axios';

const GONGOZ_API_KEY = process.env.GONGOZ_API_KEY;
const GONGOZ_API_URL = process.env.GONGOZ_API_URL || 'https://www.gongozconcept.com/api/data/';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request with body:', body);

    const { network_id, mobile_number, plan_id } = body;
    const Ported_number = body.Ported_number !== undefined ? body.Ported_number : false;

    if (!network_id || !mobile_number || !plan_id) {
      return NextResponse.json({ error: 'Missing required fields: network_id, mobile_number, and plan_id are required.' }, { status: 400 });
    }

    if (!GONGOZ_API_KEY) {
      console.error('GONGOZ_API_KEY is not defined in environment variables.');
      return NextResponse.json({ error: 'Internal server configuration error.' }, { status: 500 });
    }

    const data = JSON.stringify({
      network: network_id,
      mobile_number: mobile_number,
      plan: plan_id,
      Ported_number,
    });

    console.log('Sending numeric data to external API:', data);

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: GONGOZ_API_URL,
      headers: { 
        'Authorization': `Token ${GONGOZ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data
    };

    const response = await axios(config);
    console.log('Received response from external API:', response.data);

    return NextResponse.json(response.data, { status: response.status });

  } catch (error: any) {
    console.error('Error in /api/data:', error);
    let errorMessage = 'An internal server error occurred.';
    let statusCode = 500;

    if (axios.isAxiosError(error) && error.response) {
        console.error('External API Error:', error.response.data);
        errorMessage = error.response.data?.error || error.message;
        statusCode = error.response.status || 500;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
