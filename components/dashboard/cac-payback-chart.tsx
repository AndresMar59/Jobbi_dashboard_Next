"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { mes: "Ene", cacPayback: 10 },
  { mes: "Feb", cacPayback: 9 },
  { mes: "Mar", cacPayback: 10 },
  { mes: "Abr", cacPayback: 11 },
  { mes: "May", cacPayback: 12 },
  { mes: "Jun", cacPayback: 13 },
  { mes: "Jul", cacPayback: 14 },
  { mes: "Ago", cacPayback: 15 },
  { mes: "Sep", cacPayback: 16 },
  { mes: "Oct", cacPayback: 18 },
  { mes: "Nov", cacPayback: 20 },
  { mes: "Dic", cacPayback: 22 },
]

export function CACPaybackChart() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground">CAC Ratio & CAC Payback ajustado</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 25, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} tickMargin={10} interval={0} height={40} padding={{ left: 20, right: 20 }} />
          <YAxis
            yAxisId="right"
            stroke="#6b7280"
            fontSize={12}
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
            yAxisId= "right"
            dataKey="cacPayback"
            stroke="#710cacff"
            strokeWidth={2}
            name="CAC Payback"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
