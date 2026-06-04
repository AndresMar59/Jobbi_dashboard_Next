// /api/proxy/Posting/route.ts
import { NextRequest, NextResponse } from 'next/server';

// FORZAMOS A QUE NO HAYA CACHÉ EN EL SERVIDOR
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') ;
  const searchId = searchParams.get('search_id');

  if (!endpoint || !searchId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  
    // 1. Limpiamos el ID de posibles espacios
    const cleanId = searchId.trim();
    
    // 2. Agregamos un timestamp único para romper la caché de Jobbi y de Next.js
    // Usamos '&' porque tu endpoint ya trae el '?'
    let jobbiUrl = `https://data.jobbi.me/${endpoint}${cleanId}`;

    try {
    const res = await fetch(jobbiUrl, {
      headers: {
        'x-api-key': process.env.jobbi_micro || '',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`Error API: ${res.status}`);

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Fallo al conectar con Jobbi' }, { status: 500 });
  } 
}

