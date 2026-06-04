"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Percent,AlertCircle, Users, Search, Info } from "lucide-react" // Añadí Info para un look más de dashboard
import { useFilters } from "@/lib/contexts/filter-context-posting"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error en el proxy');
  return res.json();
})

export function MatchKPI() {
  const { filters } = useFilters()
  const searchIdReal = filters.searchId;
const companyIdReal = filters.type; 

const listoParaConsultar = searchIdReal && companyIdReal;
  
  const { data, isLoading, error } = useSWR(
    listoParaConsultar ? `/api/proxy/Posting?endpoint=${filters.type}&search_id=${filters.searchId}` : null,
    fetcher,

    {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,      
    revalidateIfStale: false,      
    dedupingInterval: 10000,


    }
  )

  const isCompany = filters.type.includes("summary-company")

  // LÓGICA DE EXTRACCIÓN SEGURA
  let displayValue = "--";

  if (data && !isLoading) {
    if (isCompany) {
      // Si hay datos de empresa y NO es el mensaje de "No data found"
      if (data.summary && data.summary.applications_in_range !== undefined) {
        displayValue = data.summary.applications_in_range.toString();
      }
    } else {
      // Si es posting, solo mostramos si es mayor a 0
      if (data.total_count > 0) {
        displayValue = data.data[0].metrics.average_matching_percentage.average_percentage.toString();
      } else {
        displayValue = "--"; // O "0" si quieres mostrar que el UUID existe pero no tiene nada
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm p-4">
        <div className="animate-pulse space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 w-8 bg-muted rounded-lg"></div>
          </div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    )
  }


  if (error ) {
    return (
      <Card className="bg-card border-red-100 shadow-sm p-4 flex flex-col items-center justify-center text-red-500 min-h-[140px]">
        <AlertCircle className="h-5 w-5 mb-1" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Error de Datos</span>
        <span className="text-[9px] text-red-400">ID no encontrado o error en API</span>
      </Card>
    )
  }
  
  if (isCompany) {
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        {/* Cabecera: Título e Icono */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-medium"> # Application Rage</span>
          <div className="p-2 rounded-lg bg-muted/50">
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        {/* Valor Principal */}
        <div className="text-3xl font-bold text-foreground mb-1">
          {displayValue}
        </div>
      </CardContent>
    </Card>
  ) }

  else {
    return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        {/* Cabecera: Título e Icono */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-medium"> % Match Rate</span>
          <div className="p-2 rounded-lg bg-muted/50">
            <Percent className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        {/* Valor Principal */}
        <div className="text-3xl font-bold text-foreground mb-1">
          {displayValue}
        </div>
      </CardContent>
    </Card>
  )


  }
  
}