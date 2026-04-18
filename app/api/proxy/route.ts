import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Limpieza de parámetros: La API externa falla si recibe "Ene" o "Feb"
  const year = searchParams.get('year') || '2026';
  const months = searchParams.get('months') || '12';
  const dateTo = searchParams.get('date_to') || `${year}-12-31`;
  const dateFrom = searchParams.get('date_from') || `${year}-01-01`;
  // Si es null nos devuelve false 
 const payrollParam = searchParams.get('include_payroll');
 const includePayroll = payrollParam === 'true';

  // Construimos la URL limpia para Jobbi
  let apiUrl = `https://data.jobbi.me/data/saas-metrics/history?date_to=${dateTo}&date_from=${dateFrom}`;
  if (includePayroll) {
  apiUrl += `&include_payroll=true`;
  
}  else apiUrl += `&include_payroll=false`

  try {
    const res = await fetch(apiUrl, {
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