"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"
import { Loader2, AlertCircle } from "lucide-react"
import { Percent } from "recharts/types/util/types"

interface SaasMetricsHistoryResponse {
  success: boolean;
  data: Array<{
    period: { date_from: string };
    accounts: { active: number };
    rates: { 
        gross_churn_rate: number,
        net_revenue_churn: number,        
        revenue_expansion_rate: number };
  }>;
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("Error en el proxy");
  return res.json();
})

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function DollarChurnChart() {
  const { filters } = useFilters()

  // Usamos el proxy para obtener el historial completo
  const { data: response, error, isLoading } = useSWR<SaasMetricsHistoryResponse>(
    `/api/proxy?&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`,
    fetcher
  )

    const chartData = response?.data?.map((item) => {
    const monthPart = item.period?.date_from?.split('-')[1]; 
    const monthIndex = monthPart ? parseInt(monthPart) - 1 : 0;
    return {
      monthLabel: MONTH_LABELS[monthIndex] || "S/N",
      churn_rate: item.rates?.gross_churn_rate ?? 0,
      net_revenue_churn: item.rates?.net_revenue_churn?? 0,
      revenue_expansion_rate: item.rates?.revenue_expansion_rate ?? 0,
    }
  }) || []

  if (isLoading) return (
    <div className="flex items-center justify-center h-[400px] border rounded-lg bg-card">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[400px] border border-red-100 bg-red-50 rounded-lg text-red-500">
      <AlertCircle className="h-8 w-8 mb-2" />
      <span className="text-sm font-medium">Error al cargar métricas de Churn</span>
    </div>
  )

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Dollar Churn ({filters.year})</h3>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 25, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="monthLabel" // CORREGIDO: Ahora coincide con el mapeo
              tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
              axisLine={true}
              tickFormatter={(v) => `${v}%`} 
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(1 0 0)",
                border: "1px solid oklch(0.92 0 0)",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, undefined]}
            />
            <Legend verticalAlign="top" align="left" height={40} iconType="circle" wrapperStyle={{ fontSize: "12px", paddingBottom: "10px"  }} />
            
            <Line 
              type="monotone" 
              dataKey="revenue_expansion_rate" 
              stroke="#063aac" 
              name="% Expansion" 
              strokeWidth={2} 
              dot={{ r: 3 }} 
            />
            <Line 
              type="monotone" 
              dataKey="churn_rate" 
              stroke="#ef4444" 
              name="% Gross Churn" 
              strokeWidth={2} 
              dot={{ r: 3 }} 
            />
            <Line 
              type="monotone" 
              dataKey="net_revenue_churn" 
              stroke="#010c1f" 
              name="% Net Churn" 
              strokeWidth={2} 
              dot={{ r: 3 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}