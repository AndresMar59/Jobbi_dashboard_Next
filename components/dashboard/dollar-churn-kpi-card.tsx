"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"

// Estructura: { [plan]: { [month]: { [companyId]: { churned_MRR } } } }
interface ChurnMRRResponse {
  [plan: string]: {
    [month: string]: {
      [companyId: string]: {
        churned_MRR: number
      }
    }
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function DollarChurnKPICard() {
  const { filters } = useFilters()

  console.log("[v0] DollarChurnKPICard - Filters:", { year: filters.year, plan: filters.plan, month: filters.month })
  
  const { data: rawData, isLoading } = useSWR<ChurnMRRResponse>(
    "/api/micro/churn_mrr",
    fetcher,
    { revalidateOnFocus: false }
  )

  // Procesar datos con filtros
  const processData = () => {
    if (!rawData) return { currentChurn: 0, previousChurn: 0, percentChange: 0 }

    const monthMap = new Map<string, number>()

    for (const [plan, planData] of Object.entries(rawData)) {
      // Filtrar por plan si está seleccionado
      if (filters.plan !== "Todos" && plan !== filters.plan) continue

      for (const [month, monthData] of Object.entries(planData)) {
        // Filtrar por año
        if (!month.startsWith(filters.year)) continue

        let monthChurn = 0
        for (const [, companyData] of Object.entries(monthData)) {
          monthChurn += companyData.churned_MRR || 0
        }

        monthMap.set(month, (monthMap.get(month) || 0) + monthChurn)
      }
    }

    const sortedMonths = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))

    const currentChurn = sortedMonths[sortedMonths.length - 1]?.[1] || 0
    const previousChurn = sortedMonths[sortedMonths.length - 2]?.[1] || 0

    const percentChange = previousChurn > 0 
      ? ((currentChurn - previousChurn) / previousChurn) * 100 
      : 0

    return { currentChurn, previousChurn, percentChange }
  }

  const { currentChurn, percentChange } = processData()
  // Para churn, una bajada es positiva (menos churn es bueno)
  const isPositive = percentChange <= 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-16 mb-2"></div>
            <div className="h-8 bg-muted rounded w-24 mb-2"></div>
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
          <span className="text-sm text-muted-foreground">$ Churn</span>
          <div className="p-2 rounded-lg bg-muted">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {formatCurrency(currentChurn)}
        </div>
        <div className={`flex items-center text-xs ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
          {isPositive ? (
            <TrendingDown className="h-3 w-3 mr-1" />
          ) : (
            <TrendingUp className="h-3 w-3 mr-1" />
          )}
          <span>
            {percentChange >= 0 ? "+" : ""}{percentChange.toFixed(1)}% vs mes anterior
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
