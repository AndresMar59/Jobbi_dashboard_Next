"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error en el proxy');
  return res.json();
})

export function ARPUKPICard() {
  const { filters } = useFilters()
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

  // --- LÓGICA DE CÁLCULO MANUAL ---
  const getARPAMetrics = () => {
    const history = response?.data || [] // El array de meses
    if (history.length === 0) return { current: 0, diff: 0 }

    // 1. Encontrar el índice del mes seleccionado
    let currentIndex = history.length - 1 // Por defecto, el último mes
    
    if (filters.month !== "Todos") {
      const foundIndex = history.findIndex((item: any) => {
        const m = new Date(item.period.date_from).getUTCMonth()
        const monthName = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][m]
        return monthName === filters.month
      })
      if (foundIndex !== -1) currentIndex = foundIndex
    }

    // 2. Obtener ARPA actual y del mes anterior
    const currentARPA = history[currentIndex]?.rates?.arpa?.total || 0
    const previousARPA = currentIndex > 0 ? history[currentIndex - 1]?.rates?.arpa?.total : null

    // 3. Calcular porcentaje de cambio: ((Actual - Anterior) / Anterior) * 100
    let changePercent = 0
    if (previousARPA && previousARPA > 0) {
      changePercent = ((currentARPA - previousARPA) / previousARPA) * 100
    }

    return {
      current: currentARPA,
      percent: changePercent
    }
  }

  const { current: currentARPA, percent: changePercent = 0 } = getARPAMetrics()
  const isPositive =  changePercent  >= 0  

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

  // Estado visual para el error 404/CORS detectado en consola
  if (error) {
    return (
      <Card className="bg-card border-red-100 shadow-sm p-4 flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="h-5 w-5 mb-1" />
        <span className="text-[10px] font-bold uppercase">Error de Conexión</span>
        <span className="text-[9px] text-red-400">Verificar /api/proxy</span>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
         <span className="text-sm text-muted-foreground font-medium">ARPA</span>
          <div className="p-2 rounded-lg bg-muted">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="text-2xl font-bold text-foreground mb-1">
          ${currentARPA.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>

        <div className={`flex items-center text-xs ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
          {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          <span>{isPositive ? "+" : ""}{(changePercent ?? 0).toFixed(1)}% vs anterior</span>
        </div>
      </CardContent>
    </Card>
  )
}