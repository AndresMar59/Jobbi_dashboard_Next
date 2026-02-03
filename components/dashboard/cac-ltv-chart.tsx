"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "CAC", value: 6.5 },
  { name: "LTV", value: 25 },
]

export function CACLTVChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">CAC VS LTV</h3>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            tickMargin={10}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="#6b7280"
            width={40}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
            formatter={(value: number) => [`$${value}`, ""]}
          />
          <Bar dataKey="value" fill="#09124F" radius={[4, 4, 0, 0]} barSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
