"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { mes: "Ene", cac: 5,  cacPayback: 10 },
  { mes: "Feb", cac: 4.5,  cacPayback: 9 },
  { mes: "Mar", cac: 5,  cacPayback: 10 },
  { mes: "Abr", cac: 5.5,  cacPayback: 11 },
  { mes: "May", cac: 6,  cacPayback: 12 },
  { mes: "Jun", cac: 7, cacPayback: 13 },
  { mes: "Jul", cac: 8,  cacPayback: 14 },
  { mes: "Ago", cac: 10,  cacPayback: 15 },
  { mes: "Sep", cac: 12,  cacPayback: 16 },
  { mes: "Oct", cac: 14,  cacPayback: 18 },
  { mes: "Nov", cac: 15,  cacPayback: 20 },
  { mes: "Dic", cac: 16,  cacPayback: 22 },
]

export function CACPaybackChart() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground">CAC Ratio & CAC Payback ajustado</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 25, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} tickMargin={10} interval={0} height={40} padding={{ left: 20, right: 20 }} />
          <YAxis yAxisId= "left" stroke="#6b7280" fontSize={12} width={30} tickFormatter={(v) => {
  if (Math.abs(v) >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
  if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`
  return `$${v}`
}}/>

<YAxis
  yAxisId="right"
  orientation="right"
  stroke="#959697ff"
  tick={{ fontSize: 12 }}
  strokeDasharray="4 4"
  width={30}
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
            dataKey="cac"
            stroke="#09124F"
            strokeWidth={2}
          //  dot={{ fill: "#09124F", r: 4 }}
            name="$ CAC"
          />
          <Line
            type="monotone"
            yAxisId= "right"
            dataKey="cacPayback"
            stroke="#710cacff"
            strokeWidth={2}
         //   dot={{ fill: "#10b981", r: 4 }}
            name="CAC Payback (month)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
