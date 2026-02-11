"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Percent, TrendingUp, TrendingDown } from "lucide-react"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"
import { useMRRData, useChurnMRRData, useContractionMRRData, MONTH_MAP } from "@/lib/hooks/use-api-data"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function GRRKPICard() {
  const { filters } = useFilters()

  console.log("[v0] GRRKPICard - Filters:", { year: filters.year, plan: filters.plan, month: filters.month })

  // Obtener datos de MRR
  const { chartData: mrrData, isLoading: loadingMRR } = useMRRData({
    year: filters.year,
    month: "Todos",
    plan: filters.plan,
  })

  // Obtener datos de Churn MRR
  const { chartData: churnMRRData, isLoading: loadingChurn } = useChurnMRRData({
    year: filters.year,
    month: "Todos",
    plan: filters.plan,
  })

  // Obtener datos de Contraction MRR
  const { chartData: contractionMRRData, isLoading: loadingContraction } = useContractionMRRData({
    year: filters.year,
    month: "Todos",
    plan: filters.plan,
  })

  const isLoading = loadingMRR || loadingChurn || loadingContraction

  // Procesar datos para calcular GRR
  const processData = () => {
    if (!mrrData.length || !churnMRRData.length || !contractionMRRData.length) {
      return { currentGRR: 0, previousGRR: 0, change: 0 }
    }

    // Si hay filtro de mes específico
    if (filters.month !== "Todos") {
      const monthNum = MONTH_MAP[filters.month]
      const monthKey = `${filters.year}-${monthNum}`

      // Obtener valores del mes actual
      const currentMRR = mrrData.find(d => d.month === monthKey)?.mrr || 0
      const currentChurnMRR = churnMRRData.find(d => d.month === monthKey)?.churnMRR || 0
      const currentContractionMRR = contractionMRRData.find(d => d.month === monthKey)?.contractionMRR || 0

      // Obtener valores del mes anterior
      const prevMonthNum = parseInt(monthNum) === 1 ? 12 : parseInt(monthNum) - 1
      const prevYear = parseInt(monthNum) === 1 ? String(Number(filters.year) - 1) : filters.year
      const prevMonthKey = `${prevYear}-${prevMonthNum.toString().padStart(2, "0")}`

      const previousMRR = mrrData.find(d => d.month === prevMonthKey)?.mrr || 0
      const previousChurnMRR = churnMRRData.find(d => d.month === prevMonthKey)?.churnMRR || 0
      const previousContractionMRR = contractionMRRData.find(d => d.month === prevMonthKey)?.contractionMRR || 0

      // Calcular GRR actual: (MRR_anterior - (Churn + Contraction)) / MRR_anterior * 100
      // El MRR base es el del mes anterior (MRR_inicial)
      const currentGRR =
        previousMRR > 0
          ? ((previousMRR - (currentChurnMRR + currentContractionMRR)) / previousMRR) * 100
          : 0

      const previousGRR =
        previousMRR > 0 ? 100 : 0 // Mes anterior tiene GRR de 100% al inicio

      const change = currentGRR - previousGRR

      console.log("[v0] GRRKPICard - Current month GRR:", {
        month: monthKey,
        previousMRR,
        currentChurnMRR,
        currentContractionMRR,
        currentGRR,
        change,
      })

      return { currentGRR, previousGRR, change }
    }

    // Si no hay filtro de mes, usar el último mes disponible
    const lastEntry = mrrData[mrrData.length - 1]
    const secondLastEntry = mrrData[mrrData.length - 2]

    if (!lastEntry || !secondLastEntry) {
      return { currentGRR: 0, previousGRR: 0, change: 0 }
    }

    // Para el mes actual, el MRR base es el del mes anterior
    const baseMRR = secondLastEntry.mrr

    const currentChurnMRR = churnMRRData.find(d => d.month === lastEntry.month)?.churnMRR || 0
    const currentContractionMRR = contractionMRRData.find(d => d.month === lastEntry.month)?.contractionMRR || 0

    const currentGRR =
      baseMRR > 0
        ? ((baseMRR - (currentChurnMRR + currentContractionMRR)) / baseMRR) * 100
        : 0

    // Mes anterior GRR
    const prevChurnMRR = churnMRRData.find(d => d.month === secondLastEntry.month)?.churnMRR || 0
    const prevContractionMRR = contractionMRRData.find(d => d.month === secondLastEntry.month)?.contractionMRR || 0

    const firstEntry = mrrData[mrrData.length - 3]
    const prevBaseMRR = firstEntry?.mrr || baseMRR

    const previousGRR =
      prevBaseMRR > 0
        ? ((prevBaseMRR - (prevChurnMRR + prevContractionMRR)) / prevBaseMRR) * 100
        : 0

    const change = currentGRR - previousGRR

    return { currentGRR, previousGRR, change }
  }

  const { currentGRR, change } = processData()
  const isPositive = change >= 0

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
          <span className="text-sm text-muted-foreground">GRR</span>
          <div className="p-2 rounded-lg bg-muted">
            <Percent className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {currentGRR.toFixed(1)}%
        </div>
        <div className={`flex items-center text-xs ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          <span>
            {isPositive ? "+" : ""}{change.toFixed(1)}% vs mes anterior
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
