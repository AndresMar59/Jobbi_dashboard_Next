"use client"

import { Card, CardContent } from "@/components/ui/card"
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
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2" />
            <div className="h-8 bg-muted rounded w-20 mb-2" />
            <div className="h-3 bg-muted rounded w-36" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">CAC RATIO</span>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {formattedValue}
        </div>
        <div className={`flex items-center gap-1 text-xs ${trendColor} hidden`}>
          <TrendIcon className="h-3 w-3" />
          <span>{formattedChange}</span>
        </div>
      </CardContent>
    </Card>
  )
}
