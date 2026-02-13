"use client"

import { useFilters } from "@/lib/contexts/filters-context"
import { useUsuariosActivosData, MONTH_LABELS } from "@/lib/hooks/use-api-data"
import { ALL_MONTHS } from "@/lib/api/metrics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Función para obtener el color basado en el porcentaje de retención
function getRetentionColor(value: number | null): string {
  if (value === null) return "bg-muted"
  if (value >= 90) return "bg-green-600 text-white"
  if (value >= 80) return "bg-green-500 text-white"
  if (value >= 70) return "bg-green-400 text-white"
  if (value >= 60) return "bg-yellow-500 text-white"
  if (value >= 50) return "bg-orange-500 text-white"
  return "bg-red-500 text-white"
}

export function CohortAnalysisChart() {
  const { filters } = useFilters()

  // Obtener datos de usuarios activos para construir cohortes
  const { chartData: activosData, isLoading } = useUsuariosActivosData({
    year: "Todos", // Obtener todos los años para análisis histórico
    month: "Todos",
    plan: filters.plan,
  })

  // Construir análisis de cohortes
  // Cada cohorte es un mes de inicio, y rastreamos la retención en meses posteriores
  const cohortData: Array<{
    cohort: string
    activeUsers: number
    values: (number | null)[]
  }> = []

  // Crear cohortes basadas en el mes inicial
  const cohortMap = new Map<number, number[]>()

  // Organizar datos por mes para calcular cohortes
  activosData.forEach(entry => {
    const monthNum = parseInt(entry.month.split("-")[1])
    if (!cohortMap.has(monthNum)) {
      cohortMap.set(monthNum, [])
    }
    cohortMap.get(monthNum)?.push(entry.activeUsers)
  })

  // Construir filas de cohortes
  let cohortIndex = 0
  for (const [startMonth, monthlyValues] of cohortMap) {
    if (cohortIndex >= 12) break // Máximo 12 cohortes

    const cohortLabel = `${MONTH_LABELS[ALL_MONTHS[startMonth - 1]]} 2026`
    const retention: (number | null)[] = []

    // Mes 0 es siempre 100%
    retention.push(100)

    // Calcular retención para meses posteriores
    // Retención Mes N = (Usuarios Mes N / Usuarios Mes 0) * 100
    if (monthlyValues.length > 0) {
      const baseValue = monthlyValues[0]
      for (let i = 1; i < 7; i++) {
        if (monthlyValues[i] !== undefined) {
          const retentionRate = (monthlyValues[i] / baseValue) * 100
          retention.push(Math.round(retentionRate))
        } else {
          retention.push(null)
        }
      }
    }

    cohortData.push({
      cohort: cohortLabel,
      activeUsers: monthlyValues[0] || 0,
      values: retention,
    })

    cohortIndex++
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Cohortes - Retención de Companies (%)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-sm">Cohorte</th>
                    <th className="text-center p-3 font-semibold text-sm"># Companies </th>
                    <th className="text-center p-3 font-semibold text-sm">Mes 0</th>
                    <th className="text-center p-3 font-semibold text-sm">Mes 1</th>
                    <th className="text-center p-3 font-semibold text-sm">Mes 2</th>
                    <th className="text-center p-3 font-semibold text-sm">Mes 3</th>
                    <th className="text-center p-3 font-semibold text-sm">Mes 4</th>
                    <th className="text-center p-3 font-semibold text-sm">Mes 5</th>
                    <th className="text-center p-3 font-semibold text-sm">Mes 6</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((row) => (
                    <tr key={row.cohort} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium text-sm">{row.cohort}</td>
                      <td className="p-3 text-center text-sm font-medium text-muted-foreground">{row.activeUsers}</td>
                      {row.values.map((value, idx) => (
                        <td key={idx} className={`p-3 text-center text-sm ${getRetentionColor(value)}`}>
                          {value !== null ? `${value}%` : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span>≥90% Excelente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>80-89% Muy bueno</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span>70-79% Bueno</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>60-69% Regular</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>50-59% Bajo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>&lt;50% Muy bajo</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
