"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { mes: "Ene", newDinero: 12000, netNewARR: 8500, expansionARR: 2500, churnARR: 1500 },
  { mes: "Feb", newDinero: 15000, netNewARR: 10000, expansionARR: 3000, churnARR: 2000 },
  { mes: "Mar", newDinero: 13000, netNewARR: 9000, expansionARR: 2800, churnARR: 1800 },
  { mes: "Abr", newDinero: 18000, netNewARR: 12000, expansionARR: 3500, churnARR: 2500 },
  { mes: "May", newDinero: 16000, netNewARR: 11000, expansionARR: 3200, churnARR: 2200 },
  { mes: "Jun", newDinero: 20000, netNewARR: 14000, expansionARR: 4000, churnARR: 3000 },
]

export function MVPMultiLineBarChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Bar chart</h3>
        <div className="text-xs text-muted-foreground mt-2 space-y-1">
          <p>Eje x: meses</p>
          <p>Eje Y1: $ New dinero en ventas</p>
          <p>Eje Y2: $ Net new ARR</p>
          <p>Eje Y3: $ Expansion ARR</p>
          <p>Eje 4: $ Churn ARR</p>
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
          <Legend />
          <Bar dataKey="newDinero" fill="#10b981" name="New Dinero" />
          <Bar dataKey="netNewARR" fill="#3b82f6" name="Net New ARR" />
          <Bar dataKey="expansionARR" fill="#06b6d4" name="Expansion ARR" />
          <Bar dataKey="churnARR" fill="#ef4444" name="Churn ARR" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
