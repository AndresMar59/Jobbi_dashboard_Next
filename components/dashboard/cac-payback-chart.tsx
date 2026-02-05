"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { useCACPaybackData } from "@/lib/hooks/use-metric-data"

export function CACPaybackChart() {
  const { filters } = useFilters()

  // CAC Payback solo responde a filtros de fecha (no plan, ya que CAC no tiene plan)
  const { chartData, isLoading } = useCACPaybackData({
    year: filters.year,
    month: filters.month,
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground">CAC Payback</h3>
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          Cargando datos...
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground">CAC Payback</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 25, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="monthLabel"
            stroke="#6b7280"
            fontSize={12}
            tickMargin={10}
            interval={0}
            height={40}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            width={40}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
            formatter={(value: number) => [`${value.toFixed(2)} meses`, "CAC Payback"]}
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
            dataKey="cacPayback"
            stroke="#710cacff"
            strokeWidth={2}
            dot={{ fill: "#710cacff", r: 4 }}
            name="CAC Payback"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
