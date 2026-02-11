"use client"

import { Card, CardContent } from "@/components/ui/card"
import { UserCheck, TrendingUp, TrendingDown } from "lucide-react"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"
import { MONTH_MAP } from "@/lib/hooks/use-api-data"

// Estructura simple: { [month]: retention_rate }
interface TasaRetentionResponse {
  [month: string]: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const ALL_MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]

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

    // Iterar sobre todos los meses del año
    for (const monthNum of ALL_MONTHS) {
      const monthKey = `${filters.year}-${monthNum}`
      const retentionRate = rawData[monthKey]
      
      retentionByMonth.push({
        month: monthKey,
        rate: typeof retentionRate === 'number' ? retentionRate : 0,
      })
    }

    // Si hay filtro de mes específico
    let currentRate = 0
    let previousRate = 0

    if (filters.month !== "Todos") {
      // Convertir nombre de mes a número (Ene -> 01)
      const monthNum = MONTH_MAP[filters.month]
      if (!monthNum) {
        return { currentRate: 0, previousRate: 0, percentChange: 0 }
      }
      
      const monthKey = `${filters.year}-${monthNum}`
      const monthData = retentionByMonth.find(m => m.month === monthKey)
      currentRate = monthData?.rate || 0
      
      // Buscar mes anterior
      const monthIndex = retentionByMonth.findIndex(m => m.month === monthKey)
      if (monthIndex > 0) {
        previousRate = retentionByMonth[monthIndex - 1].rate
      }
    } else {
      // Usar último mes disponible con datos
      const withData = retentionByMonth.filter(m => m.rate > 0)
      if (withData.length > 0) {
        currentRate = withData[withData.length - 1].rate
        previousRate = withData[withData.length - 2]?.rate || 0
      }
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
