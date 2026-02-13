"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import { useARPUData } from "@/lib/hooks/use-api-data"

export function ARPUKPICard() {
  const { filters } = useFilters()
  const { currentARPU, previousARPU, isLoading } = useARPUData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })

  // Calcular cambio porcentual vs mes anterior
  const change = previousARPU > 0
    ? ((currentARPU - previousARPU) / previousARPU) * 100
    : 0
  const isPositive = change >= 0

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-medium">
            ARPA (Revenue per clientes)
          </span>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </div>
        {/* text-foreground asegura negro en light mode */}
        <div className="text-2xl font-bold text-foreground mb-1">
          ${currentARPU.toFixed(2)}
        </div>
        <div className={`flex items-center text-xs ${isPositive ? "text-emerald-600" : "text-red-500"} hidden`}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {isPositive ? "+" : ""}{change.toFixed(1)}% vs mes anterior
        </div>
      </CardContent>
    </Card>
  )
}
