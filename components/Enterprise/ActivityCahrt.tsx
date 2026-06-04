"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { AlertCircle, Activity } from "lucide-react"

interface ActivityChartProps {
  data: { fecha: string; sesiones: number }[];
  isLoading: boolean;
  error: any;
  isFuture: boolean; // <-- Recibe la bandera de control de fecha adelantada
}

export function ActivityChart({ data, isLoading, error, isFuture }: ActivityChartProps) {
  
  // 1. Estado de carga (Esqueleto parpadeante ocupando el mismo espacio)
  if (isLoading) {
    return (
      <Card className="w-full bg-card border border-border shadow-sm mt-6 animate-pulse">
        <CardContent className="h-[270px] bg-muted/20 rounded-xl" />
      </Card>
    )
  }

  // 2. Estado de error de conexión/API
  if (error) {
    return (
      <Card className="w-full bg-card border border-red-100 shadow-sm mt-6 h-[270px] flex flex-col items-center justify-center text-red-500 gap-2">
        <AlertCircle className="h-6 w-6" />
        <span className="text-sm font-semibold">Error al cargar el gráfico de actividad</span>
        <span className="text-xs text-muted-foreground">Verifica la conexión con el proxy de Mixpanel</span>
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
          <Activity className="h-4 w-4 text-[#6D28D9]" />
          Frecuencia de Actividad
        </CardTitle>
        <p className="text-xs text-muted-foreground">
           Sesiones en funcion de acciones relevantes en el último mes.
        </p>
        </div>
      </CardHeader>
    
    <CardContent >
      <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="fecha" 
                tickLine={false}
                axisLine={true}
                stroke="var(--muted-foreground)"
                fontSize={11}
              />
              <YAxis 
                tickLine={true}
                axisLine={true}
                stroke="var(--muted-foreground)"
                fontSize={11}
                allowDecimals={false}
                width={35}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)', radius: 3 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border rounded-lg p-2 shadow-md text-xs">
                        <p className="font-semibold text-foreground">Día {payload[0].payload.fecha}</p>
                        <p className="text-[#6D28D9] font-medium mt-0.5">
                          Sesiones: {payload[0].value}
                        </p>
                      </div>
                    )
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="sesiones" 
                fill="#6D28D9" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
    </CardContent>
  </Card>
)
}