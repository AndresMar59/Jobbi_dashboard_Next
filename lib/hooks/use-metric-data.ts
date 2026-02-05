"use client"

/**
 * HOOKS PARA METRICAS CALCULADAS
 * 
 * Estos hooks combinan datos de multiples APIs y aplican formulas de negocio.
 * Cada uno:
 *   1. Obtiene data cruda de multiples endpoints via SWR
 *   2. Aplica la formula de la metrica usando las funciones de metrics.ts
 *   3. Filtra por año/mes segun corresponda
 *   4. Retorna el resultado calculado + loading/error
 * 
 * Las funciones de calculo son puras (en metrics.ts) y reciben data cruda.
 */

import { useMemo } from "react"
import useSWR from "swr"
import { fetcher, calculateCACRatio, calculateNewARR, calculateChurnARR, calculateCACPayback, ALL_MONTHS } from "@/lib/api/metrics"
import { MONTH_MAP, MONTH_LABELS } from "./use-api-data"
import type {
  MRRNewResponse,
  ChurnMRRResponse,
  ARPUResponse,
  CACResponse,
} from "@/lib/api/types"

const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 60000,
}


// ============================================
// useCACRatioData
// Formula: (New MRR global mes * 0.70) / CAC mes
// Nivel: solo fecha (sin plan)
// Endpoints: /micro/mrr_new + /costs/cac
// ============================================

export interface CACRatioChartPoint {
  month: string
  monthLabel: string
  cacRatio: number
  newMRR: number
  cac: number
}

export function useCACRatioData(options: { year?: string; month?: string } = {}) {
  const { year = "2026", month = "Todos" } = options

  const { data: mrrNewData, error: err1, isLoading: loading1 } = useSWR<MRRNewResponse>(
    "/api/micro/mrr_new", fetcher, SWR_CONFIG
  )
  const { data: cacData, error: err2, isLoading: loading2 } = useSWR<CACResponse>(
    "/api/costs/cac", fetcher, SWR_CONFIG
  )

  const isLoading = loading1 || loading2
  const error = err1 || err2

  const result = useMemo(() => {
    if (!mrrNewData || !cacData) return null

    // Calcular con la funcion pura
    const calculated = calculateCACRatio(mrrNewData, cacData)

    // Filtrar por año y mes
    let filtered = calculated.cacRatioByMonth.filter(d => d.month.startsWith(year))

    if (month !== "Todos") {
      const monthNum = MONTH_MAP[month]
      filtered = filtered.filter(d => d.month.endsWith(`-${monthNum}`))
    }

    // Crear chart data con continuidad
    const chartData: CACRatioChartPoint[] = ALL_MONTHS.map(m => {
      const point = filtered.find(d => d.month === `${year}-${m}`)
      return {
        month: `${year}-${m}`,
        monthLabel: MONTH_LABELS[m],
        cacRatio: point?.cacRatio || 0,
        newMRR: point?.newMRR || 0,
        cac: point?.cac || 0,
      }
    })

    const withData = chartData.filter(d => d.cacRatio > 0)
    const currentCACRatio = withData[withData.length - 1]?.cacRatio || 0
    const previousCACRatio = withData[withData.length - 2]?.cacRatio || 0

    return { chartData, currentCACRatio, previousCACRatio }
  }, [mrrNewData, cacData, year, month])

  return {
    chartData: result?.chartData || [],
    currentCACRatio: result?.currentCACRatio || 0,
    previousCACRatio: result?.previousCACRatio || 0,
    isLoading,
    error,
  }
}


// ============================================
// useNewARRData
// Formula: New MRR * 12
// Nivel: plan y fecha
// Endpoint: /micro/mrr_new
// Proyeccion: ultimo mes real -> meses restantes del anio
// ============================================

export interface NewARRChartPoint {
  month: string
  monthLabel: string
  newARR: number
  isProjected: boolean
}

export function useNewARRData(options: { year?: string; month?: string; plan?: string } = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  const { data: mrrNewData, error, isLoading } = useSWR<MRRNewResponse>(
    "/api/micro/mrr_new", fetcher, SWR_CONFIG
  )

  const result = useMemo(() => {
    if (!mrrNewData) return null

    const calculated = calculateNewARR(mrrNewData, year)

    // Si hay filtro de plan, filtrar por plan
    let planData = calculated.newARRByPlanAndMonth
    if (plan !== "Todos") {
      planData = planData.filter(d => d.plan === plan)
    }

    // Agrupar por mes
    const monthTotals = new Map<string, { arr: number; projected: boolean }>()
    for (const item of planData) {
      const entry = monthTotals.get(item.month) || { arr: 0, projected: true }
      entry.arr += item.newARR
      if (!item.isProjected) entry.projected = false
      monthTotals.set(item.month, entry)
    }

    let chartData: NewARRChartPoint[] = ALL_MONTHS.map(m => {
      const monthStr = `${year}-${m}`
      const entry = monthTotals.get(monthStr) || { arr: 0, projected: false }
      return {
        month: monthStr,
        monthLabel: MONTH_LABELS[m],
        newARR: entry.arr,
        isProjected: entry.projected,
      }
    })

    if (month !== "Todos") {
      chartData = chartData.filter(d => d.month === `${year}-${MONTH_MAP[month]}`)
    }

    const annualized = calculated.annualizedNewARR

    return { chartData, annualizedNewARR: annualized, plans: calculated.plans }
  }, [mrrNewData, year, month, plan])

  return {
    chartData: result?.chartData || [],
    annualizedNewARR: result?.annualizedNewARR || 0,
    plans: result?.plans || [],
    isLoading,
    error,
  }
}


