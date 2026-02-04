"use client"

import useSWR from "swr"

// Estructura del endpoint /micro/arpu
// { [plan]: { [month]: { arpu, users } } }
interface ARPUMonthData {
  arpu: number
  users: number
}

interface ARPURawResponse {
  [plan: string]: {
    [month: string]: ARPUMonthData
  }
}

interface ARPUChartDataPoint {
  month: string
  monthLabel: string
  arpu: number
}

interface UseARPUDataOptions {
  year?: string
  plan?: string // "Todos" o nombre del plan
}

const fetcher = async (url: string): Promise<ARPURawResponse> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error("Error fetching ARPU data")
  return response.json()
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
}

const ALL_MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]

export function useARPUData(options: UseARPUDataOptions = {}) {
  const { year = "2026", plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<ARPURawResponse>(
    "/api/micro/arpu",
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 60000,
    }
  )

  // Extraer planes disponibles
  const plans = rawData ? Object.keys(rawData) : []

  // Procesar datos con filtros
  const chartData: ARPUChartDataPoint[] = []
  
  if (rawData) {
    // Crear mapa de mes -> arpu acumulado
    const monthDataMap = new Map<string, { totalArpu: number; count: number }>()
    
    for (const [planName, monthsData] of Object.entries(rawData)) {
      // Filtrar por plan si no es "Todos"
      if (plan !== "Todos" && planName !== plan) continue
      
      for (const [month, data] of Object.entries(monthsData)) {
        // Filtrar por año
        if (!month.startsWith(year)) continue
        
        const monthNum = month.split("-")[1]
        const entry = monthDataMap.get(monthNum) || { totalArpu: 0, count: 0 }
        entry.totalArpu += data.arpu
        entry.count += 1
        monthDataMap.set(monthNum, entry)
      }
    }
    
    // Crear array con todos los meses (incluyendo los que no tienen datos = 0)
    for (const monthNum of ALL_MONTHS) {
      const entry = monthDataMap.get(monthNum)
      chartData.push({
        month: `${year}-${monthNum}`,
        monthLabel: MONTH_LABELS[monthNum],
        arpu: entry ? entry.totalArpu / entry.count : 0,
      })
    }
  }

  // Calcular ARPU actual (último mes con datos > 0)
  const currentARPU = chartData.filter(d => d.arpu > 0).pop()?.arpu || 0

  return {
    chartData,
    plans,
    currentARPU,
    isLoading,
    error,
  }
}
