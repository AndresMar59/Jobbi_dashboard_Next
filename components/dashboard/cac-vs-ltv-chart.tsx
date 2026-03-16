"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import useSWR from "swr"

interface CACResponse {
  [month: string]: number
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
  const { data: usuariosNuevosData } = useSWR<UsuariosNuevosResponse>(`/api/micro/usuarios_nuevos`, fetcher)

  // LTV Global usando el hook
  const { averageLTV } = (() => {
    // Simulación del hook useLTVData sin usar el hook directamente
    const ltvData = (() => {
      // Esta lógica debería venir de useLTVData en use-api-data.ts
      // Por ahora lo hacemos inline para mayor control
      return { averageLTV: 0 }
    })()
    return ltvData
  })()

  // CAC Global: gasto_cac_total / nuevas_empresas_totales
  let cacValue = 0
  if (cacData && usuariosNuevosData) {
    let totalCacSpend = 0
    let totalNewCompanies = 0

    // Sumar todo el gasto CAC de todos los meses
    for (const [, cacAmount] of Object.entries(cacData)) {
      totalCacSpend += cacAmount || 0
    }

    // Sumar todas las nuevas empresas de todos los meses y planes
    for (const [, monthData] of Object.entries(usuariosNuevosData)) {
      if (typeof monthData === 'object' && monthData !== null) {
        for (const [, planData] of Object.entries(monthData)) {
          if (typeof planData === 'object' && planData !== null && 'new_users' in planData) {
            totalNewCompanies += (planData as any).new_users || 0
          }
        }
      }
    }

    // CAC Global = gasto total / nuevas empresas totales
    cacValue = totalNewCompanies > 0 ? totalCacSpend / totalNewCompanies : 0
  }

  // LTV Global - debe calcularse desde la API
  // Por ahora obtenemos directamente desde el fetch
  const { data: ltvRawData } = useSWR(`/api/micro/ltv`, fetcher)
  let ltvValue = 0
  if (ltvRawData) {
    const ltvValues = Object.values(ltvRawData).map((plan: any) => ({
      ltv: plan.ltv || 0,
      companies: plan.companies || 0,
    }))
    // Promedio ponderado por companies
    const totalWeighted = ltvValues.reduce((s: number, i: any) => s + i.ltv * i.companies, 0)
    const totalCompanies = ltvValues.reduce((s: number, i: any) => s + i.companies, 0)
    ltvValue = totalCompanies > 0 ? totalWeighted / totalCompanies : 0
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
