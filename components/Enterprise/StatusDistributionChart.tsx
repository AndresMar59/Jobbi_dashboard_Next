"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { AlertCircle, BarChart3 } from "lucide-react"

interface StatusChartProps {
  data: { status: string; cantidad: number }[];
  isLoading: boolean;
  error: any;
  isFuture: boolean;
}

export function StatusDistributionChart({ data, isLoading, error, isFuture }: StatusChartProps) {
  
  // 1. Estado de carga idéntico (Esqueleto parpadeante)
  if (isLoading) {
    return (
      <Card className="w-full bg-card border border-border shadow-sm animate-pulse">
        <CardContent className="h-[270px] bg-muted/20 rounded-xl" />
      </Card>
    )
  }

  // 2. Estado de error de conexión/API
  if (error) {
    return (
      <Card className="w-full bg-card border border-red-100 shadow-sm h-[270px] flex flex-col items-center justify-center text-red-500 gap-2">
        <AlertCircle className="h-6 w-6" />
        <span className="text-sm font-semibold">Error al cargar distribución de estados</span>
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
    <Card className="w-full bg-card border border-border shadow-sm">
    <CardHeader className="pb-2">
      <div className="space-y-1">
      <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
      <BarChart3 className="h-4 w-4 text-[#4F46E5]" />  
      Estado de Candidaturas
      </CardTitle>
      <p className="text-xs text-muted-foreground">
        Distribución de estados de candidaturas en pipeline.
      </p>
      </div>
    </CardHeader>
    
    <CardContent >
      <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ top: 10, right: 30, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
          
          <XAxis 
            type="number" 
            hide
          />
          
          <YAxis 
            dataKey="status" 
            type="category" 
            tickLine={false} 
            axisLine={false} 
            stroke="var(--muted-foreground)" 
            fontSize={11} 
            width={95} 
          />
          
            <Tooltip 
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)', radius: 4 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover border border-border rounded-lg p-2 shadow-md text-xs">
                    <p className="font-semibold text-foreground">{payload[0].payload.status}</p>
                    <p className="text-foreground font-medium mt-0.5">
                      Candidatos: <span className="font-bold text-[#4F46E5]">{payload[0].value}</span>
                    </p>
                  </div>
                )
              }
              return null;
            }}
          />
          
          {/* Barra */}
          <Bar 
            dataKey="cantidad" 
            fill="#4F46E5" 
            radius={[0, 4, 4, 0]} 
            maxBarSize={20} 
          />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
  )
}