interface MVPKPICardProps {
  title: string
  value: string
}

export function MVPKPICard({ title, value }: MVPKPICardProps) {
  return (
    <div className="rounded-lg border-2 border-blue-400 bg-card p-4 hover:shadow-md transition-shadow">
      <p className="text-xs font-medium text-foreground mb-2 text-center">{title}</p>
      <p className="text-2xl font-bold text-foreground text-center">{value}</p>
    </div>
  )
}
