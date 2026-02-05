"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { useMRRData } from "@/lib/hooks/use-api-data"
import { Loader2 } from "lucide-react"

export function MRR2025Chart() {
  const { filters, setPlan } = useFilters()
  const { data, isLoading, error } = useMRRData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })

  // Obtener planes disponibles (sin aplicar filtro de plan)
  const { plans: availablePlans } = useMRRData({ year: filters.year })

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">
        MRR {filters.year}
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[350px] text-red-500">
          Error al cargar los datos
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart 
            data={data?.chartData || []} 
            margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="#e5e7eb" />
            <XAxis 
              dataKey="monthLabel" 
              stroke="#6b7280" 
              tickMargin={10} 
              interval={0} 
              tick={{ fontSize: 12 }} 
              height={40}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{ fontSize: 12 }} 
              tickFormatter={(v) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 0 })}`} 
              width={60} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "White",
                border: "1px solid #e5e7eb",
                borderRadius: "6px"
              }}
              formatter={(value: number) => [`$${value.toLocaleString("en-US")}`, "MRR"]}
            />
            <Legend
              verticalAlign="top"
              height={30}
              iconSize={10}
              wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
            />
            <Line 
              type="monotone" 
              dataKey="mrr" 
              stroke="#09124F" 
              strokeWidth={2} 
              name="$ MRR"
              dot={{ fill: "#09124F", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Solo filtro de plan (tipo de empresa eliminado) */}
      <div className="mt-4">
        <select 
          value={filters.plan}
          onChange={(e) => setPlan(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-medium transition-colors text-muted-foreground"
        >
          <option value="Todos">Todos los planes</option>
          {availablePlans.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
