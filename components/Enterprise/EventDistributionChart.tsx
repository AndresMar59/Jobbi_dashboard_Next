"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts"
import { MousePointerClick, AlertCircle, CalendarDays } from "lucide-react"

// Mantenemos tus colores profesionales seleccionados
const COLORS = ['#410550', '#9528b6', '#af6acf', '#da9ef1', '#e9d9ee']

interface EventDistributionProps {
  data: { name: string; value: number }[]
  isLoading: boolean
  error: any
  isFuture: boolean
}

export function EventDistributionChart({ data, isLoading, error, isFuture }: EventDistributionProps) {
  
  // 1. Validación de Carga (Espejo de las demás gráficas)
  if (isLoading) {
    return (
      <Card className="w-full bg-card border border-border shadow-sm animate-pulse">
        <CardContent className="h-[320px] bg-muted/20 rounded-xl" />
      </Card>
    )
  }

  // 2. Validación de Error (Espejo de las demás gráficas)
  if (error) {
    return (
      <Card className="w-full bg-card border border-red-100 shadow-sm h-[320px] flex flex-col items-center justify-center text-red-500 gap-2">
        <AlertCircle className="h-6 w-6" />
        <span className="text-sm font-semibold">Error al cargar las acciones frecuentes</span>
      </Card>
    )
  }

  if (isFuture || (data.length === 0 && !isFuture)) {
      return (
        <Card className="bg-card border border-border shadow-sm w-full h-[350px] flex flex-col items-center justify-center gap-3 p-6">
        <AlertCircle className="h-10 w-10 text-muted-foreground/30 stroke-[1.5]" />
        <p className="text-sm font-medium text-muted-foreground text-center">
          No hay datos disponibles
        </p>
      </Card>
      )
    }

  return (
    <Card className="w-full bg-card border border-border shadow-sm flex flex-col justify-between">
        <CardHeader className="pb-2">
            <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-[#6D28D9]" />  
            Acciones más Frecuentes
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Distribución de las acciones más frecuentes
            </p>
          </div>
        </CardHeader>

      <CardContent>
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  width={90}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 4 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--popover)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '8px',
                    fontSize: '12px' 
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}