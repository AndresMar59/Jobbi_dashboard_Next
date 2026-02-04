"use client"

import useSWR from "swr"

// Estructura del endpoint /micro/arpu
// { [plan]: { arpu, total_revenue, active_companies } }
interface ARPURawResponse {
  [plan: string]: {
    arpu: number
    total_revenue: number
    active_companies: number
  }
}

interface ARPUDataPoint {
  plan: string
  arpu: number
  totalRevenue: number
  activeCompanies: number
}

interface UseARPUDataOptions {
  plan?: string
}

interface ARPUProcessedData {
  totalARPU: number
  arpuByPlan: ARPUDataPoint[]
  plans: string[]
}

const fetcher = async (url: string): Promise<ARPURawResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Error fetching ARPU data")
  }
  return response.json()
}

function processData(rawData: ARPURawResponse, planFilter: string): ARPUProcessedData {
  const arpuByPlan: ARPUDataPoint[] = []
  const plans: string[] = []
  let totalARPU = 0
  let planCount = 0

  for (const [plan, data] of Object.entries(rawData)) {
    plans.push(plan)
    
    // Si hay filtro de plan y no coincide, saltar
    if (planFilter !== "Todos" && plan !== planFilter) {
      continue
    }

    arpuByPlan.push({
      plan,
      arpu: data.arpu,
      totalRevenue: data.total_revenue,
      activeCompanies: data.active_companies,
    })

    totalARPU += data.arpu
    planCount++
  }

  // Calcular ARPU promedio
  const avgARPU = planCount > 0 ? totalARPU / planCount : 0

  return {
    totalARPU: avgARPU,
    arpuByPlan,
    plans,
  }
}

export function useARPUData(options: UseARPUDataOptions = {}) {
  const { plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<ARPURawResponse>(
    "/api/micro/arpu",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 60000,
    }
  )

  const processedData: ARPUProcessedData | null = rawData
    ? processData(rawData, plan)
    : null

  return {
    data: processedData,
    rawData,
    isLoading,
    error,
  }
}
