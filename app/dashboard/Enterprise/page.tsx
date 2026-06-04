"use client"

import { useState } from "react"
import { DashboardFilters } from "@/components/Enterprise/dashboard-filter"
import { FiltersProvider } from "@/lib/contexts/filter-context-enterprise"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MetricsGrid } from "@/components/Enterprise/Metrics-grid"



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
             
      <main className="flex-1 p-6 lg:p-8 flex flex-col gap-8">
        {/* 1. Filtros superiores */}
        <DashboardFilters />    
        {/* Este componente ya lleva adentro a <SesionesTotalesCard /> con sus props */}
        <MetricsGrid />
      </main>    

      </div>
      </div>
    </FiltersProvider>
  )
}