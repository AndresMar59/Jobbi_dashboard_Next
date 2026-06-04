"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filter-context-enterprise"
import { processBehavioralData } from "@/lib/utils/analytics-processor"


import { RevealCandidateCard } from "@/components/Enterprise/RevealCandidate-kpi"
import { SesionesPromedioCard } from "@/components/Enterprise/Sesiones_avg-kpi"
import { StatusDistributionChart } from "@/components/Enterprise/StatusDistributionChart"
import { MatchViewedCard } from "@/components/Enterprise/Ratio-outreach"
import { ActivityChart } from "./ActivityCahrt"
import { JobsCard } from "./Jobs.kpi"
import { JobsOutreachApplications } from "@/components/Enterprise/Jobs_outreach_applications"
import { ApplicationsTimelineChart } from "@/components/Enterprise/ApplicationTimeline"
import { OutreachCard } from "@/components/Enterprise/Outreach"
import { EventDistributionChart } from "@/components/Enterprise/EventDistributionChart"


const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error al conectar con el proxy de Mixpanel');
  return res.json();
})

export function MetricsGrid() {
  const { filters } = useFilters()


  const { dateFromUrl, dateToUrl, isFutureError } = useMemo(() => {
    const hoy = new Date()
    const formatear = (d: Date) => d.toISOString().split('T')[0]

    // MODO A: Filtro de Rango Personalizado Dinámico
    if (filters.customRange?.active && filters.customRange?.fromDate) {
      let fromDate = new Date(filters.customRange.fromDate)
      let isFuture = false

      // 1. CONTROL DE DAÑOS SI ES EN EL FUTURO:
      if (fromDate > hoy) {
        fromDate = hoy // Reajustamos al día de hoy para que la app no explote
        isFuture = true
      }

      let toDate = new Date(fromDate)
      toDate.setDate(toDate.getDate() + 30) // Suma automática de 30 días
      
      if (toDate > hoy) toDate = hoy // Si el fin se va al futuro, topa a hoy
      
      return { 
        dateFromUrl: formatear(fromDate), 
        dateToUrl: formatear(toDate),
        isFutureError: isFuture 
      }
    }

    // MODO B: Filtro Estático Tradicional por Mes Cerrado
    const mesesMap: Record<string, number> = {
      Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4, Jun: 5, Jul: 6, Ago: 7, Sep: 8, Oct: 9, Nov: 10, Dic: 11
    }
    
    const numeroMes = mesesMap[filters.month] ?? hoy.getMonth()
    const anioNum = parseInt(filters.year) || hoy.getFullYear()
    let isFuture = false
    if (anioNum > hoy.getFullYear() || (anioNum === hoy.getFullYear() && numeroMes > hoy.getMonth())) {
      isFuture = true
    }

const firstDay = isFuture ? hoy : new Date(anioNum, numeroMes, 1)
let lastDay = isFuture ? hoy : new Date(anioNum, numeroMes + 1, 0)

if (!isFuture && lastDay > hoy) {
  lastDay = hoy
}

return { 
  dateFromUrl: formatear(firstDay), 
  dateToUrl: formatear(lastDay), 
  isFutureError: isFuture 
}
  },
  [filters.year, filters.month, filters.customRange])




  const { data: response, isLoading, error } = useSWR(
    filters.searchId 
      ? `/api/proxy/Mixpanel?date_from=${dateFromUrl}&date_to=${dateToUrl}&search_id=${filters.searchId}`
      : null,
    fetcher,
    {
    revalidateOnFocus: false,      
    revalidateOnReconnect: false,  
    refreshInterval: 0,            
    dedupingInterval: 10000       
  }
  )


  const metrics = useMemo(() => {

  const eventosRaw = response?.mixpanelData || [];
  const extraJobbi = response?.jobbiData || []; 
  
  // Si necesitas inyectarle la data de Jobbi a tu procesador analítico, se la pasas aquí:
  return processBehavioralData(eventosRaw, extraJobbi, dateFromUrl, dateToUrl)
}, [response?.mixpanelData, response?.jobbiData, dateFromUrl, dateToUrl])
  


return (
    <div className="w-full flex flex-col gap-6"> {/* Elemento padre único */}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        
        <RevealCandidateCard 
          value={metrics.totalRevealedContacts}
          isLoading={isLoading} 
          error={error} 
          isFuture={isFutureError}
        />

        <SesionesPromedioCard 
          value={metrics.sesionesPromedioDiario} 
          isLoading={isLoading} 
          error={error} 
          isFuture={isFutureError}
        /> 

        <MatchViewedCard 
          value={metrics.RatioMatchSelect} 
          isLoading={isLoading} 
          error={error} 
          isFuture={isFutureError}
        />

        <JobsCard 
          value={metrics.Jobs}
          isLoading={isLoading} 
          error={error} 
          isFuture={isFutureError}
        />

        <JobsOutreachApplications 
          value={metrics.Jobs_outreach_applications}
          isLoading={isLoading} 
          error={error} 
          isFuture={isFutureError}
        />

        <OutreachCard 
          value={metrics.totalCandidateSelected}
          isLoading={isLoading} 
          error={error} 
          isFuture={isFutureError}
        />

      </div> 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <ActivityChart 
        data={isFutureError ? [] : metrics.chartData} 
        isLoading={isLoading} 
        error={error} 
        isFuture={isFutureError} 
      />

      <StatusDistributionChart 
        data={metrics.statusDistribution} 
        isLoading={isLoading} 
        error={error} 
        isFuture={isFutureError} 
      />

      <ApplicationsTimelineChart 
        data={metrics.timelineData} 
        isLoading={isLoading} 
        error={error} 
        isFuture={isFutureError} 
      />

      <EventDistributionChart 
        data={metrics.eventDistribution || []} 
        isLoading={isLoading} 
        error={error} 
        isFuture={isFutureError} 
      />

     </div>

    </div> 
  )
}