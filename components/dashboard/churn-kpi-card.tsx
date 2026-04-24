"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error en el proxy');
  return res.json();
})

export function ChurnKPICard() {
  const { filters } = useFilters()

  // Usamos el proxy central para traer los 12 meses
  const { data: response, isLoading, error } = useSWR(
    `/api/proxy?months=12&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`, 
    fetcher
  )

  const getChurnMetrics = () => {
    const history = response?.data || []
    if (history.length === 0) return { current: 0, percent: 0 }

    // 1. Encontrar el índice del mes seleccionado
    let currentIndex = history.length - 1
    
    if (filters.month !== "Todos") {
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]


      const foundIndex = history.findIndex((item: any) => {
        const dateStr = item.period?.date_from || ""
        const monthPart = dateStr.split("-")[1]
        if (!monthPart) return false
        const monthIdx = parseInt(monthPart, 10) - 1
        // Nota: Asegúrate de que filters.month coincida con los nombres del array
        return monthNames[monthIdx] === filters.month || filters.month.startsWith(monthNames[monthIdx].substring(0,3))
      })
      if (foundIndex !== -1) currentIndex = foundIndex
    }

    // 2. Extraer cantidad de Churn (Clientes/Usuarios perdidos)
    // En Jobbi/ChartMogul suele ser 'churn_customers' dentro de mrr_movements
    const currentChurn = history[currentIndex]?.accounts?.total?.churned || 0
    const previousChurn = currentIndex > 0 ? history[currentIndex - 1]?.accounts?.total?.churned : 0

    // 3. Calcular variación
    let percentChange = 0
    if (previousChurn > 0) {
      percentChange = ((currentChurn - previousChurn) / previousChurn) * 100
    }

    return {
      current: currentChurn,
      percent: percentChange
    }
  }

  const { current: currentChurn, percent: percentChange = 0 } = getChurnMetrics()
  
  // LÓGICA DE NEGOCIO: En Churn, si el cambio es <= 0 (bajó o se mantuvo), es BUENO (emerald)
  const isGoodNews = percentChange <= 0

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
        <span className="text-[10px] font-bold uppercase">Error de Proxy</span>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
         <span className="text-sm text-muted-foreground font-medium"># Churn</span>
          <div className="p-2 rounded-lg bg-muted">
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="text-2xl font-bold text-foreground mb-1">
          {currentChurn}
        </div>

        {/* Quitamos el 'hidden' y usamos la lógica de colores de Churn */}
        <div className={`flex items-center text-xs ${isGoodNews ? "text-emerald-600" : "text-red-500"}`}>
          {percentChange <= 0 ? (
            <TrendingDown className="h-3 w-3 mr-1" />
          ) : (
            <TrendingUp className="h-3 w-3 mr-1" />
          )}
          <span>
            {percentChange >= 0 ? "+" : ""}{percentChange.toFixed(1)}% vs anterior
          </span>
        </div>
      </CardContent>
    </Card>
  )
}