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
  
  // Detectamos si el tipo actual es de empresa
  const isCompany = filters.type.includes("summary-company")

  // FETCH 1: Datos de la entidad actual (Nombre de Empresa y métricas globales)
  const { data: summaryData, isLoading: isLoadingSummary } = useSWR(
    filters.searchId 
      ? `/api/proxy/Posting?endpoint=${filters.type}&search_id=${filters.searchId}` 
      : null,
    fetcher
  )

  // FETCH 2: Lista de vacantes (Solo si es Company para llenar el select)
  // IMPORTANTE: Aquí NO enviamos el ?posting_id= para obtener la lista completa
  const { data: listData, isLoading: isLoadingList } = useSWR(
    isCompany && filters.searchId 
      ? `/api/proxy/Posting?endpoint=metrics-postings/metrics-posting?company_id=&search_id=${filters.searchId}` 
      : null,
    fetcher
  )

  if (!filters.searchId) return null

  // --- LÓGICA DE DATOS ---
  
  // En Company, el nombre viene de la raíz del JSON
  // En Posting, el nombre viene dentro del array data[0]
  const companyName = isCompany 
    ? (summaryData?.company_name || "Cargando Empresa...") 
    : (summaryData?.data?.[0]?.company_name || "Empresa");

  const postingTitle = !isCompany ? (summaryData?.data?.[0]?.posting_title || "Vacante") : "";
  const companyId = !isCompany ? summaryData?.data?.[0]?.company_id : filters.searchId;

  // Lista de postings para el selector
  const postingsOptions = listData?.data || [];

  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* IDENTIDAD: Empresa o Posting */}
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

        {/* NAVEGACIÓN: Selector o Botón de Retorno */}
        
        {/* Selector de vacantes (Solo aparece en vista de Empresa) */}
        {isCompany && (
          <div className="flex items-center gap-3 bg-muted/30 p-2 px-3 rounded-xl border border-border/50">
            <div className="flex flex-col">
              <select 
                className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer min-w-[200px]"
                disabled={isLoadingList}
                onChange={(e) => {
                  if (e.target.value) {
                    setSearchId(e.target.value)
                    setType("metrics-postings/metrics-posting?posting_id=")
                  }
                }}
              >
                <option value="">{isLoadingList ? "Cargando..." : "Posting Activos"}</option>
                {postingsOptions.map((p: any) => (
                  <option key={p.posting_id} value={p.posting_id}>
                    {p.posting_title}
                  </option>
                ))}
              </select>
            </div>
            <LayoutList className="h-4 w-4 text-muted-foreground" />
          </div>
        )}


      </div>
    </div>
  )
}