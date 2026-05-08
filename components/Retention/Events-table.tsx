export function EventsTable() {
  const events = [
    { name: "Búsqueda de Talento (AI)", credits: "85,200", companies: 142, avg: "600", trend: "up" },
    { name: "Verificación de Antecedentes", credits: "12,400", companies: 64, avg: "193", trend: "down" },
    { name: "Sourcing Externo", credits: "4,100", companies: 12, avg: "341", trend: "stable" },
    { name: "Publicación Premium", credits: "2,800", companies: 28, avg: "100", trend: "up" },
  ]

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="p-4 text-left font-semibold text-muted-foreground">Evento de Sistema</th>
            <th className="p-4 text-left font-semibold text-muted-foreground">Créditos Totales</th>
            <th className="p-4 text-left font-semibold text-muted-foreground">N° Empresas</th>
            <th className="p-4 text-right font-semibold text-muted-foreground">Promedio / Empresa</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {events.map((item, idx) => (
            <tr key={idx} className="hover:bg-muted/20 transition-colors">
              <td className="p-4 font-medium flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  item.trend === 'up' ? 'bg-amber-400' : 'bg-blue-400'
                }`} />
                {item.name}
              </td>
              <td className="p-4 tabular-nums">{item.credits}</td>
              <td className="p-4 tabular-nums">{item.companies}</td>
              <td className="p-4 text-right tabular-nums font-semibold">
                {item.avg} <span className="text-[10px] text-muted-foreground ml-1">CR</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}