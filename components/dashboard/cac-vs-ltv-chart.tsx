"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"

interface CACResponse {
  [month: string]: number
}

interface LTVResponse {
  [plan: string]: {
    [month: string]: {
      ltv: number
      avg_revenue: number
      avg_lifespan: number
    }
  }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function CACVsLTVChart() {
  const { filters, setFilters } = useFilters()
  const year = filters.year

  const { data: cacData } = useSWR<CACResponse>(
    `/api/costs/cac?start_date=2025-12-31T23:59:59.999&acumulado=true`,
    fetcher
  )
  const { data: ltvData } = useSWR<LTVResponse>(`/api/micro/ltv`, fetcher)

  const selectedPlan = filters.plan || "Todos"
  const availablePlans = ltvData ? Object.keys(ltvData) : []

  // CAC: promedio anual de todos los meses del ano seleccionado
  let cacAvg = 0
  if (cacData) {
    const cacMonths = Object.entries(cacData)
      .filter(([m]) => m.startsWith(year))
      .map(([, v]) => v)
    cacAvg = cacMonths.length > 0 ? cacMonths.reduce((a, b) => a + b, 0) / cacMonths.length : 0
  }

  // LTV: global (promedio de todos los planes) o por plan
  let ltvValue = 0
  if (ltvData) {
    if (selectedPlan === "Todos") {
      let totalLtv = 0
      let count = 0
      for (const [, planMonths] of Object.entries(ltvData)) {
        const months = Object.entries(planMonths).filter(([m]) => m.startsWith(year))
        for (const [, data] of months) {
          totalLtv += data.ltv
          count++
        }
      }
      ltvValue = count > 0 ? totalLtv / count : 0
    } else {
      const planData = ltvData[selectedPlan]
      if (planData) {
        const months = Object.entries(planData).filter(([m]) => m.startsWith(year))
        const ltvSum = months.reduce((sum, [, d]) => sum + d.ltv, 0)
        ltvValue = months.length > 0 ? ltvSum / months.length : 0
      }
    }
  }

  const chartData = [
    { name: "CAC", value: cacAvg },
    { name: "LTV", value: ltvValue },
  ]

  const handlePlanChange = (val: string) => {
    setFilters({ plan: val === "Todos" ? null : val })
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">CAC VS LTV</h3>
        <select
          value={selectedPlan}
          onChange={(e) => handlePlanChange(e.target.value)}
          className="h-8 px-3 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="Todos">Todos</option>
          {availablePlans.map((plan) => (
            <option key={plan} value={plan}>{plan}</option>
          ))}
        </select>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            />
            <Bar dataKey="value" fill="#1e1b4b" radius={[4, 4, 0, 0]} barSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        CAC promedio anual {year} | LTV {selectedPlan === "Todos" ? "global" : `plan ${selectedPlan}`}
      </p>
    </div>
  )
}
