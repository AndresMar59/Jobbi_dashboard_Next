"use client"

import useSWR from "swr"
import type { MRRResponse } from "@/lib/api/types"

const API_BASE_URL = "https://fast-api-liart-nine.vercel.app"

// Fetcher para SWR
const fetcher = async (url: string): Promise<MRRResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Error fetching MRR data")
  }
  return response.json()
}

// Mapeo de meses
const MONTH_MAP: Record<string, string> = {
  "Ene": "01",
  "Feb": "02",
  "Mar": "03",
  "Abr": "04",
  "May": "05",
  "Jun": "06",
  "Jul": "07",
  "Ago": "08",
  "Sep": "09",
  "Oct": "10",
  "Nov": "11",
  "Dic": "12",
}

const MONTH_REVERSE_MAP: Record<string, string> = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
}

export interface MRRChartDataPoint {
  mes: string
  mrr: number
}

export interface MRRProcessedData {
  totalMRR: number
  mrrByMonth: MRRChartDataPoint[]
  mrrByPlan: { plan: string; mrr: number; subscriptions: number }[]
  availablePlans: string[]
  totalSubscriptions: number
  mrrGrowthPercent: number
  previousMonthMRR: number
}

interface UseMRRDataOptions {
  year?: string
  month?: string
  plan?: string
}

export function useMRRData(options: UseMRRDataOptions = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<MRRResponse>(
    `${API_BASE_URL}/micro/mrr`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 60000, // Refrescar cada 60 segundos
    }
  )

  // Procesar los datos con los filtros aplicados
  const processedData: MRRProcessedData | null = rawData
    ? processData(rawData, year, month, plan)
    : null

  return {
    data: processedData,
    rawData,
    isLoading,
    error,
  }
}

function processData(
  rawData: MRRResponse,
  year: string,
  month: string,
  plan: string
): MRRProcessedData {
  let totalMRR = 0
  let totalSubscriptions = 0
  const planMap = new Map<string, { mrr: number; subscriptions: number }>()
  const monthMap = new Map<string, number>()
  const availablePlans = new Set<string>()

  // Procesar la estructura anidada
  for (const [planName, planData] of Object.entries(rawData)) {
    availablePlans.add(planName)

    // Si hay filtro de plan y no coincide, saltar
    if (plan !== "Todos" && planName !== plan) {
      continue
    }

    for (const [monthKey, monthData] of Object.entries(planData)) {
      // monthKey formato: "2026-01"
      const [dataYear, dataMonth] = monthKey.split("-")

      // Filtrar por año
      if (year !== "Todos" && dataYear !== year) {
        continue
      }

      // Filtrar por mes
      if (month !== "Todos") {
        const filterMonth = MONTH_MAP[month]
        if (dataMonth !== filterMonth) {
          continue
        }
      }

      for (const [, companyData] of Object.entries(monthData)) {
        totalMRR += companyData.mrr
        totalSubscriptions += companyData.subscriptions

        // Agrupar por plan
        const planEntry = planMap.get(planName) || { mrr: 0, subscriptions: 0 }
        planEntry.mrr += companyData.mrr
        planEntry.subscriptions += companyData.subscriptions
        planMap.set(planName, planEntry)

        // Agrupar por mes (para la gráfica)
        const monthLabel = MONTH_REVERSE_MAP[dataMonth] || dataMonth
        const monthMRR = monthMap.get(monthLabel) || 0
        monthMap.set(monthLabel, monthMRR + companyData.mrr)
      }
    }
  }

  // Convertir a arrays
  const mrrByPlan = Array.from(planMap.entries()).map(([planName, data]) => ({
    plan: planName,
    mrr: data.mrr,
    subscriptions: data.subscriptions,
  }))

  // Ordenar meses cronológicamente
  const monthOrder = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const mrrByMonth = Array.from(monthMap.entries())
    .map(([mes, mrr]) => ({ mes, mrr }))
    .sort((a, b) => monthOrder.indexOf(a.mes) - monthOrder.indexOf(b.mes))

  // Calcular crecimiento porcentual (comparar último mes vs penúltimo)
  let mrrGrowthPercent = 0
  let previousMonthMRR = 0
  if (mrrByMonth.length >= 2) {
    const lastMonth = mrrByMonth[mrrByMonth.length - 1]
    const prevMonth = mrrByMonth[mrrByMonth.length - 2]
    previousMonthMRR = prevMonth.mrr
    if (prevMonth.mrr > 0) {
      mrrGrowthPercent = ((lastMonth.mrr - prevMonth.mrr) / prevMonth.mrr) * 100
    }
  }

  return {
    totalMRR,
    mrrByMonth,
    mrrByPlan,
    availablePlans: Array.from(availablePlans),
    totalSubscriptions,
    mrrGrowthPercent,
    previousMonthMRR,
  }
}
