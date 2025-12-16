
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { network, mobile_number, data_id } = await request.json();

    if (!network || !mobile_number || !data_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Token cf1711071e40e0a69671c5b8d05cd8f328278933");
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "network": network,
      "mobile_number": mobile_number,
      "plan": data_id,
      "Ported_number": true
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    const response = await fetch("https://www.gongozconcept.com/api/data/", requestOptions as RequestInit);
    const result = await response.text();

    return NextResponse.json(JSON.parse(result));
  } catch (error) {
    console.error('error', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
