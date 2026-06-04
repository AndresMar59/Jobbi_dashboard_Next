"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { FiltersProvider } from "@/lib/contexts/filters-context"

// Estos componentes deberías crearlos en tu carpeta de componentes
import { KpiCard } from "@/components/Retention/kpi-card"
import { UsageChart } from "@/components/Retention/Usage-Chart"
import { CostAnalysisChart } from "@/components/Retention/cost-analysis-chart"
import { EventsTable } from "@/components/Retention/Events-table"
import { Coins, Users, TrendingUp, CreditCard } from "lucide-react"

export default function CreditsAndPayrollPage() {
  return (
    <FiltersProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar fijo a la izquierda */}
        <Sidebar />

        <div className="flex-1 flex flex-col lg:ml-64">


          <main className="flex-1 p-6 lg:p-8 space-y-8">
            {/* Sección de Filtros (Año, Mes, Excluir nómina) */}
            <header className="flex flex-col space-y-4">
              <DashboardFilters />
            </header>

            <hr className="border-border" />

            {/* 1. Fila de KPIs Principales */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KpiCard 
                title="Créditos Otorgados" 
                value="125,000" 
                icon={<Coins className="h-4 w-4 text-muted-foreground" />} 
              />
              <KpiCard 
                title="Empresas Activas" 
                value="48" 

                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <KpiCard 
                title="DCPA" 
                value="$2.45" 
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              />
              <KpiCard 
                title="Costo Proveedor" 
                value="$1,200" 
                icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}

              />
            </section>

            {/* 2. Sección de Gráficos Visuales */}
            <section className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-xl border bg-card shadow-sm">
                <h3 className="font-semibold mb-4">Uso de Créditos vs. Otorgados</h3>
                <UsageChart />
              </div>
              <div className="p-6 rounded-xl border bg-card shadow-sm">
                <h3 className="font-semibold mb-4">Análisis de Eficiencia (DCPA)</h3>
                <CostAnalysisChart />
              </div>
            </section>

            {/* 3. Tabla Detallada de Eventos */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Desglose de Eventos y Consumo</h2>
              </div>
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <EventsTable />
              </div>
            </section>
          </main>
        </div>
      </div>
    </FiltersProvider>
  )
}