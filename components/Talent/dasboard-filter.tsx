"use client"

import { useState } from "react"
import { useFilters } from "@/lib/contexts/filter-context-posting"
import { Search, Send } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

export function DashboardFilters() {
  const { filters, setType, setSearchId } = useFilters();
  const [localId, setLocalId] = useState(""); 

  // FUNCIÓN CLAVE: Limpia todo al cambiar el selector
  const handleTypeChange = (newType: string) => {
    setType(newType);    // Limpia el contexto global
    setLocalId("");      // Limpia el texto visual del input
  };

  const handleSearch = () => {
    setSearchId(localId); 
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      <select
        value={filters.type}
        onChange={(e) => handleTypeChange(e.target.value)} // <--- Usa la nueva función
        className="h-10 rounded-md border border-input bg-muted/50 px-4 py-2 text-sm font-medium transition-colors text-muted-foreground shadow-sm"
      >
        <option value="metrics-postings/summary-company?company_id=">Company</option>
        <option value="metrics-postings?posting_id=">Posting</option>
      </select>

      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm transition-all text-foreground placeholder:text-muted-foreground/70 shadow-sm outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-purple-600 shadow-sm"
          placeholder="Pegar ID aquí..."
          value={localId} // Conectado al estado local que ahora se limpia
          onChange={(e) => setLocalId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      <Button 
        onClick={handleSearch} 
        className="h-10 px-6 bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-lg shadow-sm flex gap-2 font-medium shadow-sm"
      >
        <Send className="h-4 w-4" />
        Consultar
      </Button>
    </div>
  )
}