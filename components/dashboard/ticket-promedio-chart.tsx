"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { useCACData, useTicketPromedioData } from "@/lib/hooks/use-api-data"
import { Loader2 } from "lucide-react"

export function TicketPromedioChart() {
  const { filters } = useFilters()
  
  const { chartData: cacData, isLoading: cacLoading, error: cacError } = useCACData({
    year: filters.year,
  })
  
  const { chartData: ticketData, isLoading: ticketLoading, error: ticketError } = useTicketPromedioData({
    year: filters.year,
  })

  // Combinar datos de CAC y Ticket Promedio
  const chartData = (cacData || []).map((cacPoint) => {
    const ticketPoint = ticketData?.find((p) => p.month === cacPoint.month)
    
    return {
      month: cacPoint.month,
      monthLabel: cacPoint.monthLabel,
      cac: cacPoint.cac || 0,
      ticketPromedio: ticketPoint?.ticket || 0,
    }
  })

  const isLoading = cacLoading || ticketLoading

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Ticket promedio PA</h3>
        <div className="h-[350px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (cacError || ticketError) {
    return (
      <div className="bg-card rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Ticket promedio PA</h3>
        <div className="h-[350px] flex items-center justify-center text-red-500">
          Error al cargar los datos
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Ticket promedio PA</h3>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="monthLabel" 
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
              dot={{ r: 4, fill: "white", stroke: "#09124F", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="ticketPromedio"
              stroke="#474194ff"
              strokeWidth={2}
              name="$ Ticket Promedio"
              dot={{ r: 4, fill: "white", stroke: "#474194ff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
