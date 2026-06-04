"use client"

import { DashboardFilters } from "@/components/Talent/dasboard-filter"
import { PostingKPICard } from "@/components/Talent/Posting_kpi"
import { AplicacionesKPI } from "@/components/Talent/AplicacionesKPICard"
import { MatchKPI } from "@/components/Talent/MatchRateKPICard"
import { ConvertionKPI } from "@/components/Talent/ConversionRateKPICard"
import { HireKPI } from "@/components/Talent/HireKPI"
import { FiltersProvider } from "@/lib/contexts/filter-context-posting"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ContextBanner } from "@/components/Talent/Baner_Context"
import { TimelineChart } from "@/components/Talent/Timeline"
import { Fuentechart } from "@/components/Talent/Fuente"

export default function PublicationPage() {
  return (
    <FiltersProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col lg:ml-64">
          <main className="flex-1 p-6 lg:p-8 flex flex-col gap-8">
            
            {/* 1. Filtros superiores: Asegúrate de que este componente 
                o el 'TalentSearchHeader' de adentro consuma el 'useFilters()' del contexto 
                para actualizar el ID globalmente al presionar Enter/Consultar */}
            <DashboardFilters />

            {/* 3. Fila de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <PostingKPICard /> 
              <AplicacionesKPI/>
              <MatchKPI/>
              <ConvertionKPI/>
              <HireKPI />
            </div>

            <ContextBanner/>

            {/* 4. Fila de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <TimelineChart/>
              <Fuentechart/>
            </div>
          </main>
        </div>
      </div>
    </FiltersProvider>
  )
}