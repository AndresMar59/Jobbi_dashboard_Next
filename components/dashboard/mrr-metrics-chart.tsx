"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"
import { Loader2, AlertTriangle } from "lucide-react"

interface SaasMetricsHistoryResponse {
  success: boolean;
  data: Array<{
    period: { date_from: string };
    mrr: { total: number  };
    mrr_movements: {
        net_mrr: number,
        new_mrr: number,
        churn_mrr: number,
        expansion_mrr: number,
        contraction_mrr: number
      };
  }>;
}

interface ChartDataPoint {
  mes: string;
  mrr: number;
  churnMRR: number;
  expansionMRR: number;
  newMRR: number;
}



const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) {
    throw new Error(res.status === 404 ? "Ruta /api/proxy no encontrada (404)" : "Error en el servidor");
  }
  return res.json();
})

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function MRRDATA() {
  const { filters } = useFilters()
  
  const { data: response, error, isLoading } = useSWR<SaasMetricsHistoryResponse>(
    `/api/proxy?months=12&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`,
    fetcher,
    {
      revalidateOnFocus: false,
    revalidateOnReconnect: false,      
    revalidateIfStale: false,      
    dedupingInterval: 10000,
    }
  );  

  // MAPEO CORREGIDO: Nombres de llaves idénticos a los del gráfico
  const chartData: ChartDataPoint[] = response?.data?.map((item) => {
      const monthPart = item.period?.date_from?.split('-')[1]; 
      const monthIndex = monthPart ? parseInt(monthPart) - 1 : 0;
      return {
        mes: MONTH_LABELS[monthIndex] || "S/N",
        mrr: item.mrr?.total ?? 0,
        churnMRR: Math.abs(item.mrr_movements?.churn_mrr ?? 0), // Math.abs por si vienen negativos
        expansionMRR: item.mrr_movements?.expansion_mrr ?? 0,
        newMRR: item.mrr_movements?.new_mrr ?? 0
      }
    }) || []

     const displayData = filters.month === "Todos" 
    ? chartData 
    : chartData.filter((d: ChartDataPoint) => d.mes.startsWith(filters.month.substring(0, 4)))



  
    if (isLoading) return (
      <div className="h-[400px] flex flex-col items-center justify-center border rounded-lg bg-card shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
        <span className="text-sm text-muted-foreground">Cargando métricas de MRR...</span>
      </div>
    )
  
    if (error) return (
      <div className="h-[400px] flex flex-col items-center justify-center border border-red-200 bg-red-50 rounded-lg p-4 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <h4 className="font-bold text-red-800 text-sm">Error de Conexión</h4>
        <code className="text-[10px] bg-white p-2 border rounded mt-2 text-red-600 block max-w-full overflow-auto font-mono">
          {error.message}
        </code>
      </div>
    )
  
    if (displayData.length === 0) return (
      <div className="h-[400px] flex items-center justify-center border border-dashed rounded-lg text-muted-foreground italic">
        No hay datos de MRR para el periodo {filters.year}.
      </div>
    )

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">MRR ({filters.year})</h3>
      </div>
      
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 25, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0 0)" />
            <XAxis
              dataKey="mes" // CORREGIDO: Ahora coincide con el mapeo
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
                return `$${v}`
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(1 0 0)",
                border: "1px solid oklch(0.92 0 0)",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
            />
            <Legend
              verticalAlign="top"
              align="left"
              height={40}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", paddingBottom: "8px", top: 0, right: 10 }}
            />
            {/* LÍNEAS CON DATA KEYS CORREGIDOS */}
            <Line type="monotone" dataKey="mrr" stroke="#1478a0" strokeWidth={2} name="Total MRR" r={3}   />
            <Line type="monotone" dataKey="newMRR" stroke="#ee1141" strokeWidth={2} name="New MRR" r={3} />
            <Line type="monotone" dataKey="expansionMRR" stroke="#4a048b" strokeWidth={2} name="Expansion MRR" r={3} />
            <Line type="monotone" dataKey="churnMRR" stroke="#b66ce7" strokeWidth={2} name="Churn MRR" r={3}  />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}