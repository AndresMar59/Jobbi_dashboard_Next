"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { mes: "Ene", grr: 5, nrr: 6, retencion: 5 },
  { mes: "Feb", grr: 4, nrr: 5, retencion: 6 },
  { mes: "Mar", grr: 5, nrr: 7, retencion: 7 },
  { mes: "Abr", grr: 6, nrr: 6, retencion: 5 },
  { mes: "May", grr: 7, nrr: 8, retencion: 3 },
  { mes: "Jun", grr: 8, nrr: 9, retencion: 4 },
  { mes: "Jul", grr: 9, nrr: 10, retencion: 5 },
  { mes: "Ago", grr: 10, nrr: 11, retencion: 6 },
  { mes: "Sep", grr: 12, nrr: 12, retencion: 5 },
  { mes: "Oct", grr: 13, nrr: 14, retencion: 6 },
  { mes: "Nov", grr: 14, nrr: 16, retencion: 6 },
  { mes: "Dic", grr: 15, nrr: 18, retencion: 6 },
]

export function NRRGRRChart() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">NRR vs GRR</h3>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 5, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mes" stroke="#6b7280" padding={{ left: 20, right: 20 }} fontSize={12} tickMargin={10} interval={0} height={40}/>
            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${value}%`} width={40} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
            />
            <Legend
              verticalAlign="top"
              height={30}
              iconSize={10}
              wrapperStyle={{
                fontSize: "12px",
                paddingBottom: "10px",
              }}
            />
            <Line
              type="monotone"
              dataKey="grr"
              stroke="#09124F"
              strokeWidth={2}
              dot={{ fill: "white", r: 4, stroke: "#09124F", strokeWidth: 2 }}
              name="GRR %"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="nrr"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "white", r: 4, stroke: "#10b981", strokeWidth: 2 }}
              name="NRR %"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="retencion"
              stroke="#6b018bff"
              strokeWidth={2}
              dot={{ fill: "white", r: 4, stroke: "#6b018bff", strokeWidth: 2 }}
              name="% Retención"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
