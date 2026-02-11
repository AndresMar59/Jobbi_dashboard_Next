"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { useNewARRData } from "@/lib/hooks/use-metric-data"
import { useChurnARRData } from "@/lib/hooks/use-metric-data"
import { MONTH_LABELS } from "@/lib/hooks/use-api-data"
import { ALL_MONTHS } from "@/lib/api/metrics"

// Datos estaticos para Expansion ARR y Net new ARR (se conectaran luego)
const STATIC_EXPANSION: Record<string, number> = {
  "01": 8000, "02": 9000, "03": 11000, "04": 10000, "05": 13000, "06": 15000,
  "07": 14000, "08": 14500, "09": 15500, "10": 16000, "11": 16500, "12": 17000,
}
const STATIC_NET_NEW: Record<string, number> = {
  "01": 12000, "02": 14000, "03": 17000, "04": 15000, "05": 20000, "06": 22000,
  "07": 21000, "08": 22500, "09": 24000, "10": 25000, "11": 26000, "12": 27000,
}

export function ARRMetricsChart() {
  const { filters } = useFilters()

  // Metricas calculadas con filtros de fecha y plan
  const { chartData: newARRData } = useNewARRData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })
  const { chartData: churnARRData } = useChurnARRData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })

  // Combinar todas las series en un solo dataset para el grafico
  const combinedData = ALL_MONTHS.map((m) => {
    const label = MONTH_LABELS[m]
    const newPoint = newARRData.find(d => d.monthLabel === label)
    const churnPoint = churnARRData.find(d => d.monthLabel === label)

    return {
      mes: label,
      newARR: newPoint?.newARR || 0,
      churnARR: churnPoint?.churnARR || 0,
      expansionARR: STATIC_EXPANSION[m] || 0,
      netNewARR: STATIC_NET_NEW[m] || 0,
    }
  })

  // Si hay filtro de mes, solo mostrar ese mes
  const displayData = filters.month !== "Todos"
    ? combinedData.filter(d => d.mes === filters.month)
    : combinedData

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">ARR per month</h3>
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
            <XAxis
              dataKey="mes"
              tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
              padding={{ left: 20, right: 20 }}
              height={40}
            />
            <YAxis
              tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
              width={30}
              tickFormatter={(v) => {
                if (Math.abs(v) >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
                if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`
                return `$${v}`
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(1 0 0)",
                border: "1px solid oklch(0.92 0 0)",
                borderRadius: "0.5rem",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
            />
            <Legend
              verticalAlign="top"
              height={40}
              iconSize={10}
              wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
            />
            <Line type="monotone" dataKey="churnARR" stroke="#2a2dcfff" strokeWidth={2} name="$ Churn ARR" dot={{ r: 4, fill: "white", stroke: "#2a2dcfff", strokeWidth: 2 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="expansionARR" stroke="#10b981" strokeWidth={2} name="$ Expansion ARR" dot={{ r: 4, fill: "white", stroke: "#10b981", strokeWidth: 2 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="netNewARR" stroke="#09124F" strokeWidth={2} name="$ Net new ARR" dot={{ r: 4, fill: "white", stroke: "#09124F", strokeWidth: 2 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="newARR" stroke="#6c11c0ff" strokeWidth={2} name="$ New ARR" dot={{ r: 4, fill: "white", stroke: "#6c11c0ff", strokeWidth: 2 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
