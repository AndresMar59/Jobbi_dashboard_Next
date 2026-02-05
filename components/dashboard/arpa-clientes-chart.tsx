"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import useSWR from "swr"
import { useFilters } from "@/lib/contexts/filters-context"

// Tipos
interface ARPUResponse {
  [plan: string]: {
    [month: string]: {
      arpu: number
      users: number
    }
  }
}

interface UsuariosActivosResponse {
  [month: string]: {
    active_users?: number
    [plan: string]: { companies: string[] } | number | undefined
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const ALL_MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function ARPAClientesChart() {
  const { filters, setPlan } = useFilters()
  
  const { data: arpuData, isLoading: loadingArpu } = useSWR<ARPUResponse>(
    "/api/micro/arpu",
    fetcher,
    { revalidateOnFocus: false }
  )
  
  const { data: usuariosData, isLoading: loadingUsuarios } = useSWR<UsuariosActivosResponse>(
    "/api/micro/usuarios_activos",
    fetcher,
    { revalidateOnFocus: false }
  )
  
  const isLoading = loadingArpu || loadingUsuarios

  // Obtener planes disponibles
  const plans = arpuData ? Object.keys(arpuData) : []

  // Procesar datos combinando ARPU y Clientes Activos
  const chartData = ALL_MONTHS.map((monthNum, index) => {
    const monthKey = `${filters.year}-${monthNum}`
    
    let arpu = 0
    let clientesActivos = 0
    
    if (arpuData) {
      if (filters.plan === "Todos") {
        // Promedio de ARPU de todos los planes
        let totalArpu = 0
        let count = 0
        for (const planData of Object.values(arpuData)) {
          if (planData[monthKey]) {
            totalArpu += planData[monthKey].arpu
            count++
          }
        }
        arpu = count > 0 ? totalArpu / count : 0
      } else {
        // ARPU del plan específico
        arpu = arpuData[filters.plan]?.[monthKey]?.arpu || 0
      }
    }
    
    if (usuariosData && usuariosData[monthKey]) {
      const monthData = usuariosData[monthKey]
      
      if (filters.plan === "Todos") {
        // Sumar companies de todos los planes
        for (const [key, value] of Object.entries(monthData)) {
          if (key !== 'active_users' && typeof value === 'object' && value !== null && 'companies' in value) {
            clientesActivos += (value as { companies: string[] }).companies.length
          }
        }
      } else {
        // Companies del plan específico
        const planData = monthData[filters.plan]
        if (planData && typeof planData === 'object' && 'companies' in planData) {
          clientesActivos = (planData as { companies: string[] }).companies.length
        }
      }
    }
    
    return {
      month: monthKey,
      monthLabel: MONTH_LABELS[index],
      arpu,
      clientesActivos,
    }
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">ARPA vs # clientes activos</h3>
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          Cargando datos...
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">ARPA vs # clientes activos</h3>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="monthLabel" 
              stroke="#6b7280" 
              tickMargin={10} 
              tick={{ fontSize: 12 }} 
              height={40} 
            />
            <YAxis 
              yAxisId="left"
              stroke="#dc2626"
              tick={{ fontSize: 12 }} 
              tickFormatter={(v) => `$${v}`}
              width={50}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#1e3a8a"
              tick={{ fontSize: 12 }}
              width={40}
            />
            <Legend
              verticalAlign="top"
              height={30}
              iconSize={10}
              wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "ARPA $") return [`$${value.toFixed(2)}`, name]
                return [value, name]
              }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="clientesActivos"
              name="# clientes activos"
              stroke="#1e3a8a"
              strokeWidth={2}
              dot={{ fill: "#1e3a8a", r: 4 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="arpu"
              name="ARPA $"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ fill: "#dc2626", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <select 
          className="w-full h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-medium transition-colors text-muted-foreground"
          value={filters.plan}
          onChange={(e) => setPlan(e.target.value)}
        >
          <option value="Todos">Todos los planes</option>
          {plans.map((plan) => (
            <option key={plan} value={plan}>{plan}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
