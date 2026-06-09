"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// ============================================
// TIPOS
// ============================================

export interface CustomRangeState {
  active: boolean;
  fromDate: string | null;
  toDate: string | null;
}

export interface FiltersState {
  year: string;
  month: string;
  searchId: string;
  customRange: CustomRangeState; // Añadimos la sub-estructura
}

// Extendemos la interfaz para incluir la nueva función actualizadora
export interface FiltersContextValue {
  filters: FiltersState
  setYear: (year: string) => void
  setMonth: (month: string) => void
  setSearchId: (searchId: string) => void
  setCustomRange: (customRange: CustomRangeState) => void // Nueva función
  resetFilters: () => void
}

// ============================================
// VALORES POR DEFECTO
// ============================================

const defaultFilters: FiltersState = {
  year: "2026",
  month: "Ene",
  searchId: "",
  customRange: {
    active: false,
    fromDate: null,
    toDate: null
  }
}

// Crea el "recipiente" donde vivirá la información.
const FiltersContext = createContext<FiltersContextValue | undefined>(undefined)

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters)

  // Respetamos tu lógica del 'prev' para no perder las otras variables del estado
  const setYear = (year: string) => {
    setFilters((prev) => ({ ...prev, year }))
  }

  const setSearchId = (searchId: string) => {
    setFilters((prev) => ({ ...prev, searchId }))
  }

  const setMonth = (month: string) => {
    setFilters((prev) => ({ ...prev, month }))
  }

  // Nueva función encargada de mutar el objeto del rango personalizado de forma segura
  const setCustomRange = (customRange: CustomRangeState) => {
    setFilters((prev) => ({ ...prev, customRange }))
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
        setSearchId,
        setCustomRange, // Lo inyectamos en el Provider
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