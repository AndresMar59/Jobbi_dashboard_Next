export function CostAnalysisChart() {
  return (
    <div className="h-[300px] w-full flex flex-col">
      <div className="flex-1 flex items-center justify-center relative overflow-hidden group">
        {/* Simulación de un Area Chart con SVG */}
        <svg className="w-full h-full stroke-primary fill-primary/5" viewBox="0 0 400 200">
          <path
            d="M0,150 Q50,140 100,160 T200,100 T300,120 T400,80 L400,200 L0,200 Z"
            strokeWidth="0"
          />
          <path
            d="M0,150 Q50,140 100,160 T200,100 T300,120 T400,80"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Puntos de datos */}
          <circle cx="200" cy="100" r="4" className="fill-background stroke-primary stroke-2" />
          <circle cx="400" cy="80" r="4" className="fill-background stroke-primary stroke-2" />
        </svg>
        
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border rounded-lg p-2 text-[10px] shadow-sm">
          <p className="font-bold text-primary">Actual: $2.45 / cuenta</p>
          <p className="text-muted-foreground">Meta: &lt; $3.00</p>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-xs text-muted-foreground italic">
          Costo directo derivado de facturación de Brex vs. Empresas activas
        </p>
      </div>
    </div>
  )
}