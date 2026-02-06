"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { useRevenueChurnData } from "@/lib/hooks/use-api-data"
import { Loader2 } from "lucide-react"

// Datos estaticos para Revenue Expansion y Net Revenue Churn %
// Se reemplazaran cuando se conecten sus respectivos endpoints
const STATIC_DATA: Record<string, { revenueExpansion: number; netRevenueChurn: number }> = {
  "Ene": { revenueExpansion: 3, netRevenueChurn: 2 },
  "Feb": { revenueExpansion: 2.5, netRevenueChurn: 2 },
  "Mar": { revenueExpansion: 3, netRevenueChurn: 1 },
  "Abr": { revenueExpansion: 4, netRevenueChurn: 1 },
  "May": { revenueExpansion: 8, netRevenueChurn: -2 },
  "Jun": { revenueExpansion: 10, netRevenueChurn: -3 },
  "Jul": { revenueExpansion: 12, netRevenueChurn: -4 },
  "Ago": { revenueExpansion: 14, netRevenueChurn: -6.5 },
  "Sep": { revenueExpansion: 16, netRevenueChurn: -9 },
  "Oct": { revenueExpansion: 18, netRevenueChurn: -10 },
  "Nov": { revenueExpansion: 20, netRevenueChurn: -12.5 },
  "Dic": { revenueExpansion: 22, netRevenueChurn: -14 },
}

export function DollarChurnChart() {
  const { filters } = useFilters()

  // Revenue churn solo responde a filtros de fecha (no plan)
  const { chartData, isLoading } = useRevenueChurnData({
    year: filters.year,
    month: filters.month,
  })

  // Combinar datos reales de revenue churn con estaticos de las otras dos lineas
  const combinedData = chartData.map(d => {
    const staticEntry = STATIC_DATA[d.monthLabel] || { revenueExpansion: 0, netRevenueChurn: 0 }
    return {
      mes: d.monthLabel,
      revenueChurn: d.revenueChurn,
      revenueExpansion: staticEntry.revenueExpansion,
      netRevenueChurn: staticEntry.netRevenueChurn,
    }
  })

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
            <LineChart data={combinedData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
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
                dataKey="revenueChurn"
                stroke="#09124F"
                strokeWidth={2}
                name="$ Revenue churn"
                dot={{ r: 4, fill: "white", stroke: "#09124F", strokeWidth: 2 }}
                isAnimationActive={false}
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
                yAxisId="right"
                dataKey="netRevenueChurn"
                stroke="#382af1ff"
                strokeWidth={2}
                name="Net Revenue Churn %"
                dot={{ r: 4, fill: "white", stroke: "#382af1ff", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
