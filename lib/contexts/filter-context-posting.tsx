"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// 1. Tipos de estado
export interface FiltersState {
  type: string;
  searchId: string;
}

// 2. Definición de la interfaz del contexto
export interface FiltersContextValue {
  filters: FiltersState
  setType: (type: string) => void
  setSearchId: (id: string) => void
  resetFilters: () => void
}

const defaultFilters: FiltersState = {
  type: "metrics-postings/summary-company?company_id=",
  searchId: ""
}

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined)

// 3. EL PROVEEDOR (Aquí estaba el error de nombre)
export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters)

  // Limpia el searchId al cambiar el tipo para que las tarjetas no busquen basura
  const setType = (type: string) => {
    setFilters({
      type: type,
      searchId: "" 
    })
  }

  const setSearchId = (searchId: string) => {
    setFilters((prev) => ({ ...prev, searchId }))
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  return (
    <FiltersContext.Provider value={{ filters, setSearchId, setType, resetFilters }}>
      {children}
    </FiltersContext.Provider>
  )
}

// 4. EL HOOK (Para usar en los componentes)
export function useFilters() {
  const context = useContext(FiltersContext)
  if (context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider")
  }
  return context
}