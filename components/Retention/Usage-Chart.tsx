export function UsageChart() {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
  
  return (
    <div className="h-[300px] w-full flex flex-col justify-between pt-4">
      <div className="relative flex-1 flex items-end justify-around gap-2 px-2">
        {/* Líneas de fondo (Grid) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="w-full border-t border-muted/50 border-dashed" />
          ))}
        </div>

        {/* Barras */}
        {months.map((month, i) => {
          const heightUsado = [40, 65, 50, 85, 70, 90][i]
          const heightOtorgado = 95 // Siempre un poco más alto
          
          return (
            <div key={month} className="relative flex flex-col items-center w-full group h-full justify-end">
              {/* Barra Otorgada (Fondo claro) */}
              <div 
                style={{ height: `${heightOtorgado}%` }} 
                className="w-10 bg-primary/10 rounded-t-sm transition-all group-hover:bg-primary/20" 
              />
              {/* Barra Usada (Color sólido) */}
              <div 
                style={{ height: `${heightUsado}%` }} 
                className="w-10 bg-primary rounded-t-sm absolute bottom-0 transition-all group-hover:brightness-110" 
              />
              <span className="text-[10px] text-muted-foreground mt-2 uppercase font-medium">{month}</span>
            </div>
          )
        })}
      </div>
      
      {/* Leyenda */}
      <div className="flex gap-4 mt-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/20 rounded-sm" />
          <span className="text-xs text-muted-foreground">Otorgados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-sm" />
          <span className="text-xs text-muted-foreground">Usados</span>
        </div>
      </div>
    </div>
  )
}