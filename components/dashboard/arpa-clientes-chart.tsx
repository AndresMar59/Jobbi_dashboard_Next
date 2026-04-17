"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"
import { Loader2, AlertTriangle } from "lucide-react"

interface SaasMetricsHistoryResponse {
  success: boolean;
  data: Array<{
    period: { date_from: string };
    accounts: { active: number };
    rates: { arpa: number };
  }>;
}

interface ChartDataPoint {
  monthLabel: string;
  arpa: number;
  clientesActivos: number;
}


// El fetcher para el proxy local no necesita el API Key aquí, 
// ya que el proxy la inyectará en el servidor.
const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) {
    const txt = await res.text();
    // Si recibes un HTML (error 404), esto atrapará el error de JSON
    throw new Error(res.status === 404 ? "Ruta /api/proxy no encontrada (404)" : "Error en el servidor");
  }
  return res.json();
})

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function ARPAClientesChart() {
  const { filters } = useFilters()
  
  // CORRECCIÓN: Agregamos isLoading de nuevo
  const { data: response, error, isLoading } = useSWR<SaasMetricsHistoryResponse>(
    `/api/proxy?&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`,
    fetcher
  );        

  const chartData = response?.data?.map((item) => {
    const monthPart = item.period?.date_from?.split('-')[1]; 
    const monthIndex = monthPart ? parseInt(monthPart) - 1 : 0;
    return {
      monthLabel: MONTH_LABELS[monthIndex] || "S/N",
      arpa: item.rates?.arpa ?? 0,
      clientesActivos: item.accounts?.active ?? 0,
    }
  }) || []


    const displayData = filters.month === "Todos" 
    ? chartData 
    : chartData.filter((d: ChartDataPoint) => d.monthLabel.startsWith(filters.month.substring(0, 4)))

  if (isLoading) return (
    <div className="h-[350px] flex items-center justify-center border rounded-lg bg-card">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  )

  if (error) return (
    <div className="h-[350px] flex flex-col items-center justify-center border border-red-200 bg-red-50 rounded-lg p-4 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
      <h4 className="font-bold text-red-800">Error en el Gráfico:</h4>
      <code className="text-[10px] bg-white p-2 border rounded mt-2 text-red-600 block max-w-full overflow-auto">
        {error.message}
      </code>
      <p className="text-[10px] mt-4 text-red-400">Si ves "404", revisa que exista /app/api/proxy/route.ts</p>
    </div>
  )

  if (!isLoading && chartData.length === 0) return (
    <div className="h-[350px] flex items-center justify-center border border-dashed rounded-lg text-muted-foreground">
      No hay datos históricos para {filters.year}.
    </div>
  )

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">ARPA vs Clientes ({filters.year})</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="monthLabel" fontSize={12} />
            <YAxis yAxisId="left" fontSize={12} tickFormatter={(v) => `$${v}`} />
            <YAxis yAxisId="right" orientation="right" fontSize={12} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="arpa" name="ARPA" stroke="#dc2626" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="clientesActivos" name="Clientes" stroke="#1e3a8a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}