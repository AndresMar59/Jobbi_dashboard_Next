"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { AlertCircle, CalendarDays, TrendingUp } from "lucide-react"

interface TimelineProps {
  data: { fecha: string; postulaciones: number }[];
  isLoading: boolean;
  error: any;
  isFuture: boolean;
}

export function ApplicationsTimelineChart({ data, isLoading, error, isFuture }: TimelineProps) {
  
  if (isLoading) {
    return (
      <Card className="w-full bg-card border border-border shadow-sm animate-pulse">
        <CardContent className="h-[320px] bg-muted/20 rounded-xl" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full bg-card border border-red-100 shadow-sm h-[320px] flex flex-col items-center justify-center text-red-500 gap-2">
        <AlertCircle className="h-6 w-6" />
        <span className="text-sm font-semibold">Error al cargar la línea de tiempo</span>
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
            <TrendingUp className="h-4 w-4 text-[#6D28D9]" />  
            Histórico de Postulaciones
            </CardTitle>
            <p className="text-xs text-muted-foreground">
            Flujo por día de las postulaciones recibidas en el último mes.
          </p>
          </div>
        </CardHeader>     

      <CardContent >
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  {/* Gradiente degradado estético para el fondo del gráfico */}
                  <linearGradient id="colorPostulaciones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5817a3" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#5817a3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border rounded-lg p-2 shadow-md text-xs">
                          <p className="font-semibold text-foreground">Día {payload[0].payload.fecha}</p>
                          <p className="text-[#5817a3] font-medium mt-0.5">
                            Postulaciones: <span className="font-bold">{payload[0].value}</span>
                          </p>
                        </div>
                      )
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="postulaciones" 
                  stroke="#5817a3" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPostulaciones)" 
                  dot={{ 
        stroke: '#5817a3',    
        strokeWidth: 2,       
        r: 3,                 
        fill: 'var(--card)'}} 
        />

              </AreaChart>
            </ResponsiveContainer>
            </div>
      </CardContent>
    </Card>
  )
}