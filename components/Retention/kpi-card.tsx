import { ReactNode } from "react"

interface KpiCardProps {
  title: string
  value: string
  icon: ReactNode
  description?: string
  trend?: string
  status?: "default" | "warning"
}

export function KpiCard({ title, value, icon, description, trend, status }: KpiCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-muted/50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {trend}
            </span>
          )}
          <p className="text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        </div>
        {status === "warning" && (
          <div className="mt-3 h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-[85%]" />
          </div>
        )}
      </div>
    </div>
  )
}