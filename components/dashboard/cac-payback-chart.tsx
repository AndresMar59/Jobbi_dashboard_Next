"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"
import { Loader2, AlertCircle } from "lucide-react"

// Mismo fetcher centralizado
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("Error en el proxy");
  return res.json();
})

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function CACPaybackChart() {
  const { filters } = useFilters()

  // Llamada al proxy con los filtros globales
  const { data: response, error, isLoading } = useSWR(
    `/api/proxy?year=${filters.year}&include_payroll=${filters.IncludePayroll}`,
    fetcher
  )

  // Mapeo de datos desde unit_economics
  const chartData = response?.data?.map((item: any) => {
    const monthPart = item.period?.date_from?.split('-')[1];
    const monthIndex = monthPart ? parseInt(monthPart) - 1 : 0;
    
    return {
      mes: MONTH_LABELS[monthIndex],
      // La API suele devolver cac_payback_months o similar
      // Si no existe, usamos customer_acquisition_cost / arpu como fallback
      payback: item.external_required?.cac_payback || 
               (item.external_required?.cac / item.rates?.arpa) || 0
    }
  }) || []

  // El filtrado por mes: si es "Todos" muestra la línea, si no, filtra el array
  const displayData = filters.month === "Todos" 
    ? chartData 
    : chartData.filter((d: any) => d.mes === filters.month.substring(0, 3));

  if (isLoading) return (
    <div className="h-[400px] flex items-center justify-center border rounded-lg bg-card">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  )

  if (error) return (
    <div className="h-[400px] flex flex-col items-center justify-center border border-red-100 bg-red-50 rounded-lg text-red-500">
      <AlertCircle className="h-8 w-8 mb-2" />
      <span className="text-sm font-medium">Error al cargar CAC Payback</span>
    </div>
  )

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">CAC Payback (Meses)</h3>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
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
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value.toFixed(1)} meses`, "Tiempo de recuperación"]}
            />
            <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
            
            <Line 
              type="monotone" 
              dataKey="payback" 
              stroke="#710cac" 
              name="CAC Payback" 
              strokeWidth={3} 
              dot={{ r: 4, fill: "white", stroke: "#710cac", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}