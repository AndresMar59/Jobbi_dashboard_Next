"use client"

export function MVPFilters() {
  return (
    <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <button className="px-4 py-2 rounded-lg border-2 border-primary bg-background text-foreground hover:bg-primary/10 transition-colors font-medium text-sm">
        Filtro de Fechas
      </button>
      <button className="px-4 py-2 rounded-lg border-2 border-red-400 bg-background text-foreground hover:bg-red-50 transition-colors font-medium text-sm">
        Filtro de tipos de empresas
      </button>
      <button className="px-4 py-2 rounded-lg border-2 border-red-400 bg-background text-foreground hover:bg-red-50 transition-colors font-medium text-sm">
        Tipo busqueda
      </button>
      <button className="px-4 py-2 rounded-lg border-2 border-red-400 bg-background text-foreground hover:bg-red-50 transition-colors font-medium text-sm">
        Posiciones...
      </button>
      <button className="px-4 py-2 rounded-lg border-2 border-red-400 bg-background text-foreground hover:bg-red-50 transition-colors font-medium text-sm">
        Planes...
      </button>
      <button className="px-4 py-2 rounded-lg border-2 border-red-400 bg-background text-foreground hover:bg-red-50 transition-colors font-medium text-sm">
        Creditos usados...
      </button>
    </div>
  )
}
