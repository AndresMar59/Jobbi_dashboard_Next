"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RetentionMetricsTable() {
  const data = [
    { metric: "Total Activos", value: "847", change: "+5.3%" },
    { metric: "Churn Rate", value: "4.7%", change: "-1.2%" },
    { metric: "Retention Rate", value: "95.3%", change: "+1.2%" },
    { metric: "Avg Customer Life", value: "18 meses", change: "+2 meses" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Retención</CardTitle>
        <CardDescription>Resumen de indicadores clave</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between pb-3 border-b last:border-b-0 last:pb-0">
              <span className="text-sm font-medium text-muted-foreground">{item.metric}</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{item.value}</span>
                <span
                  className={`text-xs font-medium ${item.change.startsWith("+") ? "text-chart-1" : "text-chart-2"}`}
                >
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
