"use client"

import { Card, CardContent } from "@/components/ui/card"
import { UserCheck, TrendingUp, TrendingDown } from "lucide-react"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"

// Estructura simple: { [month]: retention_rate }
interface TasaRetentionResponse {
  [month: string]: number
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

    const retentionByMonth: { month: string; rate: number }[] = []

    // Estructura simple: { [month]: retention_rate }
    for (const [month, retentionRate] of Object.entries(rawData)) {
      // Filtrar por año
      if (!month.startsWith(filters.year)) continue

      retentionByMonth.push({
        month,
        rate: typeof retentionRate === 'number' ? retentionRate : 0,
      })
    }

    // Ordenar por mes
    retentionByMonth.sort((a, b) => a.month.localeCompare(b.month))

    // Si hay filtro de mes específico, usar ese mes
    let currentRate = 0
    let previousRate = 0

    if (filters.month !== "Todos") {
      const monthKey = `${filters.year}-${filters.month}`
      const monthData = retentionByMonth.find(m => m.month === monthKey)
      currentRate = monthData?.rate || 0
      
      // Buscar mes anterior
      const monthIndex = retentionByMonth.findIndex(m => m.month === monthKey)
      if (monthIndex > 0) {
        previousRate = retentionByMonth[monthIndex - 1].rate
      }
    } else {
      // Usar último mes disponible
      currentRate = retentionByMonth[retentionByMonth.length - 1]?.rate || 0
      previousRate = retentionByMonth[retentionByMonth.length - 2]?.rate || 0
    }

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
