export interface BehavioralMetricsResult {
  sesionesTotales: number;
  sesionesPromedioDiario: number;
  totalInviteUserCompany: number;
  totalCandidateMatchViewed: number;
  Jobs: number;
  totalCandidateSelected: number;
  totalRevealedContacts: number;
  totalCandidateSelect: number;
  Jobs_outreach_applications: number;
  RatioMatchSelect: number;
  chartData: { fecha: string; sesiones: number }[];
  timelineData: { fecha: string; postulaciones: number }[];
  statusDistribution: { status: string; cantidad: number }[];
  eventDistribution?: { name: string; value: number }[];
}

export function processBehavioralData(
  rawEvents: any[],
  extraJobbi: any, 
  dateFrom: string, 
  dateTo: string
): BehavioralMetricsResult {
  
  const defaultResult: BehavioralMetricsResult = {
    sesionesTotales: -1,
    sesionesPromedioDiario: -1,
    totalInviteUserCompany: -1,
    totalCandidateMatchViewed: -1,
    totalCandidateSelected: -1,
    Jobs : -1,
    Jobs_outreach_applications: -1,
    totalRevealedContacts: -1,
    totalCandidateSelect: -1,
    RatioMatchSelect: -1,
    chartData: [],
    statusDistribution: [],
    timelineData: [],
    eventDistribution: []
  };

  // Validación temprana y segura
  if (!rawEvents || (rawEvents.length === 0 && (!extraJobbi || extraJobbi.length === 0))) {
    return defaultResult;
  }

  let sesionesTotales = 0;
  let totalInviteUserCompany = 0;
  let totalCandidateMatchViewed = 0;
  let totalCandidateSelected = 0;
  let totalRevealedContacts = 0;
  let totalCandidateSelect = 0;
  let RatioMatchSelect = 0;
  let Jobs_outreach_applications = 0;

  


  const JobbiData = extraJobbi;
  const sesionesPorDia: Record<string, number> = {};
  const ultimoEventoPorUsuario: Record<string, number> = {};
  const VENTANA_SESION_MS = 30 * 60 * 1000; // 30 minutos

  // Instanciamos mapas locales limpios que mueren en cada ciclo de la función
  const conteoEstados: Record<string, number> = {};
  const eventFrequencies: Record<string, number> = {};

  // 1. Mapeo y ordenamiento cronológico seguro libre de mutaciones
  const eventosOrdenados = [...rawEvents].sort((a, b) => {
    const timeA = a.properties?.time || a.time || 0;
    const timeB = b.properties?.time || b.time || 0;
    return timeA - timeB;
  });

  const eventosVistos = new Set();
  
  // 2. Procesamiento del ciclo extractor principal
  eventosOrdenados.forEach((eventItem) => {
    const insertId = eventItem.properties?.$insert_id;
    if (insertId && eventosVistos.has(insertId)) {
      return; 
    }

    eventosVistos.add(insertId);

    const eventName = eventItem.event;
    if (!eventName) return;

    const userId = eventItem.$distinct_id || eventItem.properties?.$distinct_id || eventItem.distinct_id || eventItem.properties?.distinct_id;
    const rawTime = eventItem.properties?.time || eventItem.time || 0;
    const timestampMs = rawTime * 1000;

    if (!userId) return;

    // Conteo limpio de frecuencias aisladas por renderizado
    eventFrequencies[eventName] = (eventFrequencies[eventName] || 0) + 1;

    // --- CÁLCULO DE SESIONES ---
    const ultimoTimestamp = ultimoEventoPorUsuario[userId];
    let esNuevaSesion = false;

    if (!ultimoTimestamp || (timestampMs - ultimoTimestamp) > VENTANA_SESION_MS) {
      sesionesTotales++;
      esNuevaSesion = true;
    }
    ultimoEventoPorUsuario[userId] = timestampMs;

    if (esNuevaSesion && rawTime > 0) {
      const fechaClave = new Date(timestampMs).toISOString().split('T')[0];
      sesionesPorDia[fechaClave] = (sesionesPorDia[fechaClave] || 0) + 1;
    }

    // --- CONTEO DE EVENTOS ESPECÍFICOS ---
    if (eventName === "invite_user_company") {
      totalInviteUserCompany++;
    } else if (eventName === "candidate_match_viewed") {
      totalCandidateMatchViewed++;
    } else if (eventName === "candidate_selected") {
      totalCandidateSelected++;
    } else if (eventName === "candidate_reveal_clicked") {
      totalRevealedContacts++;
    } else if (eventName === "candidate_selected_from_matching_tab" || eventName === "candidate_row_selected") {
      totalCandidateSelect++;
    } else if (eventName === "candidate_stage_changed") {
      const status = eventItem.properties?.application_status || "Sin Estado";
      const statusFormateado = status.charAt(0).toUpperCase() + status.slice(1);
      conteoEstados[statusFormateado] = (conteoEstados[statusFormateado] || 0) + 1;
    }
  });

  // Cálculos de Ratios y Métricas cruzadas
  if (totalCandidateSelect > 0) {
    RatioMatchSelect = totalCandidateSelected / totalCandidateSelect;
  }

  // 3. CÁLCULO DE PROMEDIO DIARIO SEGURO
  let sesionesPromedioDiario = 0;
  if (sesionesTotales > 0 && dateFrom && dateTo) {
    const diasTranscurridos = Math.ceil(
      Math.abs(new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    sesionesPromedioDiario = parseFloat((sesionesTotales / diasTranscurridos).toFixed(1));
  }

  // Distribución de Estados (Ordenado)
  const statusDistribution = Object.entries(conteoEstados)
    .map(([status, cantidad]) => ({ status, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // 4. GENERACIÓN DE CHART DATA EVITANDO MUTAR OBJETOS ORIGEN
  const chartData: { fecha: string; sesiones: number }[] = [];
  const currentCursor = new Date(dateFrom + "T00:00:00");
  const limitDate = new Date(dateTo + "T00:00:00");

  while (currentCursor <= limitDate) {
    const ISOStr = currentCursor.toISOString().split('T')[0];
    const diaNum = currentCursor.getDate().toString(); 

    chartData.push({
      fecha: diaNum,
      sesiones: sesionesPorDia[ISOStr] || 0
    });
    
    // Avanzamos de forma segura creando una nueva instancia interna del iterador
    currentCursor.setDate(currentCursor.getDate() + 1);
  }

  // --- INTEGRACIÓN MICROSERVICIO JOBBI DATA ---
  let Jobs = (JobbiData as any)?.summary?.total_postings ?? -1;
  let Applications = (
  ((JobbiData as any)?.channel_distribution?.other || 0) + 
  ((JobbiData as any)?.channel_distribution?.Website || 0)
) || 0; 

  if (totalCandidateSelect > 0) {
    Jobs_outreach_applications = Applications / totalCandidateSelect;
  }

  const timelineData = (JobbiData?.applications_timeline || []).map((item: any) => ({
    fecha: item.date.split('-')[2],
    postulaciones: item.applications
  }));

  // Distribución final limpia y recortada al Top 5 para las acciones
  const eventDistribution = Object.entries(eventFrequencies)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: value
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    sesionesTotales,
    sesionesPromedioDiario,
    totalInviteUserCompany,
    totalCandidateMatchViewed,
    totalCandidateSelected,
    totalRevealedContacts,
    totalCandidateSelect,
    RatioMatchSelect,
    chartData,
    statusDistribution,
    Jobs,
    Jobs_outreach_applications,
    timelineData,
    eventDistribution
  };
}