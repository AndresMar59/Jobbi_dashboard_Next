"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"

interface CACResponse {
  [month: string]: number
}

interface LTVPlanData {
  total_revenue: number
  ltv: number
  companies: number
}

interface LTVResponse {
  [plan: string]: LTVPlanData
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error("Error fetching data")
  return response.json()
}

// CAC VS LTV - Barras comparativas con filtro de plan
export function CACLTVChart() {
  const { filters, setFilters } = useFilters()
  const selectedPlan = filters.plan
  
  // Fetch CAC data
  const { data: cacData, isLoading: cacLoading } = useSWR<CACResponse>(
    "/api/costs/cac",
    fetcher,
    { revalidateOnFocus: false }
  )
  
  // Fetch LTV data
  const { data: ltvData, isLoading: ltvLoading } = useSWR<LTVResponse>(
    "/api/micro/ltv",
    fetcher,
    { revalidateOnFocus: false }
  )
  
  const isLoading = cacLoading || ltvLoading
  
  // Calcular CAC promedio anual
  const calculateAverageCAC = (): number => {
    if (!cacData) return 0
    const values = Object.values(cacData).filter(v => typeof v === 'number')
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }
  
  // Calcular LTV (global o por plan)
  const calculateLTV = (): number => {
    if (!ltvData) return 0
    
    if (selectedPlan && selectedPlan !== "Todos") {
      // LTV del plan seleccionado
      return ltvData[selectedPlan]?.ltv || 0
    }
    
    // LTV global (promedio de todos los planes)
    const plans = Object.values(ltvData)
    if (plans.length === 0) return 0
    return plans.reduce((sum, plan) => sum + plan.ltv, 0) / plans.length
  }
  
  // Obtener planes disponibles
  const availablePlans = ltvData ? Object.keys(ltvData) : []
  
  const averageCAC = calculateAverageCAC()
  const ltv = calculateLTV()
  
  const chartData = [
    { name: "CAC", value: averageCAC },
    { name: "LTV", value: ltv },
  ]
  
  const handlePlanChange = (value: string) => {
    setFilters({ plan: value })
  }
  
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">CAC VS LTV</h3>
        </div>
        <div className="flex items-center justify-center h-[350px]">
          <div className="animate-pulse text-muted-foreground">Cargando datos...</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">CAC VS LTV</h3>
        <select
          value={selectedPlan || "Todos"}
          onChange={(e) => handlePlanChange(e.target.value)}
          className="h-8 px-3 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="Todos">Todos</option>
          {availablePlans.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            tickMargin={10}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="#6b7280"
            width={50}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
          />
          <Bar dataKey="value" fill="#09124F" radius={[4, 4, 0, 0]} barSize={60} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-xs text-muted-foreground text-center">
        CAC: Promedio anual | LTV: {selectedPlan && selectedPlan !== "Todos" ? `Plan ${selectedPlan}` : "Global (todos los planes)"}
      </div>
    </div>
  )
}
