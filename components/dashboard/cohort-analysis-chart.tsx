"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Datos de ejemplo para análisis de cohortes
const cohortData = [
  { cohort: "Ene 2024", m0: 100, m1: 85, m2: 78, m3: 72, m4: 68, m5: 65, m6: 63 },
  { cohort: "Feb 2024", m0: 100, m1: 88, m2: 82, m3: 76, m4: 72, m5: 69, m6: null },
  { cohort: "Mar 2024", m0: 100, m1: 90, m2: 84, m3: 79, m4: 75, m5: null, m6: null },
  { cohort: "Abr 2024", m0: 100, m1: 87, m2: 81, m3: 77, m4: null, m5: null, m6: null },
  { cohort: "May 2024", m0: 100, m1: 89, m2: 83, m3: null, m4: null, m5: null, m6: null },
  { cohort: "Jun 2024", m0: 100, m1: 91, m2: null, m3: null, m4: null, m5: null, m6: null },
  { cohort: "Jul 2024", m0: 100, m1: null, m2: null, m3: null, m4: null, m5: null, m6: null },
]

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Cohortes - Retención de Usuarios (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold text-sm">Cohorte</th>
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
                  <td className={`p-3 text-center text-sm ${getRetentionColor(row.m0)}`}>
                    {row.m0 !== null ? `${row.m0}%` : "-"}
                  </td>
                  <td className={`p-3 text-center text-sm ${getRetentionColor(row.m1)}`}>
                    {row.m1 !== null ? `${row.m1}%` : "-"}
                  </td>
                  <td className={`p-3 text-center text-sm ${getRetentionColor(row.m2)}`}>
                    {row.m2 !== null ? `${row.m2}%` : "-"}
                  </td>
                  <td className={`p-3 text-center text-sm ${getRetentionColor(row.m3)}`}>
                    {row.m3 !== null ? `${row.m3}%` : "-"}
                  </td>
                  <td className={`p-3 text-center text-sm ${getRetentionColor(row.m4)}`}>
                    {row.m4 !== null ? `${row.m4}%` : "-"}
                  </td>
                  <td className={`p-3 text-center text-sm ${getRetentionColor(row.m5)}`}>
                    {row.m5 !== null ? `${row.m5}%` : "-"}
                  </td>
                  <td className={`p-3 text-center text-sm ${getRetentionColor(row.m6)}`}>
                    {row.m6 !== null ? `${row.m6}%` : "-"}
                  </td>
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
      </CardContent>
    </Card>
  )
}
