"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error en el proxy');
  return res.json();
})

export function DollarChurnKPICard() {
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

  const getChurnMetrics = () => {
    const history = response?.data || []
    if (history.length === 0) return { current: 0, percent: 0 }

    // 1. Identificar el índice del mes seleccionado (usando el split seguro)
    let currentIndex = history.length - 1
    
    if (filters.month !== "Todos") {
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

      const foundIndex = history.findIndex((item: any) => {
        const dateStr = item.period?.date_from || ""
        const monthPart = dateStr.split("-")[1]
        if (!monthPart) return false
        const monthIdx = parseInt(monthPart, 10) - 1
        return monthNames[monthIdx] === filters.month
      })
      if (foundIndex !== -1) currentIndex = foundIndex
    }

    // 2. Extraer Churn MRR (Normalmente viene negativo, usamos Math.abs para mostrarlo positivo)
    const currentChurn = Math.abs(history[currentIndex]?.accounts?.total?.churned || 0)
    const previousChurn = currentIndex > 0 ? Math.abs(history[currentIndex - 1]?.accounts?.total?.churned || 0) : 0

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
  
  // LÓGICA INVERTIDA: En Churn, si el cambio es negativo (bajó el churn), es BUENO (emerald)
  const isImprovement = percentChange <= 0

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
        <span className="text-[10px] font-bold uppercase">Error de Datos</span>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-medium">$ Churn</span>
          <div className="p-2 rounded-lg bg-muted">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="text-2xl font-bold text-foreground mb-1">
          ${currentChurn.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>

        {/* Lógica de color: Verde si bajó (TrendingDown), Rojo si subió (TrendingUp) */}
        <div className={`flex items-center text-xs ${isImprovement ? "text-emerald-600" : "text-red-500"}`}>
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