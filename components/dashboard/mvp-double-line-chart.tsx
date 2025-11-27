"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { mes: "Ene", cac: 8, ltv: 12, ratio: 6 },
  { mes: "Feb", cac: 9, ltv: 14, ratio: 6.5 },
  { mes: "Mar", cac: 8.5, ltv: 15, ratio: 7 },
  { mes: "Abr", cac: 9.5, ltv: 16, ratio: 7.2 },
  { mes: "May", cac: 10, ltv: 17, ratio: 7.5 },
  { mes: "Jun", cac: 11, ltv: 18, ratio: 8 },
  { mes: "Jul", cac: 10.5, ltv: 19, ratio: 8.5 },
  { mes: "Ago", cac: 11.5, ltv: 20, ratio: 9 },
  { mes: "Sep", cac: 12, ltv: 21, ratio: 9.5 },
  { mes: "Oct", cac: 7, ltv: 22, ratio: 10 },
]

export function MVPDoubleLineChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Double Line Graph</h3>
        <div className="text-xs text-muted-foreground mt-2 space-y-1">
          <p>Línea 1: CAC $</p>
          <p>Línea 2: LTV $</p>
          <p>Línea 3: LTV/CAC RATIO</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="cac" stroke="#3b82f6" strokeWidth={2} name="CAC $" />
          <Line type="monotone" dataKey="ltv" stroke="#10b981" strokeWidth={2} name="LTV $" />
          <Line type="monotone" dataKey="ratio" stroke="#ef4444" strokeWidth={2} name="LTV/CAC RATIO" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
