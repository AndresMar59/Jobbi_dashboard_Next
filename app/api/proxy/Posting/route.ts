import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const searchId = searchParams.get('search_id');

  if (!endpoint || !searchId) {
    return NextResponse.json({ data: null, error: "Missing parameters" }, { status: 400 });
  }

  try {
    
    // Si la API de Jobbi espera el ID como parámetro (basado en tus capturas de red previas):
    let jobbiUrl = `https://data.jobbi.me/${endpoint}${searchId}`;

    const res = await fetch(jobbiUrl, {
      headers: {
        'x-api-key': process.env.jobbi_micro || '',
        'Accept': 'application/json'
      },
      cache: 'no-store' // Para evitar datos cacheados viejos
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error desde API Jobbi:", errorText);
      return NextResponse.json({ error: "Jobbi API error", url: jobbiUrl }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}