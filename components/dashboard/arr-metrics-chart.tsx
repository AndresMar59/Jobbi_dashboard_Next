"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { mes: "Ene", newDinero: 15000, netNewARR: 12000, expansionARR: 8000, churnARR: 3000 },
  { mes: "Feb", newDinero: 18000, netNewARR: 14000, expansionARR: 9000, churnARR: 3500 },
  { mes: "Mar", newDinero: 22000, netNewARR: 17000, expansionARR: 11000, churnARR: 4000 },
  { mes: "Abr", newDinero: 19000, netNewARR: 15000, expansionARR: 10000, churnARR: 3800 },
  { mes: "May", newDinero: 25000, netNewARR: 20000, expansionARR: 13000, churnARR: 4500 },
  { mes: "Jun", newDinero: 28000, netNewARR: 22000, expansionARR: 15000, churnARR: 5000 },
  { mes: "Jul", newDinero: 26000, netNewARR: 21000, expansionARR: 14000, churnARR: 4800 },
  { mes: "Ago", newDinero: 27000, netNewARR: 22500, expansionARR: 14500, churnARR: 5200 },
  { mes: "Sep", newDinero: 29000, netNewARR: 24000, expansionARR: 15500, churnARR: 5500 },
  { mes: "Oct", newDinero: 30000, netNewARR: 25000, expansionARR: 16000, churnARR: 5800 },
  { mes: "Nov", newDinero: 31000, netNewARR: 26000, expansionARR: 16500, churnARR: 6000 },
  { mes: "Dic", newDinero: 32000, netNewARR: 27000, expansionARR: 17000, churnARR: 6200 },
]

export function ARRMetricsChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">ARR per month</h3>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
          <XAxis dataKey="mes" tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }} padding={{ left: 20, right: 20 }} height={40} />
          <YAxis tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }} width={30} tickFormatter={(v) => {
  if (Math.abs(v) >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
  if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`
  return `$${v}`
}}
 />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.92 0 0)",
              borderRadius: "0.5rem",
            }}
          />
          <Legend
            verticalAlign="top"
            height={40}
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
          />
          <Line type="monotone" dataKey="churnARR" stroke="#2a2dcfff" strokeWidth={2} name="$ Churn ARR" />
          <Line type="monotone" dataKey="expansionARR" stroke="#10b981" strokeWidth={2} name="$ Expansion ARR" />
          <Line type="monotone" dataKey="netNewARR" stroke="#09124F" strokeWidth={2} name="$ Net new ARR" />
          <Line type="monotone" dataKey="newDinero" stroke="#6c11c0ff" strokeWidth={2} name="$ New dinero" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
