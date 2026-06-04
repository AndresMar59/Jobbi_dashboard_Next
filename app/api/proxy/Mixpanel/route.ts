import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');
  const searchId = searchParams.get('search_id'); 

  if (!dateFrom || !dateTo || !searchId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const cleanCompanyId = searchId.trim();

  try {
    const mpUser = process.env.MIXPANEL_USER;
    const mpSecret = process.env.MIXPANEL_SECRET;
    const projectId = "3068156"; 

    if (!mpUser || !mpSecret) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 500 });
    }

    const authString = `${mpUser}:${mpSecret}`;
    const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

    // =========================================================================
    // PASO 1: OBTENER TODOS LOS DISTINCT_IDS ASOCIADOS AL COMPANY_ID
    // =========================================================================
    const engageUrl = `https://mixpanel.com/api/query/engage?project_id=${projectId}`;
    const engageFilter = `properties["company_id"] == "${cleanCompanyId}"`;

    // CORRECCIÓN REPARADA: Usar parámetros de URL nativos para asegurar que Mixpanel entienda el where
    const paramsEngage = new URLSearchParams();
    paramsEngage.append('where', engageFilter);

    const resEngage = await fetch(engageUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': authHeader
      },
      body: paramsEngage.toString(),
      cache: 'no-store'
    });

    let distinctIdsArray: string[] = [];
    let Principal_user: string | null = null;


    if (resEngage.ok) {
      const engageData = await resEngage.json();
      


    if (engageData.results && engageData.results.length > 0) {
        // =========================================================================
        // AJUSTE CRONOLÓGICO: Ordenar perfiles desde el más antiguo al más nuevo
        // =========================================================================
        const sortedProfiles = engageData.results.sort((a: any, b: any) => {
          const dateA = a.properties?.$created ? new Date(a.properties.$created).getTime() : Infinity;
          const dateB = b.properties?.$created ? new Date(b.properties.$created).getTime() : Infinity;
          
          return dateA - dateB; // Orden ascendente (menor timestamp/más viejo primero)
        });

        const rawIds = sortedProfiles
          .map((profile: any) => profile.$distinct_id)
          .filter((id: string) => id);

        // Remover duplicados manteniendo el orden de inserción original
        distinctIdsArray = Array.from(new Set(rawIds));
        
        // El índice [0] queda garantizado como el usuario creado hace más tiempo
        Principal_user = distinctIdsArray[0] || null;
        
        console.log(`Mapeados y ordenados cronológicamente con éxito ${distinctIdsArray.length} usuarios para la empresa.`);
      } else {
        console.log("No se encontraron usuarios vinculados a este company_id.");
      }
    } else {
      console.error("Error en Mixpanel Engage (HTTP " + resEngage.status + ")");
      return NextResponse.json({ error: "Error al consultar Mixpanel" }, { status: resEngage.status });
    }

    // =========================================================================
    // FRENO DE SEGURIDAD CRÍTICO: Si no hay usuarios mapeados, evitamos exportar todo el proyecto
    // =========================================================================
    if (distinctIdsArray.length === 0) {
      console.warn(`⚠️ No se encontraron usuarios para la empresa ${cleanCompanyId}. Cancelando consulta masiva.`);
      return NextResponse.json({
        mixpanelData: [],
        jobbiData: null,
        message: "No existen registros de telemetría para esta empresa."
      });
    }

    // =========================================================================
    // PASO 2: CONSTRUIR FILTRO DINÁMICO PARA MÚLTIPLES DISTINCT_IDS
    // =========================================================================
    const eventosTarget = ["sign_in","sign_up","prompt_handle_submit", "job_created","job_shared", "invite_user_company", "candidate_match_viewed", "candidate_selected", "candidate_row_selected", "candidate_selected_from_matching_tab", "candidate_reveal_clicked", "candidate_stage_changed", "posting_metrics_viewed"];
    const eventParam = encodeURIComponent(JSON.stringify(eventosTarget));
    
    // Ahora garantizamos que whereFilter NUNCA sea una cadena vacía
    const whereFilter = Principal_user ? `properties["$distinct_id"] == "${Principal_user}"` : "";
      
    const whereParam = encodeURIComponent(whereFilter);
    const mixpanelUrl = `https://data.mixpanel.com/api/2.0/export?project_id=${projectId}&from_date=${dateFrom}&to_date=${dateTo}&event=${eventParam}&where=${whereParam}`;

    // Microservicio Jobbi mantiene la consulta nativa por company_id
    const jobbiUrl = `https://data.jobbi.me/metrics-postings/summary-company?company_id=${cleanCompanyId}&date_from=${dateFrom}&date_to=${dateTo}`;

    const [resMixpanel, resJobbi] = await Promise.all([
      fetch(mixpanelUrl, {
        method: 'GET',
        headers: { 'accept': 'text/plain', 'authorization': authHeader },
        cache: 'no-store'
      }),
      fetch(jobbiUrl, {
        method: 'GET',
        headers: { 'x-api-key': process.env.jobbi_micro || '', 'Accept': 'application/json' },
        cache: 'no-store'
      })
    ]);

    // =========================================================
    // PROCESAMIENTO FUENTE 1: Mixpanel (NDJSON)
    // =========================================================
    let mixpanelClean: any[] = [];
    if (resMixpanel.ok) {
      const rawTextMp = await resMixpanel.text();
      if (rawTextMp.trim()) {
        mixpanelClean = rawTextMp
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => { try { return JSON.parse(line); } catch { return null; } })
          .filter(item => item !== null);
      }
    } else {
      console.error("Error en Mixpanel Export (HTTP " + resMixpanel.status + ")");
    }

    // =========================================================
    // PROCESAMIENTO FUENTE 2: Jobbi Data (JSON)
    // =========================================================
    let jobbiClean: any = null;
    if (resJobbi.ok) {
      try {
        jobbiClean = await resJobbi.json(); 
      } catch (e) {
        console.error("Jobbi Data respondió OK pero no es un JSON válido");
        jobbiClean = null;
      }
    } else {
      console.error("Error en Jobbi Microservice (HTTP " + resJobbi.status + ")");
    }

    return NextResponse.json({
      mixpanelData: mixpanelClean,
      jobbiData: jobbiClean
    });

  } catch (error: any) {
    console.error("Error en el orquestador proxy:", error);
    return NextResponse.json({ error: 'Error interno de integración' }, { status: 500 });
  }
}