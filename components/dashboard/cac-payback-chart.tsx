"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"

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

interface CACData {
  [month: string]: number
}

interface ARPUData {
  [plan: string]: {
    [month: string]: {
      arpu: number
      users: number
    }
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const GROSS_MARGIN = 0.70 // 70% margen bruto

export function CACPaybackChart() {
  const { filters } = useFilters()
  const year = filters.year
  
  const { data: cacData, isLoading: cacLoading } = useSWR<CACData>("/api/costs/cac", fetcher)
  const { data: arpuData, isLoading: arpuLoading } = useSWR<ARPUData>("/api/micro/arpu", fetcher)
  
  const isLoading = cacLoading || arpuLoading
  
  // Procesar datos para el gráfico
  const chartData = ALL_MONTHS.map(({ key, label }) => {
    const monthKey = `${year}-${key}`
    
    // Obtener CAC del mes
    const cac = cacData?.[monthKey] || 0
    
    // Calcular ARPU promedio del mes (todos los planes)
    let totalArpu = 0
    let planCount = 0
    
    if (arpuData) {
      for (const [, planData] of Object.entries(arpuData)) {
        if (planData[monthKey]) {
          totalArpu += planData[monthKey].arpu
          planCount++
        }
      }
    }
    
    const avgArpu = planCount > 0 ? totalArpu / planCount : 0
    
    // CAC Payback = CAC / (ARPU × Margen Bruto)
    const denominator = avgArpu * GROSS_MARGIN
    const cacPayback = denominator > 0 ? cac / denominator : 0
    
    return {
      mes: label,
      cacPayback: Math.round(cacPayback * 100) / 100,
    }
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground">CAC Payback</h3>
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          Cargando datos...
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground">CAC Payback</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 25, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="mes" 
            stroke="#6b7280" 
            fontSize={12} 
            tickMargin={10} 
            interval={0} 
            height={40} 
            padding={{ left: 20, right: 20 }} 
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            width={40}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
            formatter={(value: number) => [`${value.toFixed(2)} meses`, "CAC Payback"]}
          />
          <Legend
            verticalAlign="top"
            height={30}
            iconSize={10}
            wrapperStyle={{
              fontSize: "12px",
              paddingBottom: "10px",
            }}
          />
          <Line
            type="monotone"
            dataKey="cacPayback"
            stroke="#710cacff"
            strokeWidth={2}
            dot={{ fill: "#710cacff", r: 4 }}
            name="CAC Payback"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
