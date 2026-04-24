"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error en el proxy');
  return res.json();
})

export function CACRatioKPICard() {
  const { filters } = useFilters()
  
  // Usamos el proxy con 12 meses, igual que en las otras cards
  const { data: response, isLoading, error } = useSWR(
    `/api/proxy?months=12&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`, 
    fetcher
  )

  const getCACRatioMetrics = () => {
    const history = response?.data || []
    if (history.length === 0) return { current: 0, percent: 0 }

    // 1. Identificar el índice del mes seleccionado
    let currentIndex = history.length - 1
    
    if (filters.month !== "Todos") {
      const foundIndex = history.findIndex((item: any) => {
        const m = new Date(item.period.date_from).getUTCMonth()
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        return monthNames[m] === filters.month
      })
      if (foundIndex !== -1) currentIndex = foundIndex
    }

    // 2. Extraer valores del CAC Ratio (normalmente en external_metrics o rates)
    // Ajusta la ruta si en tu JSON de Jobbi/ChartMogul se llama diferente
    const currentRatio = history[currentIndex]?.external_metrics?.cac_ratio || 0
    const previousRatio = currentIndex > 0 ? history[currentIndex - 1]?.external_metrics?.cac_ratio : 0

    // 3. Cálculo de variación porcentual
    let changePercent = 0
    if (previousRatio > 0) {
      changePercent = ((currentRatio - previousRatio) / previousRatio) * 100
    }

    return {
      current: currentRatio,
      percent: changePercent
    }
  }

  const { current: currentCACRatio, percent: changePercent = 0 } = getCACRatioMetrics()
  const isPositive = changePercent >= 0

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
      <Card className="bg-card border-red-100 shadow-sm p-4 flex flex-col items-center justify-center text-red-500 text-center">
        <AlertCircle className="h-5 w-5 mb-1" />
        <span className="text-[10px] font-bold uppercase leading-tight">Error de<br/>Conexión</span>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
         <span className="text-sm text-muted-foreground font-medium">CAC RATIO</span>
          <div className="p-2 rounded-lg bg-muted">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="text-2xl font-bold text-foreground mb-1">
          {currentCACRatio.toFixed(1)}x
        </div>

        {/* Mostramos la tendencia (le quitamos el 'hidden') */}
        <div className={`flex items-center gap-1 text-xs ${isPositive ? "text-red-500  " : "text-emerald-600"}`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>
            {isPositive ? "+" : ""}{changePercent.toFixed(1)}% vs anterior
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
