"use client"

import { useFilters } from "@/lib/contexts/filters-context"

export function DashboardFilters() {
  const { filters, setYear, setMonth, setIncludePayroll} = useFilters()


  const months = ["Todos", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const years = ["2025", "2026"]
  
  // Obtener planes disponibles del microservicio, asegurando que "Todos" siempre esté primero


  return (

    <div className="mb-6 flex flex-wrap gap-3">
      <select
        value={filters.year}
        onChange={(e) => setYear(e.target.value)}
        className="h-10 rounded-md border border-input bg-muted/50 px-4 py-2 text-sm font-medium transition-colors text-muted-foreground shadow-sm"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <select
        value={filters.IncludePayroll ? "true" : "false"}
        onChange={(e) => setIncludePayroll(e.target.value === "true")}
        className="h-10 rounded-md border border-input bg-muted/50 px-4 py-2 text-sm font-medium transition-colors text-muted-foreground shadow-sm"
      >
        <option value="true">Incluir nómina</option>
        <option value="false">Excluir nómina</option>
      </select>

      {/* Selector de mes */}
      <div className="flex items-center gap-1 rounded-md border border-input bg-muted/50 p-1 shadow-sm">
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
