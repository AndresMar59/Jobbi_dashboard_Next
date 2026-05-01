"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, AlertCircle } from "lucide-react" // Cambié TrendingUp por BarChart3 que encaja mejor con "Sources"
import { useFilters } from "@/lib/contexts/filter-context-posting"
import useSWR from "swr"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error en el proxy');
  return res.json();
})

// Normalizamos la interfaz para el gráfico
interface ChartDataNode {
  name: string;      // El nombre del canal (ej: "LinkedIn", "Other")
  value: number;     // La cantidad de aplicaciones
}

export function Fuentechart() {
  const { filters } = useFilters()
  
  const { data, isLoading, error } = useSWR(
    filters.searchId ? `/api/proxy/Posting?endpoint=${filters.type}&search_id=${filters.searchId}` : null,
    fetcher
  )

  const isCompany = filters.type.includes("company")

  // --- 1. VALIDACIONES DE ESTADO ---
  if (isLoading) {
    return (
      <Card className="w-full h-[350px] flex items-center justify-center bg-card border-border shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Cargando orígenes...</span>
        </div>
      </Card>
    );
  }

  if (error || !data || data?.message?.includes("No data found")) {
    return (
      <Card className="bg-card border border-border shadow-sm w-full h-[350px] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-10 w-10 opacity-20" />
          <p className="text-sm font-medium">No hay datos de canales disponibles</p>
        </div>
      </Card>
    );
  }

  // --- 2. PROCESAMIENTO DE DATOS ---
  let chartData: ChartDataNode[] = [];

  if (isCompany) {
    // Caso Company: Transformamos objeto { "Other": 1, "LinkedIn": 5 } -> Array
    const distribution = data.channel_distribution || {};
    chartData = Object.entries(distribution).map(([key, val]) => ({
      name: key,
      value: Number(val)
    }));
  } else {
    // Caso Posting: Mapeamos array de objetos
    const distribution = data.data?.[0]?.metrics?.candidate_intake_by_source || [];
    chartData = distribution.map((item: any) => ({
      name: item.channel || "Unknown", // Usamos el nombre del canal
      value: item.applications_count || 0    // Usamos el conteo
    }));
  }

  // Ordenar de mayor a menor para que el gráfico se vea organizado
  chartData.sort((a, b) => b.value - a.value);

  // --- 3. RENDER FINAL ---
  return (
    <Card className="bg-card border border-border shadow-sm w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <BarChart3 className="h-4 w-4 text-[#6D28D9]" />
            Distribución por Canales
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Origen de los candidatos por {isCompany ? "empresa" : "vacante"}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10 }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11 }} 
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                formatter={(value: number) => [value, "Candidatos"]}
              />
              <Bar 
                dataKey="value" 
                fill="#6D28D9" 
                radius={[4, 4, 0, 0]} 
                barSize={Math.min(40, 300 / chartData.length)} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}