"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { useKFactorData, useChurnedUsersData, MONTH_LABELS } from "@/lib/hooks/use-api-data"
import { ALL_MONTHS } from "@/lib/api/metrics"
import { Loader2 } from "lucide-react"

export function KFactorChurnChart() {
  const { filters } = useFilters()

  // Obtener K-Factor data
  const { chartData: kFactorData, isLoading: loadingKFactor } = useKFactorData({
    year: filters.year,
    month: "Todos",
    plan: filters.plan,
  })

  // Obtener datos de usuarios churned
  const { chartData: churnedUsersData, isLoading: loadingChurn } = useChurnedUsersData({
    year: filters.year,
    month: "Todos",
    plan: filters.plan,
  })

  const isLoading = loadingKFactor || loadingChurn

  // Combinar datos de K-Factor y Churn Users
  const combinedData = ALL_MONTHS.map(m => {
    const label = MONTH_LABELS[m]
    const kFactorEntry = kFactorData.find(d => d.monthLabel === label)
    const churnEntry = churnedUsersData.find(d => d.monthLabel === label)

    return {
      mes: label,
      kFactor: kFactorEntry?.kFactor || 0,
      churn: churnEntry?.churned || 0, // Usar datos reales de usuarios churned
    }
  }).filter(d => filters.month === "Todos" || d.mes === filters.month)

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm w-full">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">K-factor vs Churn</h3>

      {isLoading ? (
        <div className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 25, right: 20, left: 10, bottom: 5 }}>
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
              <Line type="monotone" dataKey="churn" stroke="#ef4444" strokeWidth={2} name="Usuarios # Churn" dot={{ r: 4, fill: "white", stroke: "#ef4444", strokeWidth: 2 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="kFactor" stroke="#09124F" strokeWidth={2} name="Usuarios # K-factor" dot={{ r: 4, fill: "white", stroke: "#09124F", strokeWidth: 2 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
