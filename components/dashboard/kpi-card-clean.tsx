import { type LucideIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  trend: "up" | "down"
}

export function KPICard({ title, value, change, icon: Icon, trend }: KPICardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold text-card-foreground mb-2">{value}</p>
      <div className="flex items-center gap-1 text-sm">
        {trend === "up" ? (
          <TrendingUpIcon className="h-4 w-4 text-sidebar" />
        ) : (
          <TrendingDownIcon className="h-4 w-4 text-red-500" />
        )}
        <span className={trend === "up" ? "text-sidebar" : "text-red-500"}>{change}</span>
      </div>
    </div>
  )
}
