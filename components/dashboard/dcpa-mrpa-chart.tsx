"use client"

import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"
import { Loader2 } from "lucide-react"


interface ChartDataPoint {
  month: string;
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
  const { data: response, isLoading } = useSWR(
    `/api/proxy?year=${filters.year}&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}`,
    fetcher
  );

  // Procesamos los datos: MRPA será simplemente el MRR Total
  const chartData = response?.data?.map((item: any) => {
    const monthPart = item.period?.date_from?.split('-')[1];
    const monthIndex = monthPart ? parseInt(monthPart) - 1 : 0;
    
    return {
      mes: MONTH_LABELS[monthIndex],
      // DCPA: Lo tomamos de unit_economics o cac si está disponible, 
      // si no, usamos un fallback de los datos de la API
      dcpa: item.unit_economics?.customer_acquisition_cost || 0, 
      // MRPA lo tomamos como el MRR Total directamente
      mrr: item.mrr?.total || 0,
    }
  }) || []

  return (
  /* 1. CAMBIO: Eliminamos 'border' y añadimos una sombra difuminada (shadow-xl o personalizada) */
  <div className="rounded-2xl bg-card p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
    <h3 className="text-lg font-semibold text-card-foreground mb-4">DCPA vs MRR ({filters.year})</h3>

    {isLoading ? (
      <div className="h-[350px] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
        <div className="text-sm text-muted-foreground">Cargando métricas...</div>
      </div>
    ) : (
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 25, left: 0, bottom: 0 }}>
           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0 0)" />
           <XAxis
             dataKey="mes"
             tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
             axisLine={false}
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
             wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
            />
  
            <Line type="monotone" dataKey="mrr" stroke="#16035c" strokeWidth={2} name="Total MRR" r={3}/>

           <Line type="monotone" dataKey="dcpa" stroke="#9205ca" strokeWidth={2} name="Total DCPA" r={3}/>
         </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
)
}