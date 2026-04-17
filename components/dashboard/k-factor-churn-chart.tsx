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
          <LineChart data={displayData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="mes" 
              stroke="#6b7280" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(v) => Math.floor(v).toString()}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}
              formatter={(value: number) => [value, "Usuarios"]}
            />
            <Legend verticalAlign="top" height={40} iconType="circle" />
            
            <Line 
              type="monotone" 
              dataKey="kFactor" 
              stroke="#09124F" 
              name="Nuevos (K-Factor)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: "white", stroke: "#09124F", strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="churn" 
              stroke="#ef4444" 
              name="Perdidos (Churn)" 
              strokeWidth={2} 
              strokeDasharray="5 5" // Línea punteada para el churn (pérdida)
              dot={{ r: 4, fill: "white", stroke: "#ef4444", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 italic text-center">
        Muestra la relación entre usuarios ganados por viralidad vs. usuarios perdidos en el periodo.
      </p>
    </div>
  )
}