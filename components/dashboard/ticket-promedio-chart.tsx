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
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Ticket promedio PA</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="mes" stroke="#6b7280" tickMargin={10} interval={0} tick={{ fontSize: 12 }} height={40} padding={{ left: 20, right: 20 }}
          />
          <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={(v) => {
  if (Math.abs(v) >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
  if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`
  return `$${v}` }} width={30}/>
          
          <Tooltip
            contentStyle={{
              backgroundColor: "White",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          />
          <Legend
            verticalAlign="top"
            height={30}
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
          />
          <Line type="monotone" dataKey="cac" stroke="#09124F" strokeWidth={2} name="$ CAC" />
          <Line
            type="monotone"
            dataKey="ticketPromedio"
            stroke="#474194ff"
            strokeWidth={2}
            name="$ Ticket Promedio"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        <select className="w-full h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-medium transition-colors text-muted-foreground">
          <option>Tipo de empresa</option>
          <option>Enterprise</option>
          <option>SMB</option>
          <option>Startup</option>
        </select>
        <select className="w-full h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-medium transition-colors text-muted-foreground">
          <option>Tipo de plan</option>
          <option>Básico</option>
          <option>Pro</option>
          <option>Enterprise</option>
        </select>
      </div>
    </div>
  )
}
