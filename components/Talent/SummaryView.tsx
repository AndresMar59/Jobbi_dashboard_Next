"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Users, Target, UserCheck, BarChart3 } from "lucide-react"

export function CompanySummaryView({ companyId }: { companyId: string | null }) {
  // Aquí iría tu useSWR llamando a la data (global o por ID)
  
  return (
    <div className="space-y-6">
      {/* Fila de KPIs - Usando grid-cols-5 como tu ARPU, CAC, etc. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <KPIItem title="Postings Activos" value="30" icon={Briefcase} />
        <KPIItem title="Aplicaciones" value="1,250" icon={Users} />
        <KPIItem title="Match Rate" value="75.5%" icon={Target} />
        <KPIItem title="Contrataciones" value="12" icon={UserCheck} />
        <KPIItem title="Conv. Rate" value="3.75%" icon={BarChart3} />
      </div>

      {/* Fila de Gráficos - Usando grid-cols-2 como tu MRRDATA / ARRMetrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 h-[350px] flex items-center justify-center border-border bg-card">
           <p className="text-muted-foreground text-sm">Gráfico: Distribución de Canales</p>
        </Card>
        <Card className="p-6 h-[350px] flex items-center justify-center border-border bg-card">
           <p className="text-muted-foreground text-sm">Gráfico: Timeline de Aplicaciones</p>
        </Card>
      </div>
    </div>
  )
}

function KPIItem({ title, value, icon: Icon }: any) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
    </div>
  )
}