// ============================================
// useChurnARRData
// Formula: Churn MRR * 12
// Nivel: plan y fecha
// Endpoint: /micro/churn_mrr
// Proyeccion: ultimo mes real -> meses restantes del anio
// ============================================

export interface ChurnARRChartPoint {
  month: string
  monthLabel: string
  churnARR: number
  isProjected: boolean
}

export function useChurnARRData(options: { year?: string; month?: string; plan?: string } = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  const { data: churnMRRData, error, isLoading } = useSWR<ChurnMRRResponse>(
    "/api/micro/churn_mrr", fetcher, SWR_CONFIG
  )

  const result = useMemo(() => {
    if (!churnMRRData) return null

    const calculated = calculateChurnARR(churnMRRData, year)

    let planData = calculated.churnARRByPlanAndMonth
    if (plan !== "Todos") {
      planData = planData.filter(d => d.plan === plan)
    }

    const monthTotals = new Map<string, { arr: number; projected: boolean }>()
    for (const item of planData) {
      const entry = monthTotals.get(item.month) || { arr: 0, projected: true }
      entry.arr += item.churnARR
      if (!item.isProjected) entry.projected = false
      monthTotals.set(item.month, entry)
    }

    let chartData: ChurnARRChartPoint[] = ALL_MONTHS.map(m => {
      const monthStr = `${year}-${m}`
      const entry = monthTotals.get(monthStr) || { arr: 0, projected: false }
      return {
        month: monthStr,
        monthLabel: MONTH_LABELS[m],
        churnARR: entry.arr,
        isProjected: entry.projected,
      }
    })

    if (month !== "Todos") {
      chartData = chartData.filter(d => d.month === `${year}-${MONTH_MAP[month]}`)
    }

    return { chartData, annualizedChurnARR: calculated.annualizedChurnARR, plans: calculated.plans }
  }, [churnMRRData, year, month, plan])

  return {
    chartData: result?.chartData || [],
    annualizedChurnARR: result?.annualizedChurnARR || 0,
    plans: result?.plans || [],
    isLoading,
    error,
  }
}


// ============================================
// useCACPaybackData
// Formula: CAC / (ARPU mensual promedio global * 0.70)
// Nivel: solo fecha (sin plan)
// Endpoints: /costs/cac + /micro/arpu
// Resultado en meses
// ============================================

export interface CACPaybackChartPoint {
  month: string
  monthLabel: string
  cacPayback: number
  cac: number
  arpu: number
}

export function useCACPaybackData(options: { year?: string; month?: string } = {}) {
  const { year = "2026", month = "Todos" } = options

  const { data: cacData, error: err1, isLoading: loading1 } = useSWR<CACResponse>(
    "/api/costs/cac", fetcher, SWR_CONFIG
  )
  const { data: arpuData, error: err2, isLoading: loading2 } = useSWR<ARPUResponse>(
    "/api/micro/arpu", fetcher, SWR_CONFIG
  )

  const isLoading = loading1 || loading2
  const error = err1 || err2

  const result = useMemo(() => {
    if (!cacData || !arpuData) return null

    const calculated = calculateCACPayback(cacData, arpuData)

    let filtered = calculated.cacPaybackByMonth.filter(d => d.month.startsWith(year))
    if (month !== "Todos") {
      filtered = filtered.filter(d => d.month.endsWith(`-${MONTH_MAP[month]}`))
    }

    const chartData: CACPaybackChartPoint[] = ALL_MONTHS.map(m => {
      const point = filtered.find(d => d.month === `${year}-${m}`)
      return {
        month: `${year}-${m}`,
        monthLabel: MONTH_LABELS[m],
        cacPayback: point?.cacPayback || 0,
        cac: point?.cac || 0,
        arpu: point?.arpu || 0,
      }
    })

    const withData = chartData.filter(d => d.cacPayback > 0)
    const currentPayback = withData[withData.length - 1]?.cacPayback || 0
    const previousPayback = withData[withData.length - 2]?.cacPayback || 0

    return { chartData, currentCACPayback: currentPayback, previousCACPayback: previousPayback }
  }, [cacData, arpuData, year, month])

  return {
    chartData: result?.chartData || [],
    currentCACPayback: result?.currentCACPayback || 0,
    previousCACPayback: result?.previousCACPayback || 0,
    isLoading,
    error,
  }
}
