"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { mes: "Ene", clientes: 20, arpa: 20 },
  { mes: "Feb", clientes: 22, arpa: 21 },
  { mes: "Mar", clientes: 25, arpa: 23 },
  { mes: "Abr", clientes: 30, arpa: 25 },
  { mes: "May", clientes: 35, arpa: 27 },
  { mes: "Jun", clientes: 42, arpa: 30 },
  { mes: "Jul", clientes: 48, arpa: 32 },
  { mes: "Ago", clientes: 45, arpa: 28 },
  { mes: "Sep", clientes: 42, arpa: 26 },
  { mes: "Oct", clientes: 40, arpa: 28 },
  { mes: "Nov", clientes: 45, arpa: 35 },
  { mes: "Dic", clientes: 48, arpa: 42 },
]

export function ARPAClientesChart() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold mb-2">ARPA vs # clientes activos</h3>
      <p className="text-sm text-muted-foreground mb-1">Eje x: Mes</p>
      <p className="text-sm text-muted-foreground mb-1">Eje Y: # clientes activos</p>
      <p className="text-sm text-muted-foreground mb-4">Eje 2Y: ARPA $</p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="mes" stroke="hsl(var(--foreground))" tickMargin={10} interval={0} />
          <YAxis yAxisId="left" stroke="hsl(var(--foreground))" />
          <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="clientes"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="# clientes activos"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="arpa"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="ARPA $"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option>Tipo de empresa...</option>
          <option>Enterprise</option>
          <option>SMB</option>
          <option>Startup</option>
        </select>
        <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option>Tipo de plan</option>
          <option>Básico</option>
          <option>Pro</option>
          <option>Enterprise</option>
        </select>
      </div>
    </div>
  )
}
