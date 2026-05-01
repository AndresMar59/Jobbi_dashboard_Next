"use client"

import { useState } from "react"
import { DashboardFilters } from "@/components/Talent/dasboard-filter"
import { TalentSearchHeader } from "@/components/Talent/TalentSearchHeader"
import { PostingKPICard } from "@/components/Talent/Posting_kpi"
import { AplicacionesKPI } from "@/components/Talent/AplicacionesKPICard"
import { MatchKPI } from "@/components/Talent/MatchRateKPICard"
import { ConvertionKPI } from "@/components/Talent/ConversionRateKPICard"
import { HireKPI } from "@/components/Talent/HireKPI"
import { FiltersProvider } from "@/lib/contexts/filter-context-posting"
import { Navbar } from "@/components/dashboard/navbar"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ContextBanner } from "@/components/Talent/Baner_Context"
import { TimelineChart } from "@/components/Talent/Timeline"
import { Fuentechart } from "@/components/Talent/Fuente"


export default function PublicationPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [searchType, setSearchType] = useState<"company" | "posting">("company")

  // Definimos handleSearch para quitar el error "Cannot find name"
  const handleSearch = (type: string, id: string) => {
    setSearchType(type as any)
    setActiveId(id || null)
  }

  return (
    <FiltersProvider>
        <div className="flex min-h-screen bg-background">
       
          <Sidebar />

        <div className="flex-1 flex flex-col lg:ml-64">
         <Navbar />
             
      <main className="flex-1 p-6 lg:p-8 flex flex-col gap-8">
        {/* 1. Filtros superiores */}
        <DashboardFilters />

        {/* 3. Fila de KPIs (Posición idéntica a SaaS Metrics) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Aquí colocas tus componentes individuales */}
          <PostingKPICard /> 
          <AplicacionesKPI/>
          <MatchKPI/>
          <ConvertionKPI/>
          < HireKPI  />
        </div>
         <ContextBanner/>
        {/* 4. Fila de Gráficos (Abajo de los KPIs) */}
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