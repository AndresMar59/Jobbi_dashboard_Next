"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, AlertCircle } from "lucide-react"
import { useFilters } from "@/lib/contexts/filter-context-posting"
import useSWR from "swr"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error en el proxy');
  return res.json();
})

interface ChartDataNode {
  date: string;
  applications: number;
  fullDate: string;
}

export function TimelineChart() {
  const { filters } = useFilters()
  
  const { data, isLoading, error } = useSWR(
    filters.searchId ? `/api/proxy/Posting?endpoint=${filters.type}&search_id=${filters.searchId}` : null,
    fetcher
  )

  const isCompany = filters.type.includes("summary-company")

  // --- 1. PRIMERO VALIDAMOS CARGA Y ERROR ---
  if (isLoading) {
    return (
      <Card className="w-full h-[350px] flex items-center justify-center bg-card border-border shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Cargando métricas...</span>
        </div>
      </Card>
    );
  }

  if (error || !data || data?.message?.includes("No data found")) {
    return (
      <Card className="bg-card border border-border shadow-sm w-full h-[350px] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-10 w-10 opacity-20" />
          <p className="text-sm font-medium">No hay datos disponibles</p>
        </div>
      </Card>
    );
  }

  // --- 2. SÓLO AQUÍ PROCESAMOS (Porque ya sabemos que 'data' existe) ---
  const rawTimeline = isCompany 
    ? (data.applications_timeline || []) 
    : (data.data?.[0]?.metrics?.applications_timeline || []);

  const chartData = rawTimeline.reduce((acc: ChartDataNode[], current: any) => {
    const dateObj = new Date(current.date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

    const existingDay = acc.find(item => item.date === formattedDate);

    if (existingDay) {
      existingDay.applications += current.applications;
    } else {
      acc.push({
        date: formattedDate,
        applications: current.applications,
        fullDate: current.date
      });
    }
    return acc;
  }, [] as ChartDataNode[]);

  // Ordenar usando tipos explícitos para evitar el error de la imagen image_3cac20.png
  chartData.sort((a: ChartDataNode, b: ChartDataNode) => 
    new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
  );

  // --- 3. RENDER FINAL ---
  return (
    <Card className="bg-card border border-border shadow-sm w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <TrendingUp className="h-4 w-4 text-[#6D28D9]" />
            Timeline de Aplicaciones
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Flujo por {isCompany ? "empresa" : "vacante"}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="applications" fill="#6D28D9" radius={[4, 4, 0, 0]} barSize={chartData.length > 20 ? 12 : 32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}