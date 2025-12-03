"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

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
      <h3 className="text-lg font-semibold text-card-foreground mb-4">ARPA vs # clientes activos</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="mes" stroke="#6b7280" tickMargin={10} interval={0} tick={{ fontSize: 12 }} height={40} padding={{ left: 20, right: 20 }}/>

          <YAxis yAxisId="left" stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={(v) =>
    `$${v.toLocaleString("en-US", { minimumFractionDigits: 0 })}`}  width={30}/>

          <YAxis yAxisId="right" orientation="right" stroke="#9297a0ff" tick={{ fontSize: 12 }} strokeDasharray= "4 4"
           width={10} />
          <Legend
            verticalAlign="top"
            height={30}
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="clientes"
            stroke="#09124F"
            strokeWidth={2}
          //  dot={{ r: 4 }}
            name="# clientes activos"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="arpa"
            stroke="#e60c0cff"
            strokeWidth={2}
           // dot={{ r: 4 }}
            name="ARPA $"
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
