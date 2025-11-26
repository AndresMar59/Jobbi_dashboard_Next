import { ArrowUpIcon, ArrowDownIcon, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: LucideIcon
}

export function KPICard({ title, value, change, trend, icon: Icon }: KPICardProps) {
  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground tracking-tight">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 text-xs mt-1">
          {trend === "up" ? (
            <ArrowUpIcon className="h-3 w-3 text-chart-1" />
          ) : (
            <ArrowDownIcon className="h-3 w-3 text-chart-2" />
          )}
          <span className={cn("font-medium", trend === "up" ? "text-chart-1" : "text-chart-2")}>{change}</span>
          <span className="text-muted-foreground">vs mes anterior</span>
        </div>
      </div>
    </div>
  )
}
