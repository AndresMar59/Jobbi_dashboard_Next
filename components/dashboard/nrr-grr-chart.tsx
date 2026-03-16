"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFilters } from "@/lib/contexts/filters-context"
import { 
  useMRRData, 
  useChurnMRRData, 
  useContractionMRRData, 
  useExpansionMRRData,
  useTasaRetentionData,
  MONTH_LABELS 
} from "@/lib/hooks/use-api-data"
import { ALL_MONTHS } from "@/lib/api/metrics"

export function NRRGRRChart() {
  const { filters } = useFilters()

  // Obtener datos de todas las métricas necesarias
  const { chartData: mrrData } = useMRRData({
    year: filters.year,
    month: "Todos",
    plan: filters.plan,
  })

  const { chartData: churnMRRData } = useChurnMRRData({
    year: filters.year,
    month: "Todos",
    plan: filters.plan,
  })

  const { chartData: contractionMRRData } = useContractionMRRData({
    year: filters.year,
    month: "Todos",
    plan: filters.plan,
  })

  const { chartData: expansionMRRData } = useExpansionMRRData({
    year: filters.year,
    month: "Todos",
    plan: filters.plan,
  })

  const { chartData: tasaRetentionData } = useTasaRetentionData({
    year: filters.year,
    month: "Todos",
    plan: filters.plan,
  })

  // Construir data para el gráfico
  const chartData = ALL_MONTHS.map((m) => {
    const label = MONTH_LABELS[m]

    // Obtener MRR del mes anterior (para calcular GRR y NRR)
    const monthIndex = parseInt(m) - 1
    const prevMonth = monthIndex === 0 ? 12 : monthIndex
    const prevMonthStr = String(prevMonth).padStart(2, "0")
    const mrrPrevEntry = mrrData.find(d => d.month.endsWith(`-${prevMonthStr}`))
    const mrrInitial = mrrPrevEntry?.mrr || 0

    // MRR actual del mes
    const mrrEntry = mrrData.find(d => d.monthLabel === label)
    const mrrActual = mrrEntry?.mrr || 0

    // Churn MRR del mes
    const churnEntry = churnMRRData.find(d => d.monthLabel === label)
    const churnMRR = churnEntry?.churnMRR || 0

    // Contraction MRR del mes
    const contractionEntry = contractionMRRData.find(d => d.monthLabel === label)
    const contractionMRR = contractionEntry?.contractionMRR || 0

    // Expansion MRR del mes
    const expansionEntry = expansionMRRData.find(d => d.monthLabel === label)
    const expansionMRR = expansionEntry?.expansionMRR || 0

    // Tasa de Retención del mes
    const tasaEntry = tasaRetentionData.find(d => d.monthLabel === label)
    const tasaRetencion = tasaEntry?.retentionRate !== null && tasaEntry?.retentionRate !== undefined 
      ? tasaEntry.retentionRate 
      : 0

    // Calcular GRR: (MRR_inicial - (Churn MRR + Contraction MRR)) / MRR_inicial * 100
    // Si no hay MRR inicial (ej: enero), GRR = 0 (sin datos disponibles)
    const grr = mrrInitial > 0 
      ? ((mrrInitial - (churnMRR + contractionMRR)) / mrrInitial) * 100 
      : 0

    // Calcular NRR: (MRR_inicial - Churn MRR - Contraction MRR + Expansion MRR) / MRR_inicial * 100
    // Si no hay MRR inicial (ej: enero), NRR = 0 (sin datos disponibles)
    const nrr = mrrInitial > 0 
      ? ((mrrInitial - churnMRR - contractionMRR + expansionMRR) / mrrInitial) * 100 
      : 0

    return {
      mes: label,
      grr: Math.round(grr * 10) / 10,
      nrr: Math.round(nrr * 10) / 10,
      retencion: Math.round(tasaRetencion * 10) / 10,
    }
  }).filter(d => filters.month === "Todos" || d.mes === filters.month)

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">NRR vs GRR</h3>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 5, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mes" stroke="#6b7280" padding={{ left: 20, right: 20 }} fontSize={12} tickMargin={10} interval={0} height={40}/>
            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${value}%`} width={40} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
              formatter={(value: number) => `${value.toFixed(2)}%`}
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
              dataKey="grr"
              stroke="#09124F"
              strokeWidth={2}
              dot={{ fill: "white", r: 4, stroke: "#09124F", strokeWidth: 2 }}
              name="GRR %"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="nrr"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "white", r: 4, stroke: "#10b981", strokeWidth: 2 }}
              name="NRR %"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="retencion"
              stroke="#6b018bff"
              strokeWidth={2}
              dot={{ fill: "white", r: 4, stroke: "#6b018bff", strokeWidth: 2 }}
              name="% Retención"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
