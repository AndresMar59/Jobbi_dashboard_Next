"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { mes: "Ene", margin: 35 },
  { mes: "Feb", margin: 38 },
  { mes: "Mar", margin: 42 },
  { mes: "Abr", margin: 40 },
  { mes: "May", margin: 45 },
  { mes: "Jun", margin: 48 },
  { mes: "Jul", margin: 44 },
  { mes: "Ago", margin: 46 },
  { mes: "Sep", margin: 50 },
  { mes: "Oct", margin: 47 },
  { mes: "Nov", margin: 52 },
  { mes: "Dic", margin: 49 },
]

export function MarginGananciaChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">$ Margen de ganancia</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
          <XAxis dataKey="mes" tick={{ fill: "oklch(0.55 0 0)" }} />
          <YAxis tick={{ fill: "oklch(0.55 0 0)" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.92 0 0)",
              borderRadius: "0.5rem",
            }}
          />
          <Bar dataKey="margin" fill="#09124F" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
