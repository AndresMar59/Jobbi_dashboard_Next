"use client"

import { DollarSign, Loader2, TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import { useContractionMRRData } from "@/lib/hooks/use-api-data"

export function DowngradeKPICard() {
  const { filters } = useFilters()
  const data = useContractionMRRData({
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
  const percentChange = data.previousContractionMRR > 0
    ? ((data.currentContractionMRR - data.previousContractionMRR) / data.previousContractionMRR) * 100
    : 0

  const trend = percentChange >= 0 ? "up" : "down"
  const changeText = `${trend === "up" ? "+" : ""}${percentChange.toFixed(1)}% vs mes anterior`

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-muted-foreground">$ Downgrade</p>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-2xl font-bold text-red-500">Error</p>
      ) : (
        <>
          <p className="text-2xl font-bold text-card-foreground mb-2">
            {formatCurrency(data.currentContractionMRR)}
          </p>
          <div className="flex items-center gap-1 text-sm hidden">
            {trend === "up" ? (
              <TrendingUpIcon className="h-4 w-4 text-sidebar" />
            ) : (
              <TrendingDownIcon className="h-4 w-4 text-red-500" />
            )}
            <span className={trend === "up" ? "text-sidebar" : "text-red-500"}>
              {changeText}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
