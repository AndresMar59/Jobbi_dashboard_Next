"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import { useExpansionMRRData } from "@/lib/hooks/use-api-data"

export function ExpansionKPICard() {
  const { filters } = useFilters()
  const data = useExpansionMRRData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })
  const { isLoading, error } = data

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  // Calcular porcentaje de cambio vs mes anterior
  const percentChange = data.previousExpansionMRR > 0
    ? ((data.currentExpansionMRR - data.previousExpansionMRR) / data.previousExpansionMRR) * 100
    : 0

  const isPositive = percentChange >= 0

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2" />
            <div className="h-8 bg-muted rounded w-20 mb-2" />
            <div className="h-3 bg-muted rounded w-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-4">
          <p className="text-red-500">Error</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">$ Expansiones</span>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {formatCurrency(data.currentExpansionMRR)}
        </div>
        <div className={`flex items-center text-xs ${isPositive ? "text-emerald-600" : "text-red-500"} hidden`}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          <span>
            {isPositive ? "+" : ""}{percentChange.toFixed(1)}% vs mes anterior
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
