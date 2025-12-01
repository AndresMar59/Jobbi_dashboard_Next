"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { mes: "Ene", cac: 20, ticketPromedio: 25 },
  { mes: "Feb", cac: 22, ticketPromedio: 28 },
  { mes: "Mar", cac: 24, ticketPromedio: 30 },
  { mes: "Abr", cac: 26, ticketPromedio: 32 },
  { mes: "May", cac: 28, ticketPromedio: 35 },
  { mes: "Jun", cac: 30, ticketPromedio: 38 },
  { mes: "Jul", cac: 32, ticketPromedio: 40 },
  { mes: "Ago", cac: 35, ticketPromedio: 42 },
  { mes: "Sep", cac: 38, ticketPromedio: 45 },
  { mes: "Oct", cac: 42, ticketPromedio: 48 },
  { mes: "Nov", cac: 45, ticketPromedio: 50 },
  { mes: "Dic", cac: 48, ticketPromedio: 52 },
]

export function TicketPromedioChart() {
  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Ticket promedio PA</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="mes"
            className="text-xs"
            tickMargin={10}
            interval={0}
            tick={{ fill: "hsl(var(--foreground))" }}
          />
          <YAxis className="text-xs" tick={{ fill: "hsl(var(--foreground))" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
          />
          <Line type="monotone" dataKey="cac" stroke="#09124F" strokeWidth={2} name="CAC" dot={{ r: 3 }} />
          <Line
            type="monotone"
            dataKey="ticketPromedio"
            stroke="#ef4444"
            strokeWidth={2}
            name="Ticket Promedio"
            dot={{ r: 3 }}
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
