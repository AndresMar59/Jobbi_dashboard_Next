import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { KPICard } from "@/components/dashboard/kpi-card"
import { ChartLine } from "@/components/dashboard/chart-line"
import { ChartBar } from "@/components/dashboard/chart-bar"
import { DollarSign, Users, TrendingUp, Ticket } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          {/* Sección de KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard title="Ingresos Mensuales" value="$45,231" change="+20.1%" trend="up" icon={DollarSign} />
            <KPICard title="Nuevos Usuarios" value="2,350" change="+15.3%" trend="up" icon={Users} />
            <KPICard title="Tasa de Conversión" value="3.24%" change="+2.5%" trend="up" icon={TrendingUp} />
            <KPICard title="Tickets Abiertos" value="12" change="-8.2%" trend="down" icon={Ticket} />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartLine />
            <ChartBar />
          </div>
        </main>
      </div>
    </div>
  )
}
