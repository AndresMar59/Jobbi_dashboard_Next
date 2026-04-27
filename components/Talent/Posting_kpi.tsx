"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Search } from "lucide-react"
import { useFilters } from "@/lib/contexts/filter-context-posting"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => {

  if (!res.ok) throw new Error('Error en el proxy');

  return res.json();

})


function CardLoadingState() {
  return (
    <div className="animate-pulse space-y-2 p-4 border rounded-xl">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-8 bg-muted rounded w-1/2"></div>
    </div>
  )
}

function CardErrorState() {
  return (
    <div className="p-5 border border-red-100 bg-red-50 rounded-xl text-red-600 text-xs flex flex-col items-center">
      <span className="font-bold uppercase mb-1">Error de Datos</span>
      <span>ID no encontrado o error en API</span>
    </div>
  )
}

// Posting_kpi.tsx
export function PostingKPICard() {
  const { filters } = useFilters()
  
  // Enviamos endpoint y searchId como parámetros limpios al proxy
  const { data, isLoading, error } = useSWR(
    filters.searchId 
      ? `/api/proxy/Posting?endpoint=${filters.type}&search_id=${filters.searchId}` 
      : null,
    fetcher
  )

  if (isLoading) return <CardLoadingState />
  if (error) return <CardErrorState />

  const isCompany = filters.type.includes("company")

  // Según tu JSON, total_postings está dentro de 'summary'
  const currentValue = isCompany 
    ? (data?.summary?.total_postings ) 
    : (data?.total_count) // Si es posting individual y hay data, es 1

  return (
  <Card className="hover:shadow-md transition-shadow border-zinc-200 shadow-sm">
    <CardContent className="p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {isCompany ? "Postings Totales" : "Estado del Posting"}
          </p>
          <h3 className="text-3xl font-bold mt-2 tracking-tight">
            {/* Si no hay searchId, mostramos "--" para no confundir al usuario */}
            {filters.searchId ? currentValue : "--"} 
          </h3>
        </div>
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Search className="h-5 w-5 text-indigo-600" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        {/* Badge dinámico que indica si hay una búsqueda activa */}
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
          filters.searchId ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
        }`}>
          {filters.searchId ? "Resultados de ID" : "Sin búsqueda"}
        </span>
        <span className="text-[10px] text-muted-foreground italic">
          {isCompany ? "Vista de Empresa" : "Vista Individual"}
        </span>
      </div>
    </CardContent>
  </Card>
) }