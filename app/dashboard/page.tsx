"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { KPICard } from "@/components/dashboard/kpi-card"
import { ChartLine } from "@/components/dashboard/chart-line"
import { ChartBar } from "@/components/dashboard/chart-bar"
import { DollarSign, Users, TrendingUp, Ticket } from "lucide-react"
import { useChartMogulMetrics } from "@/lib/hooks/use-chartmogul"
import { useGoogleSheets } from "@/lib/hooks/use-google-sheets"

export default function DashboardPage() {
  const { metrics, isLoading: chartMogulLoading, isError: chartMogulError } = useChartMogulMetrics()
  const { data: expenses, isLoading: sheetsLoading, isError: sheetsError } = useGoogleSheets()

  const totalGastos = expenses.reduce((sum, expense) => sum + expense.costo, 0)
  const gastosPorMes = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1
    const total = expenses.filter((e) => e.mes === mes).reduce((sum, e) => sum + e.costo, 0)
    return { mes, total }
  })

  // Métricas de ChartMogul (si están disponibles)
  const mrr = metrics?.entries?.[metrics.entries.length - 1]?.mrr || 45231
  const customers = metrics?.entries?.[metrics.entries.length - 1]?.customers || 2350
  const ltv = metrics?.entries?.[metrics.entries.length - 1]?.ltv || 3.24

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          {(chartMogulLoading || sheetsLoading) && (
            <div className="mb-4 p-4 bg-muted rounded-lg text-muted-foreground">Cargando datos...</div>
          )}

          {(chartMogulError || sheetsError) && (
            <div className="mb-4 p-4 bg-destructive/10 rounded-lg text-destructive">
              Error al cargar datos. Mostrando datos de ejemplo.
            </div>
          )}

          {/* Sección de KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Gastos Totales"
              value={`$${totalGastos.toLocaleString()}`}
              change="+20.1%"
              trend="up"
              icon={DollarSign}
            />
            <KPICard
              title="Clientes Activos"
              value={customers.toLocaleString()}
              change="+15.3%"
              trend="up"
              icon={Users}
            />
            <KPICard title="MRR" value={`$${mrr.toLocaleString()}`} change="+2.5%" trend="up" icon={TrendingUp} />
            <KPICard title="Tickets Abiertos" value="12" change="-8.2%" trend="down" icon={Ticket} />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartLine data={gastosPorMes} />
            <ChartBar data={expenses} />
          </div>
        </main>
      </div>
    </div>
  )
}
