"use client"

import { Card, CardContent } from "@/components/ui/card"
import { UserCheck, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error en el proxy');
  return res.json();
})

export function TasaRetencionKPICard() {
  const { filters } = useFilters()

  // Usamos el mismo proxy que el ARPA para traer el historial de 12 meses
  const { data: response, isLoading, error } = useSWR(
    `/api/proxy?months=12&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`, 
    fetcher,
    {
      revalidateOnFocus: false,
    revalidateOnReconnect: false,      
    revalidateIfStale: false,      
    dedupingInterval: 10000,
    }
  )

  const getRetentionMetrics = () => {
    const history = response?.data || []
    if (history.length === 0) return { current: 0, percent: 0 }

    // 1. Encontrar el índice del mes seleccionado
    let currentIndex = history.length - 1
    
    if (filters.month !== "Todos") {
      const foundIndex = history.findIndex((item: any) => {
        const m = new Date(item.period.date_from).getUTCMonth()
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        return monthNames[m] === filters.month
      })
      if (foundIndex !== -1) currentIndex = foundIndex
    }

    // 2. Extraer Tasas de Retención (ajusta 'retention_rate' según el nombre exacto en tu JSON)
    // Normalmente en ChartMogul/Jobbi está dentro de 'rates'
    const currentRate = history[currentIndex]?.rates?.retention_rate || 0
    const previousRate = currentIndex > 0 ? history[currentIndex - 1]?.rates?.retention_rate : 0

    // 3. Calcular variación porcentual (Trend)
    let percentChange = 0
    if (previousRate > 0) {
      percentChange = ((currentRate - previousRate) / previousRate) * 100
    }

    return {
      current: currentRate,
      percent: percentChange
    }
  }

  // Desestructuración segura para evitar errores de TypeScript (como el de la imagen)
  const { current: currentRate, percent: percentChange = 0 } = getRetentionMetrics()
  const isPositive = percentChange >= 0

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-red-100 shadow-sm p-4 flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="h-5 w-5 mb-1" />
        <span className="text-[10px] font-bold uppercase">Error de Conexión</span>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-medium">Tasa de Retención</span>
          <div className="p-2 rounded-lg bg-muted">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="text-2xl font-bold text-foreground mb-1">
          {currentRate.toFixed(1)}%
        </div>

        {/* Indicador de tendencia idéntico al ARPA */}
        <div className={`flex items-center text-xs ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
          {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          <span>
            {isPositive ? "+" : ""}{percentChange.toFixed(1)}% vs anterior
          </span>
        </div>
      </CardContent>
    </Card>
  )
}