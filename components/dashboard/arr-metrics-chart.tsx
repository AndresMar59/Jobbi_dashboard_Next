"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"
import { Loader2, AlertCircle } from "lucide-react"

// 1. Interfaz completa para evitar errores de "any" o propiedades faltantes
interface SaasMetricsHistoryResponse {
  success: boolean
  data: Array<{
    period: { date_from: string }
    mrr: { total: number }
    mrr_movements: { 
      new_mrr: number;
      churn_mrr: number;
      expansion_mrr: number;
      contraction_mrr: number;
    }
  }>
}

interface ChartDataPoint {
  mes: string;
  arr: number;
  churnARR: number;
  newARR: number;
  expansionARR: number;
  contractionARR: number;
}

// Fetcher simplificado para el Proxy local
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error al conectar con el servidor');
  return res.json();
})

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function ARRMetricsChart() {
  const { filters } = useFilters()

  // 2. CAMBIO CRÍTICO: Usamos /api/proxy para saltar el bloqueo de CORS
  const { data: response, isLoading, error } = useSWR<SaasMetricsHistoryResponse>(
    `/api/proxy?months=12&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`,
    fetcher,
    {
      revalidateOnFocus: false,
    revalidateOnReconnect: false,      
    revalidateIfStale: false,      
    dedupingInterval: 10000,
    }
  )

  // 3. Mapeo con validación de nulidad para evitar que el gráfico quede vacío
  const combinedData: ChartDataPoint[] = response?.data?.map((item) => {
    const monthPart = item.period?.date_from?.split('-')[1];
    const monthIndex = monthPart ? parseInt(monthPart) - 1 : 0;
    
    return {
      mes: MONTH_LABELS[monthIndex] || "S/N",
      arr: (item.mrr?.total || 0) * 12,
      churnARR: (item.mrr_movements?.churn_mrr || 0) * 12,
      newARR: (item.mrr_movements?.new_mrr || 0) * 12,
      expansionARR: (item.mrr_movements?.expansion_mrr || 0) * 12,
      contractionARR: (item.mrr_movements?.contraction_mrr || 0) * 12,
    }
  }) || []

  const displayData = filters.month === "Todos" 
    ? combinedData 
    : combinedData.filter((d: ChartDataPoint) => d.mes.startsWith(filters.month.substring(0, 4)))

  // 4. Estados de carga y error visuales para depuración rápida
  if (isLoading) return (
    <div className="h-[400px] flex flex-col items-center justify-center border rounded-lg bg-card">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
      <p className="text-sm text-muted-foreground">Calculando ARR...</p>
    </div>
  )

  if (error || response?.success === false) return (
    <div className="h-[400px] flex flex-col items-center justify-center border border-red-100 bg-red-50 rounded-lg p-6 text-center">
      <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
      <h4 className="font-bold text-red-700">Error de Datos</h4>
      <p className="text-xs text-red-600">No se pudo obtener el historial de ARR desde el proxy.</p>
    </div>
  )

  if (displayData.length === 0) return (
    <div className="h-[400px] flex items-center justify-center border border-dashed rounded-lg bg-slate-50 text-slate-500 italic">
      No hay registros de ARR para el año {filters.year}.
    </div>
  )

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-6">ARR ({filters.year})</h3>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 25, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0 0)" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "oklch(0.55 0 0)" }} tickLine={false} axisLine={true} dy={10} />
            <YAxis 
              tick={{ fontSize: 12, fill: "oklch(0.55 0 0)" }} 
              tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}

            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
            />
            <Legend verticalAlign="top" align="left" height={40} iconType="circle" wrapperStyle={{ fontSize: "12px", paddingBottom: "8px", top: 0, right: 10 }}/>
            <Line type="monotone" dataKey="arr" stroke="#3b82f6" name="ARR Total" strokeWidth={2} r={3}  />
            <Line type="monotone" dataKey="contractionARR" stroke="#8e1aa5" name="Contraction" strokeWidth={2} r={3} />
            <Line type="monotone" dataKey="newARR" stroke="#d8734b" name="New ARR" strokeWidth={2} r={3} />
            <Line type="monotone" dataKey="churnARR" stroke="#0d075c" name="Churn ARR" strokeWidth={2} r={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}