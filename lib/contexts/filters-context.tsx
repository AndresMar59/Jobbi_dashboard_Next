"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// ============================================
// TIPOS
// ============================================

export interface FiltersState {
  year: string
  month: string
  plan: string
}

export interface FiltersContextValue {
  filters: FiltersState
  setYear: (year: string) => void
  setMonth: (month: string) => void
  setPlan: (plan: string) => void
  resetFilters: () => void
}

// ============================================
// VALORES POR DEFECTO
// ============================================

const defaultFilters: FiltersState = {
  year: "2026",
  month: "Todos",
  plan: "Todos",
}

// ============================================
// CONTEXTO
// ============================================

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined)

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters)

  const setYear = (year: string) => {
    setFilters((prev) => ({ ...prev, year }))
  }

  const setMonth = (month: string) => {
    setFilters((prev) => ({ ...prev, month }))
  }

  const setPlan = (plan: string) => {
    setFilters((prev) => ({ ...prev, plan }))
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  return (
    <FiltersContext.Provider
      value={{
        filters,
        setYear,
        setMonth,
        setPlan,
        resetFilters,
      }}
    >
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FiltersContext)
  if (context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider")
  }
  return context
}
