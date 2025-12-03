"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { mes: "Ene", conHT: 420, sinHT: 380 },
  { mes: "Feb", conHT: 380, sinHT: 350 },
  { mes: "Mar", conHT: 240, sinHT: 230 },
  { mes: "Abr", conHT: 280, sinHT: 250 },
  { mes: "May", conHT: 420, sinHT: 380 },
  { mes: "Jun", conHT: 390, sinHT: 370 },
  { mes: "Jul", conHT: 310, sinHT: 290 },
  { mes: "Ago", conHT: 350, sinHT: 320 },
  { mes: "Sep", conHT: 420, sinHT: 380 },
  { mes: "Oct", conHT: 400, sinHT: 360 },
  { mes: "Nov", conHT: 160, sinHT: 50 },
  { mes: "Dic", conHT: 180, sinHT: 70 },
]

export function DCPAMRPAChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">DCPA vs MRPA</h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
          <XAxis
            dataKey="mes" tick={{ fill: "oklch(0.55 0 0)", fontSize:12 }} padding={{ left: 20, right: 20 }} height={40}
          />
          <YAxis tick={{ fill: "oklch(0.55 0 0)", fontSize:12 }} width={30} tickFormatter={(v) => {
  if (Math.abs(v) >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
  if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`
  return `$${v}`}} />

          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.92 0 0)",
              borderRadius: "0.5rem",
            }}
          />
          <Legend
            verticalAlign="top"
            height={30}
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
          />
          <Bar dataKey="conHT" fill="#09124F" name="$ DCPA" radius={[4, 4, 0, 0]} />
          <Bar dataKey="sinHT" fill="#851485ff" name="$ MRPA" radius={[4, 4, 0, 0]} />
        </BarChart>
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
