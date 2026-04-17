"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"
import { Loader2, AlertCircle } from "lucide-react"

// Interface para evitar errores de tipo en el map/filter
interface ChartDataPoint {
  mes: string;
  grr: number;
  nrr: number;
  retencion: number;
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("Error en el proxy");
  return res.json();
})

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function NRRGRRChart() {
  const { filters } = useFilters()

  // Una sola llamada para traer todas las métricas de retención
  const { data: response, error, isLoading } = useSWR(
    `/api/proxy?&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`,
    fetcher
  )

  // Mapeamos los datos usando los campos que ya vienen calculados en la API
  const chartData: ChartDataPoint[] = response?.data?.map((item: any) => {
    const monthPart = item.period?.date_from?.split('-')[1];
    const monthIndex = monthPart ? parseInt(monthPart) - 1 : 0;

    return {
      mes: MONTH_LABELS[monthIndex] || "S/N",
      // Usamos los campos del objeto 'rates' de tu API
      grr: item.rates?.grr ?? 0,
      nrr: item.rates?.nrr ?? 0,
      retencion: item.rates?.retention_rate ?? 0,
    }
  }) || []

  // Filtrado por mes (compara las primeras 3 letras)
  const displayData = filters.month === "Todos" 
    ? chartData 
    : chartData.filter((d: ChartDataPoint) => d.mes === filters.month.substring(0, 3));

  if (isLoading) return (
    <div className="h-[400px] flex items-center justify-center border rounded-lg bg-card shadow-sm">
      <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
    </div>
  )

  if (error) return (
    <div className="h-[400px] flex flex-col items-center justify-center border border-red-100 bg-red-50 rounded-lg text-red-500">
      <AlertCircle className="h-8 w-8 mb-2" />
      <span className="text-sm font-medium">Error al cargar métricas de retención</span>
    </div>
  )

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">NRR vs GRR (%)</h3>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 10, right: 20, left: 5, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="mes" 
              stroke="#6b7280" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#0f141f" 
              fontSize={12} 
              tickFormatter={(v) => `${v}%`} 
              width={40}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, undefined]}
            />
            <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
            
            <Line
              type="monotone"
              dataKey="grr"
              stroke="#09124F"
              name="GRR (Neto)"
              strokeWidth={2}
              dot={{ fill: "white", r: 4, stroke: "#09124F", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="nrr"
              stroke="#10b981"
              name="NRR (Con Expansión)"
              strokeWidth={2}
              dot={{ fill: "white", r: 4, stroke: "#10b981", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="retencion"
              stroke="#6b018b"
              name="Retención Logo"
              strokeWidth={2}
              dot={{ fill: "white", r: 4, stroke: "#6b018b", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}