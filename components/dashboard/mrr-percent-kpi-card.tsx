"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Percent, TrendingUp, TrendingDown } from "lucide-react"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"

interface MRRCompanyData {
  mrr: number
  subscriptions: number
}

interface MRRResponse {
  [plan: string]: {
    [month: string]: {
      [companyId: string]: MRRCompanyData
    }
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function MRRPercentKPICard() {
  const { filters } = useFilters()
  const { data: rawData, isLoading } = useSWR<MRRResponse>(
    "/api/micro/mrr",
    fetcher,
    { revalidateOnFocus: false }
  )

  // Procesar datos con filtros
  const processData = () => {
    if (!rawData) return { currentMRR: 0, previousMRR: 0, percentChange: 0 }

    const monthMap = new Map<string, number>()

    for (const [plan, planData] of Object.entries(rawData)) {
      // Filtrar por plan si está seleccionado
      if (filters.plan !== "Todos" && plan !== filters.plan) continue

      for (const [month, monthData] of Object.entries(planData)) {
        // Filtrar por año
        if (!month.startsWith(filters.year)) continue

        let monthMRR = 0
        for (const [, companyData] of Object.entries(monthData)) {
          monthMRR += companyData.mrr
        }

        monthMap.set(month, (monthMap.get(month) || 0) + monthMRR)
      }
    }

    const sortedMonths = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))

    const currentMRR = sortedMonths[sortedMonths.length - 1]?.[1] || 0
    const previousMRR = sortedMonths[sortedMonths.length - 2]?.[1] || 0

    const percentChange = previousMRR > 0 
      ? ((currentMRR - previousMRR) / previousMRR) * 100 
      : 0

    return { currentMRR, previousMRR, percentChange }
  }

  const { percentChange } = processData()
  const isPositive = percentChange >= 0

  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-16 mb-2"></div>
            <div className="h-8 bg-muted rounded w-20 mb-2"></div>
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
          <span className="text-sm text-muted-foreground">MRR %</span>
          <div className="p-2 rounded-lg bg-muted">
            <Percent className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {Math.abs(percentChange).toFixed(1)}%
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
