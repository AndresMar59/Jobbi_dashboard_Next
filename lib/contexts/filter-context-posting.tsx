"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// ============================================
// TIPOS
// ============================================

export interface FiltersState {
  type: string;
  searchId: string; // Nuevo: para el ID del input
}
// Creamos la interfaz FiltersContextValue que define la forma del contexto, incluyendo el estado de los filtros y las funciones para actualizarlo

export interface FiltersContextValue {
  filters: FiltersState
  setType: (type: string) => void
  setSearchId: (id: string) => void // Nueva función
  resetFilters: () => void
}

// ============================================
// VALORES POR DEFECTO
// ============================================

const defaultFilters: FiltersState = {
  type: "/metrics-postings/summary-type?type_id=",
  searchId: ""
}

// ============================================
// CONTEXTO
// ============================================

// Crea el "recipiente" donde vivirá la información.
const FiltersContext = createContext<FiltersContextValue | undefined>(undefined)
// La funcion espera un compoenente. Lo definis como ReactNode porq es cualquier cosa que se pueda renderizar en React (un componente, un string, etc). Esta funcion es la encargada de proveer el contexto a los componentes hijos.
export function FiltersProvider({ children }: { children: ReactNode }) {
  // El estado inicial del contexto se define con useState, y se inicializa con los valores por defecto definidos anteriormente. El estado incluye el año y el mes seleccionados, y las funciones para actualizar estos valores.
  // Estas creado dos varibales. Que usan dos elementos proveidos poor la interfaz FilterState, y agregar los valores por fault con la variable anteriormente creada
  const [filters, setFilters] = useState<FiltersState>(defaultFilters)


  // Es importante el prev, para solo sobreescribir la varaible a actualizar y no perder el valor de la otra variable. Por ejemplo, si solo actualizas el año, el mes se mantiene igual.
  const setType = (type: string) => {
    setFilters((prev) => ({ ...prev, type }))
  }

  const setSearchId = (searchId: string) => {
  setFilters((prev) => ({ ...prev, searchId }))
}

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  return (
    <FiltersContext.Provider
      value={{
        filters,
        setSearchId,
        setType,
        resetFilters
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



