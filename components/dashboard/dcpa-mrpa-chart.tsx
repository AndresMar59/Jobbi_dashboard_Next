"use client"

import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"
import { Loader2 } from "lucide-react"


interface SasMetrics {
  success: boolean
  data: Array<{
    period: { date_from: string }
    mrr: { total: number }
    external_required: { 
      dcpa: number;
    }
  }>
}


interface ChartDataPoint {
  mes: string;
  dcpa: number;
  mrr: number;
}

// Usamos el mismo fetcher que ya te funcionó
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("Error en el proxy");
  return res.json();
});

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function DCPAMRPAChart() {
  const { filters } = useFilters()

  // Traemos el historial completo del año para tener MRR y DCPA (Unit Economics)
  const { data: response, isLoading, error } = useSWR<SasMetrics>(
    `/api/proxy?months=12&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`,
    fetcher
  )

  // Procesamos los datos: MRPA será simplemente el MRR Total
  const chartData: ChartDataPoint[] = response?.data?.map((item) => {
    const monthPart = item.period?.date_from?.split('-')[1];
    const monthIndex = monthPart ? parseInt(monthPart) - 1 : 0;
    
    return {
      mes: MONTH_LABELS[monthIndex],
      // DCPA: Lo tomamos de unit_economics o cac si está disponible, 
      // si no, usamos un fallback de los datos de la API
      dcpa: item.external_required?.dcpa || 0, 
      // MRPA lo tomamos como el MRR Total directamente
      mrr: item.mrr?.total || 0,
    }
  }) || []

    const displayData = filters.month === "Todos" 
    ? chartData 
    : chartData.filter((d: ChartDataPoint) => d.mes.startsWith(filters.month.substring(0, 4)))

  return (
  /* 1. CAMBIO: Eliminamos 'border' y añadimos una sombra difuminada (shadow-xl o personalizada) */
  <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
    <div className="mb-6">
     <h3 className="text-lg font-semibold text-card-foreground">DCPA vs MRR ({filters.year})</h3>
    </div>
    
    {isLoading ? (
      <div className="h-[350px] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
        <div className="text-sm text-muted-foreground">Cargando métricas...</div>
      </div>
    ) : (
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 25, left: -10, bottom: 0 }}>
           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0 0)" />
           <XAxis
             dataKey="mes"
             tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
             axisLine={true}
             tickLine={false}
             dy={10}
            />

            <YAxis
             tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
             axisLine={true}
             tickFormatter={(v) => {
             if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
             if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`
             return `$${v}` }}
            />

            <Tooltip
              contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.92 0 0)",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)"}}
              formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
            />

            <Legend 
             verticalAlign="top" 
             align="left" 
             height={40} 
             iconType="circle"
             wrapperStyle={{ paddingBottom: '8px', fontSize: '12px', top: 0, right: 10 }}
            />
  
            <Line type="monotone" dataKey="mrr" stroke="#16035c" strokeWidth={2} name="MRR" r={3}/>

           <Line type="monotone" dataKey="dcpa" stroke="#9205ca" strokeWidth={2} name="DCPA" r={3}/>
         </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
)
}