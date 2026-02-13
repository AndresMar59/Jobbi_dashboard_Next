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
const MONTH_MAP: { [key: string]: string } = {
  "Todos": "Todos",
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
  "Dic": "12"
}

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
      const monthNum = MONTH_MAP[month]
      const monthKey = `${year}-${monthNum}`
      const currentData = filteredByMonth.find(m => m.month === monthKey)
      
      // Mes anterior
      const prevMonthNum = parseInt(monthNum) === 1 ? 12 : parseInt(monthNum) - 1
      const prevYear = parseInt(monthNum) === 1 ? String(Number(year) - 1) : year
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
  // Para churn, un cambio negativo es positivo (menos churn es mejor)
  const isPositive = change <= 0
  
  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardContent className="p-4">
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
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground"># Churn</p>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground mb-1">{current}</p>
          <div className={`flex items-center text-xs ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
            {isPositive ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : (
              <TrendingUp className="h-3 w-3 mr-1" />
            )}
            <span>
              {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs mes anterior
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
