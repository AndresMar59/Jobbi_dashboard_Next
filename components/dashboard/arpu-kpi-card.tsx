"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"

interface ARPUMonthData {
  arpu: number
  users: number
}

interface ARPUResponse {
  [plan: string]: {
    [month: string]: ARPUMonthData
  }
}

const fetcher = async (url: string): Promise<ARPUResponse> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error("Error fetching ARPU data")
  return response.json()
}

export function ARPUKPICard() {
  const { filters } = useFilters()
  const { data: rawData, isLoading } = useSWR<ARPUResponse>(
    "/api/micro/arpu",
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 60000 }
  )

  // Procesar datos según filtros
  const processData = () => {
    if (!rawData) return { currentARPU: 0, change: 0 }

    const year = filters.year
    const planFilter = filters.plan

    // Recolectar todos los datos por mes
    const monthlyData = new Map<string, { total: number; count: number }>()

    for (const [plan, monthsData] of Object.entries(rawData)) {
      // Filtrar por plan si está seleccionado
      if (planFilter !== "Todos" && plan !== planFilter) continue

      for (const [month, data] of Object.entries(monthsData)) {
        // Filtrar por año
        if (!month.startsWith(year)) continue

        const entry = monthlyData.get(month) || { total: 0, count: 0 }
        entry.total += data.arpu
        entry.count += 1
        monthlyData.set(month, entry)
      }
    }

    // Ordenar meses y calcular ARPU promedio por mes
    const sortedMonths = Array.from(monthlyData.keys()).sort()
    
    if (sortedMonths.length === 0) return { currentARPU: 0, change: 0 }

    const currentMonth = sortedMonths[sortedMonths.length - 1]
    const previousMonth = sortedMonths.length > 1 ? sortedMonths[sortedMonths.length - 2] : null

    const currentData = monthlyData.get(currentMonth)!
    const currentARPU = currentData.count > 0 ? currentData.total / currentData.count : 0

    let change = 0
    if (previousMonth) {
      const prevData = monthlyData.get(previousMonth)!
      const prevARPU = prevData.count > 0 ? prevData.total / prevData.count : 0
      if (prevARPU > 0) {
        change = ((currentARPU - prevARPU) / prevARPU) * 100
      }
    }

    return { currentARPU, change }
  }

  const { currentARPU, change } = processData()
  const isPositive = change >= 0

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }  

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-medium">
            ARPU (Revenue per clientes)
          </span>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">
          ${currentARPU.toFixed(2)}
        </div>
        <div className={`flex items-center text-xs ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {isPositive ? "+" : ""}{change.toFixed(1)}% vs mes anterior
        </div>
      </CardContent>
    </Card>
  )
}
