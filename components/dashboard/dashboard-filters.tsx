"use client"

import { useState } from "react"

export function DashboardFilters() {
  const [selectedMonth, setSelectedMonth] = useState("Todos")
  const months = ["Todos", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {/* Filtro de fechas */}
      <div className="flex items-center gap-2">
        <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <option>Todas</option>
        </select>
      </div>

      {/* Selector de mes */}
      <div className="flex items-center gap-1 rounded-md border border-input bg-muted/50 p-1">
        {months.map((month) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              selectedMonth === month
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
