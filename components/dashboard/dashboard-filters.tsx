"use client"

import { useFilters } from "@/lib/contexts/filters-context"
import { useMRRData } from "@/lib/hooks/use-api-data"

export function DashboardFilters() {
  const { filters, setYear, setMonth, setPlan } = useFilters()
  const { plans: availablePlans } = useMRRData({ year: filters.year })

  const months = ["Todos", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const years = ["2025", "2026"]
  
  // Obtener planes disponibles del microservicio
  const plans = ["Todos", ...availablePlans]

  console.log("[v0] Available plans:", availablePlans, "Current filter plan:", filters.plan)

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <select
        value={filters.year}
        onChange={(e) => setYear(e.target.value)}
        className="h-10 rounded-md border border-input bg-muted/50 px-4 py-2 text-sm font-medium transition-colors text-muted-foreground"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <select
        value={filters.plan}
        onChange={(e) => {
          console.log("[v0] Changing plan to:", e.target.value)
          setPlan(e.target.value)
        }}
        className="h-10 rounded-md border border-input bg-muted/50 px-4 py-2 text-sm font-medium transition-colors text-muted-foreground"
      >
        {plans.length > 0 ? (
          plans.map((plan) => (
            <option key={plan} value={plan}>
              {plan === "Todos" ? "Todos los planes" : plan}
            </option>
          ))
        ) : (
          <option value="Todos">Cargando planes...</option>
        )}
      </select>

      {/* Selector de mes */}
      <div className="flex items-center gap-1 rounded-md border border-input bg-muted/50 p-1">
        {months.map((month) => (
          <button
            key={month}
            onClick={() => setMonth(month)}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              filters.month === month
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {month}
          </button>
        ))}
      </div>
    </div>
  )
}
