"use client"

import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import type { UsuariosActivosResponse } from "@/lib/api/types"

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error("Error fetching data")
  return response.json()
}

export function CompanyActivosKPICard() {
  const { filters } = useFilters()
  
  const { data: rawData, isLoading } = useSWR<UsuariosActivosResponse>(
    "/api/micro/usuarios_activos",
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 60000 }
  )

  // Procesar datos con filtros
  const processedData = (() => {
    if (!rawData) return null

    // Filtrar por año
    const filteredMonths = Object.entries(rawData)
      .filter(([month]) => month.startsWith(filters.year))
      .sort(([a], [b]) => a.localeCompare(b))

    if (filteredMonths.length === 0) return null

    // Calcular companies activas por mes
    const monthlyData = filteredMonths.map(([month, monthData]) => {
      let activeCompanies = 0
      
      for (const [key, value] of Object.entries(monthData)) {
        if (key !== 'active_users' && typeof value === 'object' && value !== null && 'companies' in value) {
          const planData = value as { companies: string[] }
          
          // Filtrar por plan si hay filtro activo
          if (filters.plan === "Todos" || key === filters.plan) {
            activeCompanies += planData.companies.length
          }
        }
      }
      
      return { month, activeCompanies }
    })

    // Obtener valor actual y anterior
    const current = monthlyData[monthlyData.length - 1]?.activeCompanies || 0
    const previous = monthlyData[monthlyData.length - 2]?.activeCompanies || 0
    
    // Calcular cambio porcentual
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0
    
    return { current, previous, change }
  })()

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const value = processedData?.current || 0
  const change = processedData?.change || 0
  const trend = change >= 0 ? "up" : "down"

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground"># Company Activos</span>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value.toLocaleString()}
        </div>
        <div className={`flex items-center text-xs ${trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
          <span className="mr-1">{trend === "up" ? "↗" : "↘"}</span>
          <span>
            {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs mes anterior
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
