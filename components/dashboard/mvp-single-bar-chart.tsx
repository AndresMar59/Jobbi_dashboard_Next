"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { mes: "Ene", margen: 8500 },
  { mes: "Feb", margen: 12000 },
  { mes: "Mar", margen: 15000 },
  { mes: "Abr", margen: 13500 },
  { mes: "May", margen: 16000 },
  { mes: "Jun", margen: 14000 },
  { mes: "Jul", margen: 18000 },
  { mes: "Ago", margen: 17000 },
  { mes: "Sep", margen: 19500 },
  { mes: "Oct", margen: 16500 },
  { mes: "Nov", margen: 15000 },
  { mes: "Dic", margen: 14500 },
]

export function MVPSingleBarChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Bar chart</h3>
        <div className="text-xs text-muted-foreground mt-2 space-y-1">
          <p>Eje x: Mes</p>
          <p>Eje Y: $ Margen de ganancia</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
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
          <Bar dataKey="margen" fill="#09124F" name="Margen de ganancia" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
