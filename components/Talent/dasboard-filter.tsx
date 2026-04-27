"use client"

import { useState } from "react"
import { useFilters } from "@/lib/contexts/filter-context-posting"
import { Search, Send } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

export function DashboardFilters() {
  const { filters, setType, setSearchId } = useFilters()
  // Estado local para que no busque mientras escribes
  const [localId, setLocalId] = useState(filters.searchId || "")

  const handleSearch = () => {
    setSearchId(localId)
  }

  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg h-12 items-center px-2">
      <select
        value={filters.type}
        onChange={(e) => setType(e.target.value)}
        className="h-9 rounded-md border-none bg-background px-3 text-sm font-medium focus:ring-2 focus:ring-ring"
      >
        <option value="metrics-postings/summary-company?Company_id=">Company</option>
        <option value="metrics-postings/metrics-posting?posting_id=">Posting</option>
      </select>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          className="pl-9 h-9 bg-background border-none"
          placeholder="Pegar ID aquí..."
          value={localId} 
          onChange={(e) => setLocalId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // Buscar al presionar Enter
        />
      </div>

      <Button 
        onClick={handleSearch} 
        size="sm" 
        className="h-9 gap-2"
      >
        <Send className="h-4 w-4" />
        Consultar
      </Button>
    </div>
  )
}