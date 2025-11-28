"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { mes: "Ene", cac: 5, ltv: 12, ratio: 2.4 },
  { mes: "Feb", cac: 6, ltv: 14, ratio: 2.3 },
  { mes: "Mar", cac: 5.5, ltv: 15, ratio: 2.7 },
  { mes: "Abr", cac: 7, ltv: 16, ratio: 2.3 },
  { mes: "May", cac: 6.5, ltv: 18, ratio: 2.8 },
  { mes: "Jun", cac: 6, ltv: 19, ratio: 3.2 },
  { mes: "Jul", cac: 7, ltv: 20, ratio: 2.9 },
  { mes: "Ago", cac: 6.8, ltv: 21, ratio: 3.1 },
  { mes: "Sep", cac: 6.2, ltv: 22, ratio: 3.5 },
  { mes: "Oct", cac: 7.5, ltv: 23, ratio: 3.1 },
  { mes: "Nov", cac: 7, ltv: 24, ratio: 3.4 },
  { mes: "Dic", cac: 6.5, ltv: 25, ratio: 3.8 },
]

export function CACLTVChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">CAC VS LTV</h3>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 40, right: 20, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
          <XAxis dataKey="mes" tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }} tickMargin={10} interval={0} />
          <YAxis tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.92 0 0)",
              borderRadius: "0.5rem",
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
          />
          <Line type="monotone" dataKey="cac" stroke="#3b82f6" strokeWidth={2} name="CAC $" />
          <Line type="monotone" dataKey="ltv" stroke="#10b981" strokeWidth={2} name="LTV $" />
          <Line type="monotone" dataKey="ratio" stroke="#ef4444" strokeWidth={2} name="LTV/CAC RATIO" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
