"use client"

import { Card, CardContent } from "@/components/ui/card"
import { UserCheck, TrendingUp, TrendingDown } from "lucide-react"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"

// Estructura: { [month]: { [plan]: { retention_rate, retained_companies, total_companies } } }
interface TasaRetentionResponse {
  [month: string]: {
    [plan: string]: {
      retention_rate: number
      retained_companies: number
      total_companies: number
    }
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function TasaRetencionKPICard() {
  const { filters } = useFilters()
  const { data: rawData, isLoading } = useSWR<TasaRetentionResponse>(
    "/api/micro/tasa_retention",
    fetcher,
    { revalidateOnFocus: false }
  )

  // Procesar datos con filtros
  const processData = () => {
    if (!rawData) return { currentRate: 0, previousRate: 0, percentChange: 0 }

    const monthMap = new Map<string, { totalRate: number; count: number }>()

    for (const [month, monthData] of Object.entries(rawData)) {
      // Filtrar por año
      if (!month.startsWith(filters.year)) continue

      let totalRate = 0
      let count = 0

      for (const [plan, planData] of Object.entries(monthData)) {
        // Filtrar por plan si está seleccionado
        if (filters.plan !== "Todos" && plan !== filters.plan) continue

        totalRate += planData.retention_rate
        count += 1
      }

      if (count > 0) {
        monthMap.set(month, { totalRate, count })
      }
    }

    const sortedMonths = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))

    const currentData = sortedMonths[sortedMonths.length - 1]
    const previousData = sortedMonths[sortedMonths.length - 2]

    const currentRate = currentData ? (currentData[1].totalRate / currentData[1].count) : 0
    const previousRate = previousData ? (previousData[1].totalRate / previousData[1].count) : 0

    const percentChange = previousRate > 0 
      ? ((currentRate - previousRate) / previousRate) * 100 
      : 0

    return { currentRate, previousRate, percentChange }
  }

  const { currentRate, percentChange } = processData()
  // Para retención, una subida es positiva
  const isPositive = percentChange >= 0

  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2"></div>
            <div className="h-8 bg-muted rounded w-16 mb-2"></div>
            <div className="h-3 bg-muted rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Tasa de retención</span>
          <div className="p-2 rounded-lg bg-muted">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {currentRate.toFixed(1)}%
        </div>
        <div className={`flex items-center text-xs ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
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
