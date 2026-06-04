"use client"

import { useState } from "react"
import { Search, Send, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFilters } from "@/lib/contexts/filter-context-enterprise"

export function DashboardFilters() {
  // 1. Extraemos las funciones de actualización del contexto
  const { filters, setYear, setMonth, setSearchId, setCustomRange } = useFilters()
  
  const [isCustom, setIsCustom] = useState(false)
  
  // =========================================================
  // ESTADOS LOCALES TEMPORALES (EL "ESPEJO")
  // Guardan lo que el usuario mueve, pero NO disparan peticiones
  // =========================================================
  const [localSearchId, setLocalSearchId] = useState(filters.searchId || "")
  const [localYear, setLocalYear] = useState(filters.year || "2026")
  const [localMonth, setLocalMonth] = useState(filters.month || "Ene")
  const [localFrom, setLocalFrom] = useState("")

  const years = ["2025", "2026", "2027"]
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  // =========================================================
  // GATILLO DE ENVÍO ÚNICO
  // Aquí es donde sincronizamos los cambios locales con el contexto global
  // =========================================================
  const handleQuery = () => {
    // 1. Sincronizamos el ID de búsqueda
    setSearchId(localSearchId.trim())

    // 2. Sincronizamos las fechas según el tipo de filtro activo
    if (isCustom) {
      setCustomRange({
        active: true,
        fromDate: localFrom
      })
    } else {
      // Bloqueamos el rango personalizado para que use los selectores normales
      setCustomRange({ active: false, fromDate: null })
      setYear(localYear)
      setMonth(localMonth)
    }
  }

  return (      
    <div className="flex flex-col gap-3 w-full">
      
        <div  >
       
        <div className="flex flex-wrap items-center gap-3">
          {/* BOTÓN FILTRO PRINCIPAL */}
          <Button
         //   variant="outline"
            size="sm"
            onClick={() => setIsCustom(!isCustom)}
            className={`h-10 rounded-md border border-input bg-muted/50 px-4 py-2 text-sm font-medium transition-colors text-muted-foreground shadow-sm ${
              isCustom ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" />
            {isCustom ? "Filtro: Personalizado" : "Filtro: Por Mes"}
          </Button>

          {!isCustom && (
            <>
              {/* SELECT DE AÑO */}
              <select
                value={localYear}
                onChange={(e) => setLocalYear(e.target.value)}
                className="h-10 rounded-md border border-input bg-muted/50 px-4 py-2 text-sm font-medium transition-colors text-muted-foreground shadow-sm"
              //    className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-muted-foreground outline-none focus:outline-none focus:border-purple-600 focus:ring-0 transition-all cursor-pointer"

              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* CONTENEDOR DE MESES */}
              <div className="flex items-center gap-1 rounded-md border border-input bg-muted/50 p-1 shadow-sm">
  {months.map((m) => (
    <button
      key={m}
      onClick={() => setLocalMonth(m)}
      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors outline-none focus:outline-none focus:ring-0 ${
        localMonth === m
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {m}
    </button>
  ))}
</div>
            </>
          )}

          {/* MODO B: INPUT DINÁMICO PARA EL 'FROM' PERSONALIZADO */}
          {isCustom && (
            <div className="flex items-end gap-2">

  <div className="flex flex-col">
    <input
      type="date"
      value={localFrom}
      onChange={(e) => setLocalFrom(e.target.value)}
      className="h-10 rounded-md border border-input bg-muted/50 px-4 py-2 text-sm font-medium transition-colors text-muted-foreground outline-none focus:outline-none focus:border-purple-600 focus:ring-0 shadow-sm"
    />
  </div>
  
  <div className="flex flex-col">
    {/* Se agrega 'flex items-center' para nivelar la altura del texto internamente */}
    <div className="h-10 flex items-center rounded-md border border-input bg-muted/50 px-4 text-sm font-medium transition-colors text-muted-foreground shadow-sm">
      {localFrom ? "+30 días automático" : "Esperando fecha..."}
    </div>
  </div>
</div>
          )}
        </div>
      </div>

      {/* FILA INFERIOR: BARRA DE BÚSQUEDA Y BOTÓN DE CONSULTA */}
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pegar ID de usuario/candidato aquí..."
            value={localSearchId}
            onChange={(e) => setLocalSearchId(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:outline-none focus:border-purple-600 focus:ring-0 transition-all text-foreground placeholder:text-muted-foreground/70 shadow-sm"
          />
        </div>
        
        <Button 
          onClick={handleQuery}
          className="h-10 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-medium px-4 flex gap-2 rounded-lg transition-all shadow-sm"
        >
          <Send className="h-4 w-4" />
          Consultar
        </Button>
      </div>
    </div>
  )
}