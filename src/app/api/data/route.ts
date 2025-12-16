
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { network_id, plan_id, mobile_number } = await request.json();

    if (!network_id || !plan_id || !mobile_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Token cf1711071e40e0a69671c5b8d05cd8f328278933");
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "network": network_id,
      "mobile_number": mobile_number,
      "plan": plan_id,
      "Ported_number": true
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    const response = await fetch("https://www.gongozconcept.com/api/data/", requestOptions as RequestInit);
    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('error', error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
