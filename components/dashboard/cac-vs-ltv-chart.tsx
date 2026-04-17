"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import useSWR from "swr"
import { Loader2, AlertCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function CACVsLTVChart() {
  const { filters } = useFilters()

  const { data: response, error, isLoading } = useSWR(
    `/api/proxy?year=${filters.year}&include_payroll=${filters.IncludePayroll}`,
    fetcher
  )

  // Obtenemos los datos según el filtro de mes
  const getMetrics = () => {
    const data = response?.data || []
    
    // Si el usuario elige un mes, buscamos ese objeto, si no, tomamos el último del año (acumulado)
    const targetEntry = filters.month === "Todos" 
      ? data[data.length - 1] // El cierre del año
      : data.find((item: any) => {
          const m = new Date(item.period.date_from).getUTCMonth()
          const monthName = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][m]
          return monthName === filters.month
        })

    return {
      cac: targetEntry?.external_metrics?.cac || 0,
      ltv: targetEntry?.external_metrics?.ltv || 0
    }
  }

  const { cac, ltv } = getMetrics()
  const ratio = cac > 0 ? ltv / cac : 0

  const chartData = [
    { name: "CAC", value: cac, color: "#ef4444" },
    { name: "LTV", value: ltv, color: "#10b981" },
  ]

  if (isLoading) return <div className="h-[350px] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Unit Economics</h3>
          <p className="text-xs text-muted-foreground">CAC vs Lifetime Value</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${ratio >= 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          Ratio: {ratio.toFixed(2)}x
        </div>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} fontSize={12} />
            <Tooltip 
              cursor={{ fill: '#f9fafb' }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
              contentStyle={{ borderRadius: '8px' }}
            />
            
            {/* Línea que marca donde el LTV sería 3 veces el CAC actual */}
            <ReferenceLine y={cac * 3} stroke="#94a3b8" strokeDasharray="5 5" label={{ position: 'right', value: 'Goal (3x)', fill: '#94a3b8', fontSize: 10 }} />
            
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={65}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-center text-muted-foreground mt-4 italic">
        {ratio < 3 
          ? "⚠️ El LTV debería ser al menos 3 veces el CAC para asegurar rentabilidad a largo plazo." 
          : "✅ Excelente relación de rentabilidad por cliente."}
      </p>
    </div>
  )
}