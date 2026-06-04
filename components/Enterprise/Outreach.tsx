"use client"

import { Card, CardContent } from "@/components/ui/card"
import {UserRoundPlus, Activity, AlertCircle } from "lucide-react"

// Definición estricta de las propiedades que va a recibir
interface SesionesTotalesCardProps {
  value: number;
  isLoading: boolean;
  error: any;
  isFuture?: boolean;
}

export function OutreachCard({ value, isLoading, error, isFuture }: SesionesTotalesCardProps) {

  let displayValue = "--";
  if (isFuture || value === -1) {
    displayValue = "--";
  }
     else {
    displayValue = value.toLocaleString('en-US');
    }
  
  // 1. Estado de carga (Skeleton parpadeante de Shadcn)
  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm p-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  // 2. Estado de error visual por si se cae el proxy o Mixpanel responde mal
  if (error) {
    return (
      <Card className="bg-card border-red-100 shadow-sm p-4 flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="h-5 w-5 mb-1" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Error de Carga</span>
      </Card>
    )
  }

  // 3. Render final del KPI con los datos inyectados
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-medium"># Outreach </span>
          <div className="p-2 rounded-lg bg-muted">
            <UserRoundPlus className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        
          <div className="text-2xl font-bold text-foreground">
            {displayValue}
          </div>

      </CardContent>
    </Card>
  )
}