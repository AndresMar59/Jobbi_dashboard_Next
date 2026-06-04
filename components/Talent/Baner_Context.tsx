"use client"

import { useFilters } from "@/lib/contexts/filter-context-posting"
import { Building2, Briefcase, ChevronRight, LayoutList, Loader2 } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error al cargar datos');
  return res.json();
})

export function ContextBanner() {
  const { filters, setType, setSearchId } = useFilters()
  
  // 1. Captura los IDs reales (ya sea de un estado o de la URL del navegador)
const searchIdReal = filters.searchId;
const companyIdReal = filters.type; 

// 2. Condición estricta: Si alguno de los dos está vacío o indefinido, NO HACER NADA
const listoParaConsultar = searchIdReal && companyIdReal;

  // Detectamos si el tipo actual es de empresa
  const isCompany = filters.type.includes("summary-company")

  // FETCH 1: Datos de la entidad actual (Nombre de Empresa y métricas globales)
  const { data: summaryData, isLoading: isLoadingSummary } = useSWR(
    listoParaConsultar 
      ? `/api/proxy/Posting?endpoint=${filters.type}&search_id=${filters.searchId}` 
      : null,
    fetcher,
    {
     revalidateOnFocus: false,
    revalidateOnReconnect: false,      
    revalidateIfStale: false,      
    dedupingInterval: 10000, 
    }
  )


  if (!filters.searchId) return null

  const companyName = isCompany 
    ? (summaryData?.company_name || "Cargando Empresa...") 
    : (summaryData?.data?.[0]?.company_name || "Empresa");

  const postingTitle = !isCompany ? (summaryData?.data?.[0]?.posting_title || "Vacante") : "";

  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100 text-indigo-600">
            {isLoadingSummary ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isCompany ? (
              <Building2 className="h-6 w-6" />
            ) : (
              <Briefcase className="h-6 w-6" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {isCompany ? companyName : postingTitle}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 font-medium">
              <span className="uppercase tracking-wider px-1.5 py-0.5 bg-muted rounded">
                {isCompany ? "Corporativo" : "Detalle de Vacante"}
              </span>
              {!isCompany && (
                <>
                  <span className="h-1 w-1 bg-border rounded-full" />
                  <span>Empresa: {companyName}</span>
                </>
              )}
            </div>
          </div>
        </div>        

      </div>
    </div>
  )
}