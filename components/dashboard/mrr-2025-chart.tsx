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
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">MRR 2026</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="#e5e7eb" />
          <XAxis dataKey="mes" stroke="#6b7280" tickMargin={10} interval={0} tick={{ fontSize: 12 }} height={40}
          padding={{ left: 20, right: 20 }}/>
          <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={(v) =>
    `$${v.toLocaleString("en-US", { minimumFractionDigits: 0 })}`} width={40} />

          <Tooltip
            contentStyle={{
              backgroundColor: "White",
              border: "1px solid #e5e7eb",
              borderRadius: "6px"}}
          />
          <Legend
            verticalAlign="top"
            height={30}
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
          />
          <Line type="monotone" dataKey="newMRR" stroke="#09124F" strokeWidth={2} name="$ New MRR"  />
          <Line
            type="monotone"
            dataKey="netNewMRR"
            stroke="#8b13a8ff"
            strokeWidth={2}
            name="$ Net new MRR"

          />
          <Line
            type="monotone"
            dataKey="expansionMRR"
            stroke="#10b981"
            strokeWidth={2}
            name="$ Expansion MRR"

          />
          <Line type="monotone" dataKey="churnMRR" stroke="#232db9ff" strokeWidth={2} name="$ Churn MRR"  />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        <select className="w-full h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-medium transition-colors text-muted-foreground">
          <option>Tipo de empresa</option>
          <option>Enterprise</option>
          <option>SMB</option>
          <option>Startup</option>
        </select>
        <select className="w-full h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-medium transition-colors text-muted-foreground">
          <option>Tipo de plan</option>
          <option>Básico</option>
          <option>Pro</option>
          <option>Enterprise</option>
        </select>
      </div>
    </div>
  )
}
