"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const defaultData = [
  { mes: "Ene", usuarios: 186 },
  { mes: "Feb", usuarios: 305 },
  { mes: "Mar", usuarios: 237 },
  { mes: "Abr", usuarios: 273 },
  { mes: "May", usuarios: 209 },
  { mes: "Jun", usuarios: 314 },
  { mes: "Jul", usuarios: 290 },
  { mes: "Ago", usuarios: 342 },
  { mes: "Sep", usuarios: 380 },
  { mes: "Oct", usuarios: 415 },
  { mes: "Nov", usuarios: 452 },
  { mes: "Dic", usuarios: 490 },
]

interface ChartBarProps {
  data?: Array<{ date?: string; customers?: number }>
}

export function ChartBar({ data: apiData }: ChartBarProps) {
  const chartData =
    apiData && apiData.length > 0
      ? apiData.slice(-12).map((entry) => ({
          mes: entry.date ? new Date(entry.date).toLocaleDateString("es-ES", { month: "short" }) : "",
          usuarios: entry.customers || 0,
        }))
      : defaultData

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 pb-0">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Nuevos Usuarios</h3>
        <p className="text-sm text-muted-foreground mt-1.5">Usuarios registrados por mes</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
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
            <Bar dataKey="usuarios" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
