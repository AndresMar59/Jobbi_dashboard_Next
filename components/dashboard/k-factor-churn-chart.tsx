"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { mes: "Ene", kFactor: 20, churn: 20 },
  { mes: "Feb", kFactor: 22, churn: 21 },
  { mes: "Mar", kFactor: 25, churn: 23 },
  { mes: "Abr", kFactor: 27, churn: 25 },
  { mes: "May", kFactor: 30, churn: 25 },
  { mes: "Jun", kFactor: 32, churn: 27 },
  { mes: "Jul", kFactor: 35, churn: 28 },
  { mes: "Ago", kFactor: 38, churn: 30 },
  { mes: "Sep", kFactor: 42, churn: 32 },
  { mes: "Oct", kFactor: 45, churn: 36 },
  { mes: "Nov", kFactor: 46, churn: 40 },
  { mes: "Dic", kFactor: 47, churn: 43 },
]

export function KFactorChurnChart() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground">K-factor vs Churn</h3>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 25, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="mes"
              stroke="#6b7280"
              fontSize={12}
              tickMargin={10}
              interval={0}
              height={40}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis stroke="#6b7280" fontSize={12} width={30} />
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
            <Line type="monotone" dataKey="kFactor" stroke="#09124F" strokeWidth={2} name="Usuarios # K-factor" dot={{ r: 3, fill: "#09124F" }} isAnimationActive={false} />
            <Line type="monotone" dataKey="churn" stroke="#ef4444" strokeWidth={2} name="Usuarios # Churn" dot={{ r: 3, fill: "#ef4444" }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
