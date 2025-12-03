"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { mes: "Ene", revenueChurn: 5, revenueExpansion: 3, netRevenueChurn: 2 },
  { mes: "Feb", revenueChurn: 4.5, revenueExpansion: 2.5, netRevenueChurn: 2 },
  { mes: "Mar", revenueChurn: 4, revenueExpansion: 3, netRevenueChurn: 1 },
  { mes: "Abr", revenueChurn: 5, revenueExpansion: 4, netRevenueChurn: 1 },
  { mes: "May", revenueChurn: 6, revenueExpansion: 8, netRevenueChurn: -2 },
  { mes: "Jun", revenueChurn: 7, revenueExpansion: 10, netRevenueChurn: -3 },
  { mes: "Jul", revenueChurn: 8, revenueExpansion: 12, netRevenueChurn: -4 },
  { mes: "Ago", revenueChurn: 7.5, revenueExpansion: 14, netRevenueChurn: -6.5 },
  { mes: "Sep", revenueChurn: 7, revenueExpansion: 16, netRevenueChurn: -9 },
  { mes: "Oct", revenueChurn: 8, revenueExpansion: 18, netRevenueChurn: -10 },
  { mes: "Nov", revenueChurn: 7.5, revenueExpansion: 20, netRevenueChurn: -12.5 },
  { mes: "Dic", revenueChurn: 8, revenueExpansion: 22, netRevenueChurn: -14 },
]

export function DollarChurnChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Dollar churn</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
  dataKey="mes"
  padding={{ left: 20, right: 20 }}
  stroke="#6b7280"
  fontSize ={12}
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

  // tickFormatter={(v) => `${v}%`}
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
           // dot={{ fill: "#09124F", r: 4 }}
            name="$ Revenue churn"
          />
          <Line
            type="monotone"
                      yAxisId="left"
            dataKey="revenueExpansion"
            stroke="#10b981"
            strokeWidth={2}
         //   dot={{ fill: "#10b981", r: 4 }}
            name="$ Revenue Expansion"
          />
          <Line
            type="monotone"
                      yAxisId="right"
            dataKey="netRevenueChurn"
            stroke="#382af1ff"
            strokeWidth={2}
          //  dot={{ fill: "#ef4444", r: 4 }}
            name="Net Revenue Churn %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
