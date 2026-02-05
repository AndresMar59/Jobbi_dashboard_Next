"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import useSWR from "swr"

interface CACResponse {
  [month: string]: number
}

interface LTVResponse {
  [plan: string]: {
    total_revenue: number
    ltv: number
    companies: number
  }
}

interface UsuariosNuevosResponse {
  [month: string]: {
    [plan: string]: {
      companies: string[]
      new_users: number
    }
  }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function CACVsLTVChart() {
  const { data: cacData } = useSWR<CACResponse>(
    `/api/costs/cac?start_date=2025-12-31T23:59:59.999&acumulado=true`,
    fetcher
  )
  const { data: ltvData } = useSWR<LTVResponse>(`/api/micro/ltv`, fetcher)
  const { data: usuariosNuevosData } = useSWR<UsuariosNuevosResponse>(`/api/micro/usuarios_nuevos`, fetcher)

  // CAC: promedio por mes (dividir CAC acumulado entre usuarios nuevos del mes)
  let cacValue = 0
  if (cacData && usuariosNuevosData) {
    console.log("[v0] CAC Data:", cacData)
    console.log("[v0] Usuarios Nuevos Data:", usuariosNuevosData)
    
    let totalCacPerMonth = 0
    let monthCount = 0

    for (const [month, cacAmount] of Object.entries(cacData)) {
      const monthData = usuariosNuevosData[month]
      console.log("[v0] Processing month:", month, "CAC Amount:", cacAmount, "Month Data:", monthData)
      
      if (monthData) {
        let newUsersThisMonth = 0
        for (const [, planData] of Object.entries(monthData)) {
          if (typeof planData === 'object' && planData !== null && 'new_users' in planData) {
            newUsersThisMonth += planData.new_users || 0
          }
        }

        console.log("[v0] New users this month:", newUsersThisMonth)
        
        if (newUsersThisMonth > 0) {
          totalCacPerMonth += cacAmount / newUsersThisMonth
          monthCount++
        } else {
          // Si no hay clientes nuevos, usar CAC/1
          totalCacPerMonth += cacAmount / 1
          monthCount++
        }
      }
    }

    cacValue = monthCount > 0 ? totalCacPerMonth / monthCount : 0
    console.log("[v0] Final CAC Value:", cacValue)
  }

  // LTV: promedio de todos los planes (sin segmentación por fecha)
  let ltvValue = 0
  if (ltvData) {
    const ltvValues = Object.values(ltvData).map((plan) => plan.ltv)
    ltvValue = ltvValues.length > 0 ? ltvValues.reduce((a, b) => a + b, 0) / ltvValues.length : 0
  }

  const chartData = [
    { name: "CAC", value: cacValue },
    { name: "LTV", value: ltvValue },
  ]

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">CAC VS LTV</h3>
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
        CAC promedio por cliente | LTV promedio global
      </p>
    </div>
  )
}
