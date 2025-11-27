"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { mes: "Ene", newDinero: 15000, netNewARR: 12000, expansionARR: 8000, churnARR: 3000 },
  { mes: "Feb", newDinero: 18000, netNewARR: 14000, expansionARR: 9000, churnARR: 3500 },
  { mes: "Mar", newDinero: 22000, netNewARR: 17000, expansionARR: 11000, churnARR: 4000 },
  { mes: "Abr", newDinero: 19000, netNewARR: 15000, expansionARR: 10000, churnARR: 3800 },
  { mes: "May", newDinero: 25000, netNewARR: 20000, expansionARR: 13000, churnARR: 4500 },
  { mes: "Jun", newDinero: 28000, netNewARR: 22000, expansionARR: 15000, churnARR: 5000 },
]

export function ARRMetricsChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">Bar chart</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
          <XAxis dataKey="mes" hide={true} />
          <YAxis tick={{ fill: "oklch(0.55 0 0)" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.92 0 0)",
              borderRadius: "0.5rem",
            }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="newDinero" stroke="#ef4444" strokeWidth={2} name="$ New dinero" />
          <Line type="monotone" dataKey="netNewARR" stroke="#3b82f6" strokeWidth={2} name="$ Net new ARR" />
          <Line type="monotone" dataKey="expansionARR" stroke="#10b981" strokeWidth={2} name="$ Expansion ARR" />
          <Line type="monotone" dataKey="churnARR" stroke="#f59e0b" strokeWidth={2} name="$ Churn ARR" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
