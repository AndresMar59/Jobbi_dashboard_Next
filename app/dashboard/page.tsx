"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { MVPFilters } from "@/components/dashboard/mvp-filters"
import { MVPKPICard } from "@/components/dashboard/mvp-kpi-card"
import { MVPMultiLineBarChart } from "@/components/dashboard/mvp-multi-line-bar-chart"
import { MVPSingleBarChart } from "@/components/dashboard/mvp-single-bar-chart"
import { MVPDoubleLineChart } from "@/components/dashboard/mvp-double-line-chart"

export default function DashboardMVP() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Dashboard MVP</h1>

          {/* Filtros superiores */}
          <MVPFilters />

          {/* KPIs principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MVPKPICard title="ARPU (Revenue per clientes)" value="$125.50" />
            <MVPKPICard title="CAC RATIO" value="3.2x" />
            <MVPKPICard title="# Company Activos" value="847" />
            <MVPKPICard title="Margen Ganancia" value="42%" />
          </div>

          {/* KPIs secundarios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MVPKPICard title="Expanciones" value="23" />
            <MVPKPICard title="Downgrade" value="5" />
            <MVPKPICard title="% Sobre company activos" value="15.3%" />
            <MVPKPICard title="% MRR" value="8.7%" />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MVPMultiLineBarChart />
            <MVPSingleBarChart />
            <MVPDoubleLineChart />
          </div>
        </main>
      </div>
    </div>
  )
}
