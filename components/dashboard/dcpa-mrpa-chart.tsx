"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { useUnitEconomicsData } from "@/lib/hooks/use-api-data"
import { useMRRData } from "@/lib/hooks/use-api-data"
import { useMRRNewData } from "@/lib/hooks/use-api-data"
import { useUsuariosActivosData } from "@/lib/hooks/use-api-data"
import { ALL_MONTHS } from "@/lib/api/metrics"
import { MONTH_LABELS } from "@/lib/hooks/use-api-data"

export function DCPAMRPAChart() {
  const { filters } = useFilters()

  // DCPA: del UE, sin segregación por plan (global)
  const { chartData: dcpaChart, isLoading: isLoadingDCPA } = useUnitEconomicsData({
    year: filters.year,
    month: filters.month,
  })

  // MRR: suma de todos los planes
  const { chartData: mrrChart, isLoading: isLoadingMRR } = useMRRData({
    year: filters.year,
    month: filters.month,
  })

  // New MRR: suma de todos los planes
  const { chartData: newMRRChart, isLoading: isLoadingNewMRR } = useMRRNewData({
    year: filters.year,
    month: filters.month,
  })

  // Obtener datos de usuarios activos del mes (global, sin plan)
  const { chartData: usuariosActivosChart, isLoading: isLoadingActivos } = useUsuariosActivosData({
    year: filters.year,
    month: "Todos", // Sin filtro de mes específico para obtener datos completos
  })

  // Combinar ambos en un solo dataset por mes
  const chartData = ALL_MONTHS.map(m => {
    const dcpaEntry = dcpaChart.find(d => d.month?.endsWith(`-${m}`))
    const mrrEntry = mrrChart.find(d => d.month?.endsWith(`-${m}`))
    const newMRREntry = newMRRChart.find(d => d.month?.endsWith(`-${m}`))
    
    // Obtener usuarios activos del mes
    const activosEntry = usuariosActivosChart.find(d => d.month?.endsWith(`-${m}`))
    const activeUsers = activosEntry?.activeUsers || 1 // Evitar división por 0

    // DCPA = DCPA_UE / usuarios_activos
    const dcpaUE = dcpaEntry?.dcpa || 0
    const dcpaCalculated = activeUsers > 0 ? dcpaUE / activeUsers : 0

    // MRPA = MRR + New MRR
    const mrrValue = mrrEntry?.mrr || 0
    const newMRRValue = newMRREntry?.newMRR || 0
    const mrpaValue = mrrValue + newMRRValue

    return {
      mes: MONTH_LABELS[m],
      dcpa: dcpaCalculated,
      mrpa: mrpaValue,
    }
  })

  const isLoading = isLoadingDCPA || isLoadingMRR || isLoadingNewMRR || isLoadingActivos

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">DCPA vs MRPA</h3>

      {isLoading ? (
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando datos...</div>
        </div>
      ) : (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
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
        </div>
      )}
    </div>
  )
}
