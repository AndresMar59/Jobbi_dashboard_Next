"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"
import { Loader2, AlertCircle } from "lucide-react"

interface ChartDataPoint {
  mes: string;
  churn: number;
  kFactor: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function KFactorChurnChart() {
  const { filters } = useFilters()

  // Usamos el Proxy centralizado (una sola llamada, datos consistentes)
  const { data: response, error, isLoading } = useSWR(
    `/api/proxy?&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`,
    fetcher
  )

  const chartData: ChartDataPoint[] = response?.data?.map((item: any) => {
    const monthPart = item.period?.date_from?.split('-')[1]
    const monthIndex = monthPart ? parseInt(monthPart) - 1 : 0

    return {
      mes: MONTH_LABELS[monthIndex],
      // Usuarios que se fueron (Churn)
      churn: item.accounts?.churned || 0,
      // Usuarios ganados por K-Factor (Viralidad/Referidos)
      // Si el campo se llama distinto en external_metrics, ajústalo aquí
      kFactor: item.external_required?.k_factor ||  0,
    }
  }) || []

  const displayData = filters.month === "Todos" 
    ? chartData 
    : chartData.filter((d: ChartDataPoint) => d.mes === filters.month.substring(0, 3))

  if (isLoading) return (
    <div className="flex items-center justify-center h-[400px] border rounded-lg bg-card">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[400px] border border-red-100 bg-red-50 rounded-lg text-red-500">
      <AlertCircle className="h-8 w-8 mb-2" />
      <span className="text-sm font-medium">Error al cargar métricas de crecimiento</span>
    </div>
  )

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Crecimiento Viral vs Churn (Usuarios)</h3>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 25, left:-10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="mes" 
              tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
              tickLine={false} 
              axisLine={true} 
              dy={10}
            />
            <YAxis 
              tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
              axisLine={true} 
              tickLine={true} 
              tickFormatter={(v) => Math.floor(v).toString()}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "oklch(1 0 0)",
                border: "1px solid oklch(0.92 0 0)",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
              formatter={(value: number) => [value, "Usuarios"]}
            />
            <Legend verticalAlign="top"
              align="left"
              height={40}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", paddingBottom: "8px", top: 0, right: 10 }}/>
            
            <Line 
              type="monotone" 
              dataKey="kFactor" 
              stroke="#09124F" 
              name="Nuevos (K-Factor)" 
              strokeWidth={2}
              r = {3} 
            />
            <Line 
              type="monotone" 
              dataKey="churn" 
              stroke="#ef4444" 
              name="Perdidos (Churn)" 
              strokeWidth={2} 
              r = {3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}