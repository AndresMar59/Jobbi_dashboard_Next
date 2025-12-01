"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { mes: "Ene", newMRR: 1200, netNewMRR: 1100, expansionMRR: 800, churnMRR: 300 },
  { mes: "Feb", newMRR: 1400, netNewMRR: 1250, expansionMRR: 850, churnMRR: 350 },
  { mes: "Mar", newMRR: 1600, netNewMRR: 1400, expansionMRR: 900, churnMRR: 400 },
  { mes: "Abr", newMRR: 1800, netNewMRR: 1550, expansionMRR: 950, churnMRR: 450 },
  { mes: "May", newMRR: 2000, netNewMRR: 1700, expansionMRR: 1000, churnMRR: 500 },
  { mes: "Jun", newMRR: 2200, netNewMRR: 1850, expansionMRR: 1050, churnMRR: 550 },
  { mes: "Jul", newMRR: 2400, netNewMRR: 2000, expansionMRR: 1100, churnMRR: 600 },
  { mes: "Ago", newMRR: 2600, netNewMRR: 2150, expansionMRR: 1150, churnMRR: 650 },
  { mes: "Sep", newMRR: 2800, netNewMRR: 2300, expansionMRR: 1200, churnMRR: 700 },
  { mes: "Oct", newMRR: 3000, netNewMRR: 2450, expansionMRR: 1250, churnMRR: 750 },
  { mes: "Nov", newMRR: 3200, netNewMRR: 2600, expansionMRR: 1300, churnMRR: 800 },
  { mes: "Dic", newMRR: 3400, netNewMRR: 2750, expansionMRR: 1350, churnMRR: 850 },
]

export function MRR2025Chart() {
  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">MRR 2025</h3>

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
          <Line type="monotone" dataKey="newMRR" stroke="#09124F" strokeWidth={2} name="$ New MRR" dot={{ r: 3 }} />
          <Line
            type="monotone"
            dataKey="netNewMRR"
            stroke="#ef4444"
            strokeWidth={2}
            name="$ Net new MRR"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="expansionMRR"
            stroke="#10b981"
            strokeWidth={2}
            name="$ Expansion MRR"
            dot={{ r: 3 }}
          />
          <Line type="monotone" dataKey="churnMRR" stroke="#f59e0b" strokeWidth={2} name="$ Churn MRR" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
