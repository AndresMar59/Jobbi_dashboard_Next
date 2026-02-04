"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"

interface DCPAData {
  [month: string]: number
}

interface MRRMonthData {
  [companyId: string]: {
    mrr: number
    subscriptions: number
  }
}

interface MRRResponse {
  [plan: string]: {
    [month: string]: MRRMonthData
  }
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error("Error fetching data")
  return response.json()
}

const ALL_MONTHS = [
  { key: "01", label: "Ene" },
  { key: "02", label: "Feb" },
  { key: "03", label: "Mar" },
  { key: "04", label: "Abr" },
  { key: "05", label: "May" },
  { key: "06", label: "Jun" },
  { key: "07", label: "Jul" },
  { key: "08", label: "Ago" },
  { key: "09", label: "Sep" },
  { key: "10", label: "Oct" },
  { key: "11", label: "Nov" },
  { key: "12", label: "Dic" },
]

export function DCPAMRPAChart() {
  const { filters } = useFilters()
  const year = filters.year
  
  const { data: dcpaData, isLoading: isLoadingDCPA } = useSWR<DCPAData>(
    "/api/costs/ue",
    fetcher,
    { revalidateOnFocus: false }
  )
  
  const { data: mrrData, isLoading: isLoadingMRR } = useSWR<MRRResponse>(
    "/api/micro/mrr",
    fetcher,
    { revalidateOnFocus: false }
  )
  
  // Procesar datos de DCPA por mes
  const dcpaByMonth = new Map<string, number>()
  if (dcpaData) {
    for (const [month, value] of Object.entries(dcpaData)) {
      if (month.startsWith(year)) {
        dcpaByMonth.set(month, value)
      }
    }
  }
  
  // Procesar MRR por mes (sin segmentación por plan, sumar todos)
  const mrpaByMonth = new Map<string, number>()
  if (mrrData) {
    for (const [, planData] of Object.entries(mrrData)) {
      for (const [month, monthData] of Object.entries(planData)) {
        if (month.startsWith(year)) {
          let monthTotal = 0
          for (const [, companyData] of Object.entries(monthData)) {
            monthTotal += companyData.mrr
          }
          mrpaByMonth.set(month, (mrpaByMonth.get(month) || 0) + monthTotal)
        }
      }
    }
  }
  
  // Construir datos del gráfico
  const chartData = ALL_MONTHS.map(({ key, label }) => {
    const monthKey = `${year}-${key}`
    return {
      mes: label,
      dcpa: dcpaByMonth.get(monthKey) || 0,
      mrpa: mrpaByMonth.get(monthKey) || 0,
    }
  })
  
  const isLoading = isLoadingDCPA || isLoadingMRR

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">DCPA vs MRPA</h3>

      {isLoading ? (
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando datos...</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
            <XAxis
              dataKey="mes"
              tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
              padding={{ left: 20, right: 20 }}
              height={40}
            />
            <YAxis
              tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
              width={50}
              tickFormatter={(v) => {
                if (Math.abs(v) >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
                if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`
                return `$${v}`
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(1 0 0)",
                border: "1px solid oklch(0.92 0 0)",
                borderRadius: "0.5rem",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
            />
            <Legend
              verticalAlign="top"
              height={30}
              iconSize={10}
              wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
            />
            <Bar dataKey="dcpa" fill="#09124F" name="$ DCPA" radius={[4, 4, 0, 0]} />
            <Bar dataKey="mrpa" fill="#851485ff" name="$ MRPA" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
