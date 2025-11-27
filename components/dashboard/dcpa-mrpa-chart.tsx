"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { categoria: "A", conHT: 420, sinHT: 380 },
  { categoria: "B", conHT: 240, sinHT: 230 },
  { categoria: "C", conHT: 420, sinHT: 380 },
  { categoria: "D", conHT: 160, sinHT: 50 },
]

export function DCPAMRPAChart() {
  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">DCPA vs MRPA</h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="categoria"
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
          <Bar dataKey="conHT" fill="#3b82f6" name="con HT" radius={[4, 4, 0, 0]} />
          <Bar dataKey="sinHT" fill="#ef4444" name="sin HT" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
