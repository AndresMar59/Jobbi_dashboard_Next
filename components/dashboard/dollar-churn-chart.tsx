"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { useRevenueChurnData } from "@/lib/hooks/use-api-data"
import { useRevenueMetricsData } from "@/lib/hooks/use-api-data"
import { MONTH_LABELS } from "@/lib/hooks/use-api-data"
import { ALL_MONTHS } from "@/lib/api/metrics"
import { Loader2 } from "lucide-react"

export function DollarChurnChart() {
  const { filters } = useFilters()

  // Revenue churn
  const { chartData: revenueChurnData, isLoading: loadingChurn } = useRevenueChurnData({
    year: filters.year,
    month: filters.month,
  })

  // Nuevas métricas calculadas: Revenue Expansion %, Gross Churn Rate %, Net Revenue Churn %
  const { chartData: metricsData, isLoading: loadingMetrics } = useRevenueMetricsData({
    year: filters.year,
    month: "Todos", // Siempre obtener todos los meses para combinar con revenue churn
    plan: filters.plan,
  })

  const isLoading = loadingChurn || loadingMetrics

  // Combinar datos de revenue churn con las nuevas métricas
  const combinedData = ALL_MONTHS.map(m => {
    const label = MONTH_LABELS[m]
    const churnEntry = revenueChurnData.find(d => d.monthLabel === label)
    const metricsEntry = metricsData.find(d => d.monthLabel === label)

    return {
      mes: label,
      revenueChurn: churnEntry?.revenueChurn || 0,
      revenueExpansion: metricsEntry?.revenueExpansion || 0,
      grossChurnRate: metricsEntry?.grossChurnRate || 0,
      netRevenueChurn: metricsEntry?.netRevenueChurn || 0,
    }
  })

  // Si hay filtro de mes, filtrar; si no, mostrar todos
  const displayData = filters.month !== "Todos"
    ? combinedData.filter(d => d.mes === filters.month)
    : combinedData

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Dollar churn</h3>

      {isLoading ? (
        <div className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="mes"
                padding={{ left: 20, right: 20 }}
                stroke="#6b7280"
                fontSize={12}
                tickMargin={10}
                height={40}
                interval={0}
              />
              <YAxis
                yAxisId="left"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                width={30}
                tickFormatter={(v) => {
                  if (Math.abs(v) >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
                  if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`
                  return `$${v}`
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#959697ff"
                tick={{ fontSize: 12 }}
                strokeDasharray="4 4"
                width={30}
                tickFormatter={(v) => `${v.toFixed(1)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
                formatter={(value: number, name: string) => {
                  if (name.includes("Revenue churn") || name.includes("Revenue Expansion")) {
                    return [`$${value.toFixed(2)}`, name]
                  }
                  return [`${value.toFixed(2)}%`, name]
                }}
              />
              <Legend
                verticalAlign="top"
                height={30}
                iconSize={10}
                wrapperStyle={{
                  fontSize: "12px",
                  paddingBottom: "10px",
                }}
              />
              <Line
                type="monotone"
                yAxisId="left"
                dataKey="revenueExpansion"
                stroke="#10b981"
                strokeWidth={2}
                name="$ Revenue Expansion"
                dot={{ r: 4, fill: "white", stroke: "#10b981", strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                yAxisId="left"
                dataKey="revenueChurn"
                stroke="#09124F"
                strokeWidth={2}
                name="$ Revenue churn"
                dot={{ r: 4, fill: "white", stroke: "#09124F", strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                yAxisId="right"
                dataKey="netRevenueChurn"
                stroke="#382af1ff"
                strokeWidth={2}
                name="Net Revenue Churn %"
                dot={{ r: 4, fill: "white", stroke: "#382af1ff", strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                yAxisId="right"
                dataKey="grossChurnRate"
                stroke="#ef4444"
                strokeWidth={2}
                name="Gross Churn Rate %"
                dot={{ r: 4, fill: "white", stroke: "#ef4444", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
