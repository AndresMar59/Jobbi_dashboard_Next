"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"
import { MONTH_MAP, MONTH_LABELS } from "@/lib/hooks/use-api-data"

interface CACResponse {
  [month: string]: number
}

interface LTVResponse {
  [plan: string]: {
    [month: string]: {
      ltv: number
      avg_revenue: number
      avg_lifespan: number
    }
  }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function CACVsLTVChart() {
  const { filters } = useFilters()
  const year = filters.year
  const month = filters.month

  const { data: cacData } = useSWR<CACResponse>(
    `/api/costs/cac?start_date=2025-12-31T23:59:59.999&acumulado=true`,
    fetcher
  )
  const { data: ltvData } = useSWR<LTVResponse>(`/api/micro/ltv`, fetcher)

  // CAC: filtrar por año y mes
  let cacValue = 0
  if (cacData) {
    if (month !== "Todos") {
      // Si hay mes específico, usar ese mes
      const monthNum = MONTH_MAP[month]
      const key = `${year}-${monthNum}`
      cacValue = cacData[key] || 0
    } else {
      // Si es "Todos", promediar todos los meses del año
      const cacMonths = Object.entries(cacData)
        .filter(([m]) => m.startsWith(year))
        .map(([, v]) => v)
      cacValue = cacMonths.length > 0 ? cacMonths.reduce((a, b) => a + b, 0) / cacMonths.length : 0
    }
  }

  // LTV: promedio global (sin segmentación por plan)
  let ltvValue = 0
  if (ltvData) {
    let totalLtv = 0
    let count = 0
    
    for (const [, planMonths] of Object.entries(ltvData)) {
      for (const [monthKey, data] of Object.entries(planMonths)) {
        const [dataYear, dataMonth] = monthKey.split("-")
        
        // Filtrar por año
        if (year !== "Todos" && dataYear !== year) continue
        
        // Filtrar por mes si se especifica
        if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
        
        totalLtv += data.ltv
        count++
      }
    }
    
    ltvValue = count > 0 ? totalLtv / count : 0
  }

  const chartData = [
    { name: "CAC", value: cacValue },
    { name: "LTV", value: ltvValue },
  ]

  const monthLabel = month !== "Todos" ? ` - ${month}` : ""

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">CAC VS LTV</h3>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            />
            <Bar dataKey="value" fill="#1e1b4b" radius={[4, 4, 0, 0]} barSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        CAC promedio anual {year}{monthLabel} | LTV global
      </p>
    </div>
  )
}
