"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Percent, AlertCircle } from "lucide-react" // Añadí Info para un look más de dashboard
import { useFilters } from "@/lib/contexts/filter-context-posting"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error en el proxy');
  return res.json();
})

interface StatusItem {
  status: string;
  count: number;
  percentage: number;
}

export function ConvertionKPI() {
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


  let displayValue = "--";
  const hireItem = data?.data?.[0]?.metrics?.candidates_applied
  const item = hireItem?.status_distribution?.find(
  (item: StatusItem) => item.status === "hired"
);

  if (data && !isLoading) {
    if (isCompany) {
      // Si hay datos de empresa y NO es el mensaje de "No data found"
      if (data.summary && data.summary.conversion_rate !== undefined) {
        displayValue = data.summary.conversion_rate.toString();
      }
    } else {
      // Si es posting, solo mostramos si es mayor a 0
      if ( data.total_count > 0 && item !== undefined ) {
        displayValue = item.percentage.toString();
      } else if (data.total_count > 0 && item == undefined) {
        displayValue = "0"; // O "0" si quieres mostrar que el UUID existe pero no tiene nada
      }
      else { displayValue = "--"}
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


  if (error) {
    return (
      <Card className="bg-card border-red-100 shadow-sm p-4 flex flex-col items-center justify-center text-red-500 min-h-[140px]">
        <AlertCircle className="h-5 w-5 mb-1" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Error de Datos</span>
        <span className="text-[9px] text-red-400">ID no encontrado o error en API</span>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        {/* Cabecera: Título e Icono */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-medium">% Convertion Rate</span>
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