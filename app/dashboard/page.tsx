"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { KPICard } from "@/components/dashboard/kpi-card-clean"
import { ARRMetricsChart } from "@/components/dashboard/arr-metrics-chart"
import { MarginGananciaChart } from "@/components/dashboard/margin-ganancia-chart"
import { CACLTVChart } from "@/components/dashboard/cac-ltv-chart"
import { DollarChurnChart } from "@/components/dashboard/dollar-churn-chart"
import { CACPaybackChart } from "@/components/dashboard/cac-payback-chart"
import { NRRGRRChart } from "@/components/dashboard/nrr-grr-chart"
import { DollarSign, Users, TrendingUp, TrendingDown, Activity, Percent } from "lucide-react"

export default function DashboardMVP() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          <DashboardFilters />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <KPICard
              title="ARPU (Revenue per clientes)"
              value="$125.50"
              change="+12.3% vs mes anterior"
              icon={DollarSign}
              trend="up"
            />
            <KPICard title="CAC RATIO" value="3.2x" change="+5.1% vs mes anterior" icon={TrendingUp} trend="up" />
            <KPICard title="# Company Activos" value="847" change="+15.3% vs mes anterior" icon={Users} trend="up" />
            <KPICard title="Margen Ganancia" value="42%" change="-2.1% vs mes anterior" icon={Percent} trend="down" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard title="Expanciones" value="23" change="+8.7% vs mes anterior" icon={TrendingUp} trend="up" />
            <KPICard title="Downgrade" value="5" change="-3.2% vs mes anterior" icon={TrendingDown} trend="down" />
            <KPICard
              title="% Sobre company activos"
              value="15.3%"
              change="+2.1% vs mes anterior"
              icon={Activity}
              trend="up"
            />
            <KPICard title="% MRR" value="8.7%" change="+4.5% vs mes anterior" icon={Percent} trend="up" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ARRMetricsChart />
            <MarginGananciaChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DollarChurnChart />
            <CACPaybackChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <NRRGRRChart />
            <CACLTVChart />
          </div>
        </main>
      </div>
    </div>
  )
}
