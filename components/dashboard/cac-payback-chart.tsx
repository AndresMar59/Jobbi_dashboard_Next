"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { mes: "Ene", cac: 5, cacPercent: 5, cacPayback: 10 },
  { mes: "Feb", cac: 4.5, cacPercent: 4, cacPayback: 9 },
  { mes: "Mar", cac: 5, cacPercent: 4.5, cacPayback: 10 },
  { mes: "Abr", cac: 5.5, cacPercent: 5, cacPayback: 11 },
  { mes: "May", cac: 6, cacPercent: 5.5, cacPayback: 12 },
  { mes: "Jun", cac: 7, cacPercent: 6, cacPayback: 13 },
  { mes: "Jul", cac: 8, cacPercent: 7, cacPayback: 14 },
  { mes: "Ago", cac: 10, cacPercent: 8, cacPayback: 15 },
  { mes: "Sep", cac: 12, cacPercent: 9, cacPayback: 16 },
  { mes: "Oct", cac: 14, cacPercent: 10, cacPayback: 18 },
  { mes: "Nov", cac: 15, cacPercent: 12, cacPayback: 20 },
  { mes: "Dic", cac: 16, cacPercent: 14, cacPayback: 22 },
]

export function CACPaybackChart() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">CAC Ratio & CAC Payback ajustado</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} tickMargin={10} interval={0} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconSize={10}
            wrapperStyle={{
              fontSize: "12px",
              paddingBottom: "10px",
            }}
          />
          <Line
            type="monotone"
            dataKey="cac"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            name="CAC"
          />
          <Line
            type="monotone"
            dataKey="cacPercent"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 4 }}
            name="CAC %"
          />
          <Line
            type="monotone"
            dataKey="cacPayback"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
            name="CAC Payback"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
