"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { mes: "Ene", ingresos: 4000 },
  { mes: "Feb", ingresos: 3000 },
  { mes: "Mar", ingresos: 5000 },
  { mes: "Abr", ingresos: 4500 },
  { mes: "May", ingresos: 6000 },
  { mes: "Jun", ingresos: 5500 },
  { mes: "Jul", ingresos: 7000 },
  { mes: "Ago", ingresos: 6500 },
  { mes: "Sep", ingresos: 8000 },
  { mes: "Oct", ingresos: 7500 },
  { mes: "Nov", ingresos: 9000 },
  { mes: "Dic", ingresos: 8500 },
]

export function ChartLine() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 pb-0">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Ingresos Mensuales</h3>
        <p className="text-sm text-muted-foreground mt-1.5">Evolución de ingresos durante el año</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="mes" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Line type="monotone" dataKey="ingresos" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
