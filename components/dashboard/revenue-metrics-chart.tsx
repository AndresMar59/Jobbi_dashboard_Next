"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { useRevenueMetricsData } from "@/lib/hooks/use-api-data"
import { MONTH_LABELS } from "@/lib/hooks/use-api-data"
import { ALL_MONTHS } from "@/lib/api/metrics"

export function RevenueMetricsChart() {
  const { filters } = useFilters()

  const { chartData, isLoading } = useRevenueMetricsData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })

  // Si hay filtro de mes específico, mostrar solo ese mes; si no, mostrar todos
  const displayData = filters.month !== "Todos"
    ? chartData
    : ALL_MONTHS.map((m) => {
      const label = MONTH_LABELS[m]
      const point = chartData.find(d => d.monthLabel === label)
      return {
        month: `${filters.year}-${m}`,
        monthLabel: label,
        revenueExpansion: point?.revenueExpansion || 0,
        grossChurnRate: point?.grossChurnRate || 0,
        netRevenueChurn: point?.netRevenueChurn || 0,
      }
    })

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">Revenue Metrics (%)</h3>
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
                dataKey="monthLabel"
                tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
                padding={{ left: 20, right: 20 }}
                height={40}
              />
              <YAxis
                tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
                width={30}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(1 0 0)",
                  border: "1px solid oklch(0.92 0 0)",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, undefined]}
              />
              <Legend
                verticalAlign="top"
                height={40}
                iconSize={10}
                wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
              />
              <Line 
                type="monotone" 
                dataKey="revenueExpansion" 
                stroke="#10b981" 
                strokeWidth={2} 
                name="Revenue Expansion (%)" 
                dot={{ r: 4, fill: "white", stroke: "#10b981", strokeWidth: 2 }} 
                isAnimationActive={false} 
              />
              <Line 
                type="monotone" 
                dataKey="grossChurnRate" 
                stroke="#ef4444" 
                strokeWidth={2} 
                name="Gross Churn Rate (%)" 
                dot={{ r: 4, fill: "white", stroke: "#ef4444", strokeWidth: 2 }} 
                isAnimationActive={false} 
              />
              <Line 
                type="monotone" 
                dataKey="netRevenueChurn" 
                stroke="#8b5cf6" 
                strokeWidth={2} 
                name="Net Revenue Churn (%)" 
                dot={{ r: 4, fill: "white", stroke: "#8b5cf6", strokeWidth: 2 }} 
                isAnimationActive={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
