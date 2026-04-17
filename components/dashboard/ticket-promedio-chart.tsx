"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"
import { Loader2, AlertCircle } from "lucide-react"

interface JobbiMetricItem {
  period: { date_from: string }
  other: { ticket_promedio: number }
  external_required: { cac?: number | any } 
}

// Fetcher simplificado: el Proxy ya maneja los headers y el token
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("Error en la red");
  return res.json();
})

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function TicketPromedioChart() {
  const { filters } = useFilters()
  
  // 1. LLAMADA AL PROXY (Evita el error de CORS)
  const { data: response, isLoading, error } = useSWR<{ data: JobbiMetricItem[] }>(
    `/api/proxy?&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`,
    fetcher
  )

  // 2. Mapeo seguro: comprobamos que response.data exista antes de mapear
  const chartData = response?.data?.map((item) => {
    const dateParts = item.period?.date_from?.split('-') || [];
    const monthIndex = dateParts[1] ? parseInt(dateParts[1]) - 1 : 0;
    
    return {
      monthLabel: MONTH_LABELS[monthIndex] || "S/N",
      cac: Number(item.external_required?.cac) || 0, 
      ticketPromedio: item.other?.ticket_promedio || 0,
    }
  }) || []

  // Filtrado
  const displayData = filters.month !== "Todos"
    ? chartData.filter((d) => d.monthLabel.startsWith(filters.month.substring(0, 3)))
    : chartData

  // 3. MANEJO DE ESTADOS (JSX obligatorio para evitar errores de React)
  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6 h-[450px] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Cargando Ticket Promedio...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border border-red-100 p-6 h-[450px] flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-sm text-red-600 font-medium">Error al cargar Ticket Promedio</p>
        <p className="text-xs text-red-400 mt-1">Verifica la conexión a través del proxy.</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">
        Ticket promedio PA ({filters.year})
      </h3>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="monthLabel" 
              stroke="#6b7280" 
              tick={{ fontSize: 12 }} 
              height={40} 
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{ fontSize: 11 }} 
              tickFormatter={(v) => `$${v.toLocaleString()}`}
              width={60}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, ""]}
            />
            <Legend verticalAlign="top" height={40} iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
            
            <Line 
              type="monotone" 
              dataKey="cac" 
              stroke="#09124F" 
              name="CAC $"
              strokeWidth={3} 
              dot={{ r: 4, fill: "white", stroke: "#09124F", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="ticketPromedio"
              stroke="#474194"
              name="Ticket Promedio $"
              strokeWidth={3}
              dot={{ r: 4, fill: "white", stroke: "#474194", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}