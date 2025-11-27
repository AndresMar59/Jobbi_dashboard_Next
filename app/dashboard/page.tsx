"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { KPICard } from "@/components/dashboard/kpi-card"
import { ChartLine } from "@/components/dashboard/chart-line"
import { ChartBar } from "@/components/dashboard/chart-bar"
import { DollarSign, Users, TrendingUp, Ticket } from "lucide-react"
import { useChartMogulMetrics } from "@/lib/hooks/use-chartmogul"
import { useGoogleSheets } from "@/lib/hooks/use-google-sheets"
import { useState, useMemo } from "react"

export default function DashboardPage() {
  const { metrics, isLoading: chartMogulLoading, isError: chartMogulError } = useChartMogulMetrics()
  const { data: expenses, isLoading: sheetsLoading, isError: sheetsError } = useGoogleSheets()

  const [selectedMonth, setSelectedMonth] = useState<number>(0) // 0 = todos los meses
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas") // "Todas" = todas las categorías

  const categories = useMemo(() => {
    const unique = Array.from(new Set(expenses.map((e) => e.tipo)))
    return ["Todas", ...unique]
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchMonth = selectedMonth === 0 || expense.mes === selectedMonth
      const matchCategory = selectedCategory === "Todas" || expense.tipo === selectedCategory
      return matchMonth && matchCategory
    })
  }, [expenses, selectedMonth, selectedCategory])

  const totalGastos = filteredExpenses.reduce((sum, expense) => sum + expense.costo, 0)

  const gastosPorMes = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1
    const total = filteredExpenses.filter((e) => e.mes === mes).reduce((sum, e) => sum + e.costo, 0)
    return { mes, total }
  })

  // Métricas de ChartMogul (si están disponibles)
  const mrr = metrics?.entries?.[metrics.entries.length - 1]?.mrr || 45231
  const customers = metrics?.entries?.[metrics.entries.length - 1]?.customers || 2350
  const ltv = metrics?.entries?.[metrics.entries.length - 1]?.ltv || 3.24

  console.log("[v0] Gastos filtrados:", filteredExpenses.length)
  console.log("[v0] Total gastos:", totalGastos)

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

          {sheetsError && (
            <div className="mb-4 p-4 bg-destructive/10 rounded-lg text-destructive">
              <strong>Error de Google Sheets:</strong> El Sheet está privado. Compártelo con "Cualquier persona con el
              enlace" para ver los datos.
            </div>
          )}

          <div className="mb-6 p-6 rounded-lg border border-border bg-card">
            <h3 className="text-lg font-semibold mb-4">Filtros de Gastos</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Filtro de Categoría */}
              <div>
                <label className="block text-sm font-medium mb-2">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Mes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mes:{" "}
                  {selectedMonth === 0
                    ? "Todos"
                    : new Date(2024, selectedMonth - 1).toLocaleString("es", { month: "long" })}
                </label>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Todos</span>
                  <span>Ene</span>
                  <span>Mar</span>
                  <span>Jun</span>
                  <span>Sep</span>
                  <span>Dic</span>
                </div>
              </div>
            </div>
          </div>

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
            <ChartBar data={filteredExpenses} />
          </div>
        </main>
      </div>
    </div>
  )
}
