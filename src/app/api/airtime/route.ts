import { NextResponse } from 'next/server';
import axios from 'axios';

const GONGOZ_API_KEY = 'cf1711071e40e0a69671c5b8d05cd8f328278933';
const GONGOZ_API_URL = 'https://www.gongozconcept.com/api/topup/';

const networkIdMap: { [key: string]: number } = {
  mtn: 1,
  glo: 2,
  '9mobile': 3,
  airtel: 4,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received airtime request with body:', body);

    const { network_id, amount, phone } = body;
    const Ported_number = body.Ported_number !== undefined ? body.Ported_number : true;

    if (!network_id || !amount || !phone) {
      return NextResponse.json({ error: 'Missing required fields: network_id, amount, and phone are required.' }, { status: 400 });
    }

    const numericNetworkId = networkIdMap[network_id.toLowerCase()];

    if (!numericNetworkId) {
      return NextResponse.json({ error: `Invalid network provider: ${network_id}` }, { status: 400 });
    }

    const data = JSON.stringify({
      network: numericNetworkId,
      amount: amount,
      mobile_number: phone,
      Ported_number,
      airtime_type: "VTU"
    });

    console.log('Sending airtime data to external API:', data);

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
    console.error('Error in /api/airtime:', error);
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
