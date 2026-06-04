"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Loader2 } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error en el proxy');
  return res.json();
})

export function DowngradeKPICard() {
  const { filters } = useFilters()

  // Sincronizado con el proxy principal
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

  const getDowngradeMetrics = () => {
    const history = response?.data || []
    if (history.length === 0) return { current: 0, percent: 0 }

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

    // Extraer Contraction MRR (normalmente viene negativo en la API, usamos Math.abs)
    const currentContraction = Math.abs(history[currentIndex]?.mrr_movements?.total?.contraction_mrr || 0)
    const previousContraction = currentIndex > 0 ? Math.abs(history[currentIndex - 1]?.mrr_movements?.total?.contraction_mrr || 0) : 0

    let percentChange = 0
    if (previousContraction > 0) {
      percentChange = ((currentContraction - previousContraction) / previousContraction) * 100
    }

    return {
      current: currentContraction,
      percent: percentChange
    }
  }

  const { current: currentContraction, percent: percentChange = 0 } = getDowngradeMetrics()
  
  // LÓGICA DE COLOR: Si el downgrade baja (percentChange <= 0), es BUENO (emerald)
  const isGoodNews = percentChange <= 0

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
  }

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm p-4">
        <div className="flex items-center justify-center h-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-red-100 shadow-sm p-4 flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="h-5 w-5 mb-1" />
        <span className="text-[10px] font-bold uppercase">Error Downgrade</span>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
         <span className="text-sm text-muted-foreground font-medium">$ Downgrade</span>
          <div className="p-2 rounded-lg bg-muted">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <p className="text-2xl font-bold text-foreground mb-1">
          {formatCurrency(currentContraction)}
        </p>

        {/* Tendencia visible con lógica invertida para salud financiera */}
        <div className={`flex items-center gap-1 text-xs ${isGoodNews ? "text-emerald-600" : "text-red-500"}`}>
          {percentChange <= 0 ? (
            <TrendingDown className="h-3 w-3" />
          ) : (
            <TrendingUp className="h-3 w-3" />
          )}
          <span>
            {percentChange >= 0 ? "+" : ""}{percentChange.toFixed(1)}% vs anterior
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
