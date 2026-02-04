"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useARPUData } from "@/lib/hooks/use-arpu-data"
import { useFilters } from "@/lib/contexts/filters-context"

export function ARPAClientesChart() {
  const { filters, setPlan } = useFilters()
  const { chartData, plans, isLoading, error } = useARPUData({ 
    year: filters.year, 
    plan: filters.plan 
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">ARPU Mensual</h3>
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          Cargando datos...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">ARPU Mensual</h3>
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          Error al cargar datos
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">ARPU Mensual</h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="monthLabel" 
            stroke="#6b7280" 
            tickMargin={10} 
            tick={{ fontSize: 12 }} 
            height={40} 
          />
          <YAxis 
            stroke="#6b7280" 
            tick={{ fontSize: 12 }} 
            tickFormatter={(v) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 0 })}`}  
            width={50}
          />
          <Legend
            verticalAlign="top"
            height={30}
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "ARPU"]}
          />
          <Bar 
            dataKey="arpu" 
            name="ARPU $"
            fill="#09124F"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        <select 
          className="w-full h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-medium transition-colors text-muted-foreground"
          value={filters.plan}
          onChange={(e) => setPlan(e.target.value)}
        >
          <option value="Todos">Todos los planes</option>
          {plans.map((plan) => (
            <option key={plan} value={plan}>{plan}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
