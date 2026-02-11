"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { useMRRData } from "@/lib/hooks/use-api-data"
import { useChurnMRRData } from "@/lib/hooks/use-api-data"
import { useMRRNewData } from "@/lib/hooks/use-api-data"
import { useExpansionMRRData } from "@/lib/hooks/use-api-data"
import { useContractionMRRData } from "@/lib/hooks/use-api-data"
import { MONTH_LABELS } from "@/lib/hooks/use-api-data"
import { ALL_MONTHS } from "@/lib/api/metrics"

export function MRRMetricsChart() {
  const { filters } = useFilters()

  console.log("[v0] MRRMetricsChart - Current filters:", { year: filters.year, month: filters.month, plan: filters.plan })

  // Obtener todas las métricas de MRR
  const { chartData: mrrData, isLoading: loadingMRR } = useMRRData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })

  const { chartData: churnMRRData, isLoading: loadingChurn } = useChurnMRRData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })

  const { chartData: newMRRData, isLoading: loadingNewMRR } = useMRRNewData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })

  const { chartData: expansionMRRData, isLoading: loadingExpansion } = useExpansionMRRData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })

  const { chartData: contractionMRRData, isLoading: loadingContraction } = useContractionMRRData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })

  const isLoading = loadingMRR || loadingChurn || loadingNewMRR || loadingExpansion || loadingContraction

  console.log("[v0] MRRMetricsChart - Data loaded:", { mrrData: mrrData.length, churnMRRData: churnMRRData.length, newMRRData: newMRRData.length })

  // Combinar todas las series en un solo dataset para el gráfico
  const combinedData = ALL_MONTHS.map((m) => {
    const label = MONTH_LABELS[m]
    
    const mrrPoint = mrrData.find(d => d.monthLabel === label)
    const churnPoint = churnMRRData.find(d => d.monthLabel === label)
    const newMRRPoint = newMRRData.find(d => d.monthLabel === label)
    const expansionPoint = expansionMRRData.find(d => d.monthLabel === label)
    const contractionPoint = contractionMRRData.find(d => d.monthLabel === label)

    return {
      mes: label,
      mrr: mrrPoint?.mrr || 0,
      churnMRR: churnPoint?.churnMRR || 0,
      newMRR: newMRRPoint?.newMRR || 0,
      expansionMRR: expansionPoint?.expansionMRR || 0,
      contractionMRR: contractionPoint?.contractionMRR || 0,
    }
  })

  // Si hay filtro de mes, solo mostrar ese mes; si no, mostrar todos
  const displayData = filters.month !== "Todos"
    ? combinedData.filter(d => d.mes === filters.month)
    : combinedData

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">MRR 2026</h3>
      </div>
      {isLoading ? (
        <div className="h-[350px] w-full flex items-center justify-center">
          <div className="text-muted-foreground">Cargando datos...</div>
        </div>
      ) : (
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
              <Line type="monotone" dataKey="churnMRR" stroke="#ef4444" strokeWidth={2} name="$ Churn MRR" dot={{ r: 4, fill: "white", stroke: "#ef4444", strokeWidth: 2 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="expansionMRR" stroke="#a855f7" strokeWidth={2} name="$ Expansion MRR" dot={{ r: 4, fill: "white", stroke: "#a855f7", strokeWidth: 2 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={2} name="$ MRR" dot={{ r: 4, fill: "white", stroke: "#3b82f6", strokeWidth: 2 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="newMRR" stroke="#10b981" strokeWidth={2} name="$ New MRR" dot={{ r: 4, fill: "white", stroke: "#10b981", strokeWidth: 2 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
