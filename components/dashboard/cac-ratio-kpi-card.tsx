"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import { useCACRatioData } from "@/lib/hooks/use-metric-data"

export function CACRatioKPICard() {
  const { filters } = useFilters()

  // CAC Ratio solo responde a filtros de fecha (no plan)
  const { currentCACRatio, previousCACRatio, isLoading } = useCACRatioData({
    year: filters.year,
    month: filters.month,
  })

  // Calcular cambio porcentual vs mes anterior
  const changePercent = previousCACRatio > 0
    ? ((currentCACRatio - previousCACRatio) / previousCACRatio) * 100
    : 0

  const isPositive = changePercent >= 0
  // CAC Ratio alto es bueno (mas retorno por cada $ invertido)
  const trendColor = isPositive ? "text-emerald-600" : "text-red-500"
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  // Formatear valor con 1 decimal + "x"
  const formattedValue = `${currentCACRatio.toFixed(1)}x`
  const formattedChange = `${isPositive ? "+" : ""}${changePercent.toFixed(1)}% vs mes anterior`

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-5 border border-border animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-5 w-5 bg-muted rounded" />
        </div>
        <div className="h-8 w-20 bg-muted rounded mb-2" />
        <div className="h-3 w-36 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground font-medium">CAC RATIO</span>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold text-foreground mb-1">{formattedValue}</p>
      <div className={`flex items-center gap-1 text-xs ${trendColor} hidden`}>
        <TrendIcon className="h-3 w-3" />
        <span>{formattedChange}</span>
      </div>
    </div>
  )
}
