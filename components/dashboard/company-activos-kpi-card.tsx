"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error en el proxy');
  return res.json();
})

export function CompanyActivosKPICard() {
  const { filters } = useFilters()

  // Consumimos el proxy principal con el historial de 12 meses
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

const getActiveMetrics = () => {
    const history = response?.data || []
    if (history.length === 0) return { current: 0, percent: 0 }

    let currentIndex = history.length - 1
    
    if (filters.month !== "Todos") {
      // Definimos los meses exactamente como aparecen en tu componente de filtros
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

      const foundIndex = history.findIndex((item: any) => {
        // En lugar de usar new Date(), cortamos el string "YYYY-MM-DD"
        // date_from suele venir como "2026-03-01"
        const dateStr = item.period?.date_from || ""
        const monthPart = dateStr.split("-")[1] // Obtenemos el "03"
        
        if (!monthPart) return false

        const monthIdx = parseInt(monthPart, 10) - 1 // Convertimos "03" -> 2
        
        // Comparamos el nombre del mes del array con el del filtro
        return monthNames[monthIdx] === filters.month
      })

      if (foundIndex !== -1) {
        currentIndex = foundIndex
      }
    }

    const currentActive = history[currentIndex]?.accounts?.total?.active || 0
    const previousActive = currentIndex > 0 ? history[currentIndex - 1]?.accounts?.total?.active : 0

    let changePercent = 0
    if (previousActive > 0) {
      changePercent = ((currentActive - previousActive) / previousActive) * 100
    }

    return {
      current: currentActive,
      percent: changePercent
    }
  }
  
  const { current: currentActive, percent: changePercent = 0 } = getActiveMetrics()
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
      <Card className="bg-card border-red-100 shadow-sm p-4 flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="h-5 w-5 mb-1" />
        <span className="text-[10px] font-bold uppercase leading-tight text-center">Error de<br/>Conexión</span>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
         <span className="text-sm font-medium text-muted-foreground"># Active </span>
         <div className="p-2 rounded-lg bg-muted">
          <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="text-2xl font-bold text-foreground mb-1">
          {currentActive.toLocaleString()}
        </div>

        {/* Tendencia visible (le quitamos el 'hidden') */}
        <div className={`flex items-center text-xs ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
          {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          <span>
            {isPositive ? "+" : ""}{changePercent.toFixed(1)}% vs mes anterior
          </span>
        </div>
      </CardContent>
    </Card>
  )
}