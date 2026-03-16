"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Percent, TrendingUp, TrendingDown } from "lucide-react"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"
import { useMRRData, useChurnMRRData, useContractionMRRData, useExpansionMRRData, MONTH_MAP } from "@/lib/hooks/use-api-data"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function NRRKPICard() {
  const { filters } = useFilters()

  console.log("[v0] NRRKPICard - Filters:", { year: filters.year, plan: filters.plan, month: filters.month })

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

  // Obtener datos de Expansion MRR
  const { chartData: expansionMRRData, isLoading: loadingExpansion } = useExpansionMRRData({
    year: filters.year,
    month: "Todos",
    plan: filters.plan,
  })

  const isLoading = loadingMRR || loadingChurn || loadingContraction || loadingExpansion

  // Procesar datos para calcular NRR
  const processData = () => {
    if (!mrrData.length || !churnMRRData.length || !contractionMRRData.length || !expansionMRRData.length) {
      return { currentNRR: 0, previousNRR: 0, change: 0 }
    }

    // Si hay filtro de mes específico
    if (filters.month !== "Todos") {
      const monthNum = MONTH_MAP[filters.month]
      const monthKey = `${filters.year}-${monthNum}`

      // Obtener valores del mes actual
      const mrrEntry = mrrData.find(d => d.month === monthKey)
      const churnEntry = churnMRRData.find(d => d.month === monthKey)
      const contractionEntry = contractionMRRData.find(d => d.month === monthKey)
      const expansionEntry = expansionMRRData.find(d => d.month === monthKey)

      const mrrCurrent = mrrEntry?.mrr || 0
      const churnValue = churnEntry?.churnMRR || 0
      const contractionValue = contractionEntry?.contractionMRR || 0
      const expansionValue = expansionEntry?.expansionMRR || 0

      // Mes anterior
      const prevMonthNum = parseInt(monthNum) === 1 ? 12 : parseInt(monthNum) - 1
      const prevYear = parseInt(monthNum) === 1 ? String(Number(filters.year) - 1) : filters.year
      const prevMonthKey = `${prevYear}-${prevMonthNum.toString().padStart(2, "0")}`

      const prevMRREntry = mrrData.find(d => d.month === prevMonthKey)
      const mrrPrevious = prevMRREntry?.mrr || mrrCurrent

      // NRR = (MRR_anterior - Churn_MRR - Contraction_MRR + Expansion_MRR) / MRR_anterior * 100
      const currentNRR = mrrPrevious > 0 
        ? ((mrrPrevious - churnValue - contractionValue + expansionValue) / mrrPrevious) * 100 
        : 0

      // Valor anterior de NRR para comparación
      const previousNRR = currentNRR

      console.log("[v0] NRRKPICard - Calculation:", {
        monthKey,
        mrrCurrent,
        mrrPrevious,
        churnValue,
        contractionValue,
        expansionValue,
        currentNRR,
      })

      return { currentNRR, previousNRR, change: 0 }
    }

    // Si el filtro es "Todos", usar el último mes
    const lastMRR = mrrData[mrrData.length - 1]
    const lastChurn = churnMRRData[churnMRRData.length - 1]
    const lastContraction = contractionMRRData[contractionMRRData.length - 1]
    const lastExpansion = expansionMRRData[expansionMRRData.length - 1]
    const prevMRR = mrrData[mrrData.length - 2]

    const mrrCurrent = lastMRR?.mrr || 0
    const mrrPrevious = prevMRR?.mrr || mrrCurrent
    const churnValue = lastChurn?.churnMRR || 0
    const contractionValue = lastContraction?.contractionMRR || 0
    const expansionValue = lastExpansion?.expansionMRR || 0

    const currentNRR = mrrPrevious > 0 
      ? ((mrrPrevious - churnValue - contractionValue + expansionValue) / mrrPrevious) * 100 
      : 0

    const previousNRR = prevMRR ? ((prevMRR.mrr - (churnMRRData[churnMRRData.length - 2]?.churnMRR || 0) - (contractionMRRData[contractionMRRData.length - 2]?.contractionMRR || 0) + (expansionMRRData[expansionMRRData.length - 2]?.expansionMRR || 0)) / prevMRR.mrr) * 100 : 0

    const change = previousNRR !== 0 ? currentNRR - previousNRR : 0

    console.log("[v0] NRRKPICard - Calculation (All months):", {
      mrrCurrent,
      mrrPrevious,
      churnValue,
      contractionValue,
      expansionValue,
      currentNRR,
      previousNRR,
      change,
    })

    return { currentNRR, previousNRR, change }
  }

  const { currentNRR, previousNRR, change } = isLoading ? { currentNRR: 0, previousNRR: 0, change: 0 } : processData()

  const isPositive = change >= 0
  const changePercent = Math.abs(change).toFixed(1)

  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">NRR (Net Revenue Retention)</p>
            <p className="text-3xl font-bold text-card-foreground">{currentNRR.toFixed(1)}%</p>
            <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? "+" : "-"}{changePercent}% vs mes anterior
            </p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <Percent className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
