"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, TrendingDown, TrendingUp } from "lucide-react"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"

interface ChurnedPlanData {
  companies: string[]
  churned_users: number
}

interface ChurnedResponse {
  [month: string]: {
    [plan: string]: ChurnedPlanData
  }
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error("Error fetching data")
  return response.json()
}

const ALL_MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]

export function ChurnKPICard() {
  const { filters } = useFilters()
  const { year, plan, month } = filters
  
  const { data: rawData, isLoading } = useSWR<ChurnedResponse>(
    "/api/micro/usuarios_churned",
    fetcher,
    { revalidateOnFocus: false }
  )
  
  // Procesar datos con filtros
  const processData = () => {
    if (!rawData) return { current: 0, previous: 0, change: 0 }
    
    // Filtrar por año y plan
    const filteredByMonth: { month: string; churned: number }[] = []
    
    for (const monthNum of ALL_MONTHS) {
      const monthKey = `${year}-${monthNum}`
      const monthData = rawData[monthKey]
      
      let churned = 0
      if (monthData) {
        if (plan === "Todos") {
          // Sumar todos los planes
          for (const planData of Object.values(monthData)) {
            churned += planData.churned_users || 0
          }
        } else if (monthData[plan]) {
          churned = monthData[plan].churned_users || 0
        }
      }
      
      filteredByMonth.push({ month: monthKey, churned })
    }
    
    // Si hay filtro de mes específico
    if (month !== "Todos") {
      const monthNum = ALL_MONTHS.indexOf(month) + 1
      const monthKey = `${year}-${monthNum.toString().padStart(2, "0")}`
      const currentData = filteredByMonth.find(m => m.month === monthKey)
      const prevMonthNum = monthNum === 1 ? 12 : monthNum - 1
      const prevYear = monthNum === 1 ? String(Number(year) - 1) : year
      const prevMonthKey = `${prevYear}-${prevMonthNum.toString().padStart(2, "0")}`
      const prevData = filteredByMonth.find(m => m.month === prevMonthKey)
      
      const current = currentData?.churned || 0
      const previous = prevData?.churned || 0
      const change = previous > 0 ? ((current - previous) / previous) * 100 : 0
      
      return { current, previous, change }
    }
    
    // Sin filtro de mes: usar el último mes con datos
    const withData = filteredByMonth.filter(m => m.churned > 0)
    if (withData.length === 0) return { current: 0, previous: 0, change: 0 }
    
    const current = withData[withData.length - 1]?.churned || 0
    const previous = withData[withData.length - 2]?.churned || 0
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0
    
    return { current, previous, change }
  }
  
  const { current, change } = processData()
  const trend = change <= 0 ? "down" : "up" // Para churn, bajar es bueno
  const TrendIcon = change <= 0 ? TrendingDown : TrendingUp
  
  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-20 mb-2"></div>
            <div className="h-8 bg-muted rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground"># Churn</p>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{current}</p>
          <div className="flex items-center mt-1">
            <TrendIcon className={`h-4 w-4 mr-1 ${trend === "down" ? "text-green-500" : "text-red-500"}`} />
            <span className={`text-sm ${trend === "down" ? "text-green-500" : "text-red-500"}`}>
              {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs mes anterior
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
