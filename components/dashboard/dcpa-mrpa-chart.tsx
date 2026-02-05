"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { useUnitEconomicsData } from "@/lib/hooks/use-api-data"
import { useMRRData } from "@/lib/hooks/use-api-data"
import { ALL_MONTHS } from "@/lib/api/metrics"
import { MONTH_LABELS } from "@/lib/hooks/use-api-data"

export function DCPAMRPAChart() {
  const { filters } = useFilters()

  // DCPA: solo segmentado por fecha (no plan)
  const { chartData: dcpaChart, isLoading: isLoadingDCPA } = useUnitEconomicsData({
    year: filters.year,
    month: filters.month,
  })

  // MRPA: MRR solo segmentado por fecha (no plan), para congruencia
  const { chartData: mrrChart, isLoading: isLoadingMRR } = useMRRData({
    year: filters.year,
    month: filters.month,
    // No se pasa plan - siempre suma todos los planes
  })

  // Combinar ambos en un solo dataset por mes
  const chartData = ALL_MONTHS.map(m => {
    const dcpaEntry = dcpaChart.find(d => d.month?.endsWith(`-${m}`))
    const mrrEntry = mrrChart.find(d => d.month?.endsWith(`-${m}`))
    return {
      mes: MONTH_LABELS[m],
      dcpa: dcpaEntry?.dcpa || 0,
      mrpa: mrrEntry?.mrr || 0,
    }
  })

  const isLoading = isLoadingDCPA || isLoadingMRR

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">DCPA vs MRPA</h3>

      {isLoading ? (
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando datos...</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
            <XAxis
              dataKey="mes"
              tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
              padding={{ left: 20, right: 20 }}
              height={40}
            />
            <YAxis
              tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
              width={50}
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
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
            />
            <Legend
              verticalAlign="top"
              height={30}
              iconSize={10}
              wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
            />
            <Bar dataKey="dcpa" fill="#09124F" name="$ DCPA" radius={[4, 4, 0, 0]} />
            <Bar dataKey="mrpa" fill="#851485ff" name="$ MRPA" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
