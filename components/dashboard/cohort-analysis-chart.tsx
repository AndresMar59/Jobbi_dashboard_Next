"use client"

import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(res => res.json())

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

function getRetentionColor(value: number | null): string {
  if (value === null) return "bg-slate-50 text-slate-300"
  if (value >= 90) return "bg-emerald-600 text-white"
  if (value >= 80) return "bg-emerald-500 text-white"
  if (value >= 70) return "bg-emerald-400 text-white"
  if (value >= 60) return "bg-amber-500 text-white"
  if (value >= 50) return "bg-orange-500 text-white"
  return "bg-red-500 text-white"
}

export function CohortAnalysisChart() {
  const { filters } = useFilters()

  // Traemos toda la data del año para construir la matriz
  const { data: response, error, isLoading } = useSWR(
    `/api/proxy?&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`,
    fetcher
  )

  const rawData = response?.data || []

  // Construcción de la matriz de cohortes
  // Usamos 'customers.active_count' para el Mes 0 y calculamos la degradación
  const cohortData = rawData.map((item: any, index: number) => {
    const monthPart = item.period?.date_from?.split('-')[1]
    const monthIndex = monthPart ? parseInt(monthPart) - 1 : 0
    
    const baseUsers = item.accounts?.total?.active || 0
    const retentionValues: (number | null)[] = [100] // Mes 0 siempre es 100%

    // Simulamos/Calculamos los meses siguientes basándonos en la tendencia de churn
    // Nota: Un análisis de cohorte real requiere datos históricos por ID de cliente.
    // Aquí usamos la tasa de retención mensual de la API para proyectar la cohorte.
    let currentRetention = 100
    for (let i = 1; i <= 6; i++) {
      const nextMonthData = rawData[index + i]
      if (nextMonthData && baseUsers > 0) {
        // Usamos la tasa de retención reportada por la API para ese periodo
        const monthlyRate = nextMonthData.rates?.retention_rate || 100
        currentRetention = (currentRetention * monthlyRate) / 100
        retentionValues.push(Math.round(currentRetention))
      } else {
        retentionValues.push(null)
      }
    }

    return {
      cohort: `${MONTH_LABELS[monthIndex]} ${filters.year}`,
      activeUsers: baseUsers,
      values: retentionValues,
    }
  })

  if (isLoading) return <div className="h-64 flex items-center justify-center border rounded-xl"><Loader2 className="animate-spin" /></div>

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Análisis de Cohortes (Retention %)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="text-left p-2 text-xs font-semibold text-muted-foreground uppercase">Cohorte</th>
                <th className="p-2 text-xs font-semibold text-muted-foreground uppercase">Size</th>
                {[0, 1, 2, 3, 4, 5, 6].map(m => (
                  <th key={m} className="p-2 text-xs font-semibold text-muted-foreground uppercase text-center">M{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortData.map((row: any, i: number) => (
                <tr key={i}>
                  <td className="p-2 text-sm font-medium whitespace-nowrap border-r">{row.cohort}</td>
                  <td className="p-2 text-sm text-center font-bold text-slate-500 bg-slate-50 rounded-sm">{row.activeUsers}</td>
                  {row.values.map((val: any, idx: number) => (
                    <td key={idx} className={`p-2 text-center text-xs font-bold rounded-sm transition-colors ${getRetentionColor(val)}`}>
                      {val !== null ? `${val}%` : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leyenda minimalista */}
        <div className="mt-6 pt-4 border-t flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-wider font-bold">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-600 rounded-sm"/> <span>90%+</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-400 rounded-sm"/> <span>70-89%</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded-sm"/> <span>60%</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-sm"/> <span>&lt;50%</span></div>
        </div>
      </CardContent>
    </Card>
  )
}