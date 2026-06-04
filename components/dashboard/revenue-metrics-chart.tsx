"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"
import { Loader2, AlertCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(res => res.json())

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]


interface ChartDataPoint {
  mes: string;
  expansion: number;
  grossChurn: number;
  netChurn: number;
}

export function RevenueMetricsChart() {
  const { filters } = useFilters()

  const { data: response, error, isLoading } = useSWR(
    `/api/proxy?&date_to=${filters.year}-12-31&include_payroll=${filters.IncludePayroll}&date_from=${filters.year}-01-01`,
    fetcher,
    {
      revalidateOnFocus: false,
    revalidateOnReconnect: false,      
    revalidateIfStale: false,      
    dedupingInterval: 10000,
    }
  )

  const chartData: ChartDataPoint[] = response?.data?.map((item: any) => {
    const monthPart = item.period?.date_from?.split('-')[1]
    const monthIndex = monthPart ? parseInt(monthPart) - 1 : 0

    return {
      mes: MONTH_LABELS[monthIndex],
      expansion: item.rates?.revenue_expansion_rate ?? 0,
      grossChurn: item.rates?.gross_churn_rate ?? 0,
      netChurn: item.rates?.net_revenue_churn ?? 0,
    }
  }) || []

  // 3. Ahora 'd' ya no es 'any', es 'ChartDataPoint'
  const displayData = filters.month === "Todos" 
    ? chartData 
    : chartData.filter((d: ChartDataPoint) => d.mes === filters.month.substring(0, 3))

  if (isLoading) return (
    <div className="h-[400px] flex items-center justify-center border rounded-lg bg-card shadow-sm">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  )

  if (error) return (
    <div className="h-[400px] flex flex-col items-center justify-center border border-red-100 bg-red-50 rounded-lg text-red-500">
      <AlertCircle className="h-8 w-8 mb-2" />
      <span className="text-sm font-medium">Error al cargar ratios</span>
    </div>
  )

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">Revenue Ratios ({filters.year})</h3>
      </div>
      
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0 0)" />
            <XAxis
              dataKey="mes"
              tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
              tickFormatter={(v) => `${v.toFixed(1)}%`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, undefined]}
            />
            <Legend verticalAlign="top" height={40} iconType="circle" />
            
            <Line 
              type="monotone" 
              dataKey="expansion" 
              stroke="#10b981" 
              strokeWidth={2} 
              name="% Expansion" 
              dot={{ r: 4, fill: "white", stroke: "#10b981", strokeWidth: 2 }} 
            />
            <Line 
              type="monotone" 
              dataKey="grossChurn" 
              stroke="#ef4444" 
              strokeWidth={2} 
              name="% Gross Churn" 
              dot={{ r: 4, fill: "white", stroke: "#ef4444", strokeWidth: 2 }} 
            />
            <Line 
              type="monotone" 
              dataKey="netChurn" 
              stroke="#8b5cf6" 
              strokeWidth={2} 
              name="% Net Churn" 
              dot={{ r: 4, fill: "white", stroke: "#8b5cf6", strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}