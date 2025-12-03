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
  <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
    
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

    {/* Eje X */}
    <XAxis
      dataKey="mes"
      stroke="#6b7280"
      tickMargin={10}
      padding={{ left: 20, right: 20 }}
      interval={0}
      height={40}
      tick={{ fontSize: 12 }}
    />

    {/* EJE IZQUIERDO ($): CAC + LTV */}
    <YAxis
      yAxisId="money"
      stroke="#6b7280"
      width={30}
      tick={{ fontSize: 12 }}
tickFormatter={(v) => {
  if (Math.abs(v) >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
  if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`
  return `$${v}`
}}    />

    {/* EJE DERECHO (RATIO): LTV/CAC */}
    <YAxis
      yAxisId="ratio"
      orientation="right"
      stroke="#6b7280 "
      width={30}
      tick={{ fontSize: 12 }}
      strokeDasharray="4 4"
  tickFormatter={(v) => `${v.toFixed(1)}%`}
    />

    {/* Tooltip */}
    <Tooltip
      contentStyle={{
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
      }}
    />

    {/* Leyenda */}
    <Legend verticalAlign="top" height={30} iconSize={10} wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
/>

    {/* LÍNEAS */}
    <Line yAxisId="money" type="monotone" dataKey="cac" stroke="#09124F" strokeWidth={2} name="CAC $" />
    <Line yAxisId="money" type="monotone" dataKey="ltv" stroke="#3330f3ff" strokeWidth={2} name="LTV $" />
    <Line yAxisId="ratio" type="monotone" dataKey="ratio" stroke="#6f06acff" strokeWidth={2} name="LTV/CAC Ratio %" />
  
  </LineChart>
</ResponsiveContainer>
    </div>
  )
}
