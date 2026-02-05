"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { useMRRData, useMRRNewData, useChurnMRRData } from "@/lib/hooks/use-api-data"
import { Loader2 } from "lucide-react"

export function MRR2025Chart() {
  const { filters, setPlan } = useFilters()
  const { chartData: mrrData, isLoading: mrrLoading, error: mrrError } = useMRRData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })
  const { chartData: newMrrData } = useMRRNewData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })
  const { chartData: churnMrrData } = useChurnMRRData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })

  // Obtener planes disponibles
  const { plans: availablePlans } = useMRRData({ year: filters.year })

  // Combinar datos de las tres APIs por mes
  const chartData = (mrrData || []).map((mrrPoint) => {
    // Encontrar los puntos correspondientes en los otros datasets
    const newMrrPoint = newMrrData?.find(
      (p) => p.month === mrrPoint.month
    )
    const churnMrrPoint = churnMrrData?.find(
      (p) => p.month === mrrPoint.month
    )

    // Expansion MRR = New MRR - Churn MRR (crecimiento neto)
    const expansionMRR = Math.max(
      0,
      (newMrrPoint?.newMRR || 0) - (churnMrrPoint?.churnMRR || 0)
    )

    return {
      month: mrrPoint.month,
      monthLabel: mrrPoint.monthLabel,
      mrr: mrrPoint.mrr,
      newMRR: newMrrPoint?.newMRR || 0,
      churnMRR: churnMrrPoint?.churnMRR || 0,
      expansionMRR: expansionMRR,
    }
  })

  const isLoading = mrrLoading

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">
        MRR {filters.year}
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : mrrError ? (
        <div className="flex items-center justify-center h-[350px] text-red-500">
          Error al cargar los datos
        </div>
      ) : (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px"
                }}
                formatter={(value: number) => [`$${value.toLocaleString("en-US")}`, ""]}
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
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="newMRR" 
                stroke="#10b981" 
                strokeWidth={2} 
                name="$ New MRR"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="churnMRR" 
                stroke="#ef4444" 
                strokeWidth={2} 
                name="$ Churn MRR"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="expansionMRR" 
                stroke="#7c3aed" 
                strokeWidth={2} 
                name="$ Expansion MRR"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

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
