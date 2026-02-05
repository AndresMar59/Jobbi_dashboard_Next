"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { useFilters } from "@/lib/contexts/filters-context"
import { useUsuariosActivosData } from "@/lib/hooks/use-api-data"

export function CompanyActivosKPICard() {
  const { filters } = useFilters()

  // Usa filtros de fecha y plan
  // Si plan="Todos" usa active_users global del mes
  // Si plan="Starter" cuenta companies[] del plan especifico
  const { currentActive, previousActive, isLoading } = useUsuariosActivosData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })

  // Calcular cambio porcentual vs mes anterior
  const change = previousActive > 0
    ? ((currentActive - previousActive) / previousActive) * 100
    : 0
  const trend = change >= 0 ? "up" : "down"

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-28 mb-2" />
            <div className="h-8 bg-muted rounded w-12 mb-2" />
            <div className="h-3 bg-muted rounded w-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground"># Company Activos</span>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {currentActive.toLocaleString()}
        </div>
        <div className={`flex items-center text-xs ${trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
          <span className="mr-1">{trend === "up" ? "\u2197" : "\u2198"}</span>
          <span>
            {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs mes anterior
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
