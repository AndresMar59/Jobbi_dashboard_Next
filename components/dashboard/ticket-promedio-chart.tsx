"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"

const MONTH_NAMES: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
}

const ALL_MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]

interface ChartDataPoint {
  mes: string
  month: string
  cac: number
  ticketPromedio: number
}

export function TicketPromedioChart() {
  const { filters } = useFilters()
  const year = filters.year
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [cacRes, ticketRes] = await Promise.all([
          fetch("/api/costs/cac"),
          fetch("/api/micro/ticket_promedio"),
        ])

        const cacData = await cacRes.json()
        const ticketData = await ticketRes.json()

        // Crear mapas por mes
        const cacByMonth = new Map<string, number>()
        const ticketByMonth = new Map<string, number>()

        // Procesar CAC: { [month]: cac_value }
        for (const [month, value] of Object.entries(cacData)) {
          if (month.startsWith(year)) {
            cacByMonth.set(month, typeof value === 'number' ? value : 0)
          }
        }

        // Procesar Ticket Promedio: { [month]: { total_revenue, Prom_ticket, ... } }
        for (const [month, monthData] of Object.entries(ticketData)) {
          if (month.startsWith(year)) {
            const data = monthData as { Prom_ticket?: number; prom_ticket?: number }
            const ticket = data.Prom_ticket ?? data.prom_ticket ?? 0
            ticketByMonth.set(month, ticket)
          }
        }

        // Construir datos para todos los meses del año
        const chartData: ChartDataPoint[] = ALL_MONTHS.map(monthNum => {
          const monthKey = `${year}-${monthNum}`
          return {
            mes: MONTH_NAMES[monthNum],
            month: monthKey,
            cac: cacByMonth.get(monthKey) || 0,
            ticketPromedio: ticketByMonth.get(monthKey) || 0,
          }
        })

        setData(chartData)
      } catch (error) {
        console.error("Error fetching data:", error)
        // Datos vacíos en caso de error
        setData(ALL_MONTHS.map(monthNum => ({
          mes: MONTH_NAMES[monthNum],
          month: `${year}-${monthNum}`,
          cac: 0,
          ticketPromedio: 0,
        })))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [year])

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Ticket promedio PA</h3>
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          Cargando...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Ticket promedio PA</h3>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="mes" 
              stroke="#6b7280" 
              tickMargin={10} 
              interval={0} 
              tick={{ fontSize: 12 }} 
              height={40} 
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{ fontSize: 12 }} 
              tickFormatter={(v) => {
                if (Math.abs(v) >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
                if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`
                return `$${v}`
              }} 
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              labelFormatter={(label) => label}
            />
            <Legend
              verticalAlign="top"
              height={30}
              iconSize={10}
              wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
            />
            <Line 
              type="monotone" 
              dataKey="cac" 
              stroke="#09124F" 
              strokeWidth={2} 
              name="$ CAC"
              dot={{ r: 3, fill: "#09124F" }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="ticketPromedio"
              stroke="#474194ff"
              strokeWidth={2}
              name="$ Ticket Promedio"
              dot={{ r: 3, fill: "#474194ff" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
