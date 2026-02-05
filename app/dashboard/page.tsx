"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { KPICard } from "@/components/dashboard/kpi-card-clean"
import { MRRKPICard } from "@/components/dashboard/mrr-kpi-card"
import { ARPUKPICard } from "@/components/dashboard/arpu-kpi-card"
import { CompanyActivosKPICard } from "@/components/dashboard/company-activos-kpi-card"
import { CACRatioKPICard } from "@/components/dashboard/cac-ratio-kpi-card"
import { ARRMetricsChart } from "@/components/dashboard/arr-metrics-chart"
import { CACLTVChart } from "@/components/dashboard/cac-ltv-chart"
import { DollarChurnChart } from "@/components/dashboard/dollar-churn-chart"
import { CACPaybackChart } from "@/components/dashboard/cac-payback-chart"
import { NRRGRRChart } from "@/components/dashboard/nrr-grr-chart"
import { ARPAClientesChart } from "@/components/dashboard/arpa-clientes-chart"
import { MRR2025Chart } from "@/components/dashboard/mrr-2025-chart"
import { TicketPromedioChart } from "@/components/dashboard/ticket-promedio-chart"
import { DCPAMRPAChart } from "@/components/dashboard/dcpa-mrpa-chart"
import { FiltersProvider } from "@/lib/contexts/filters-context"
import { DollarSign, Users, TrendingUp, TrendingDown } from "lucide-react"

export default function DashboardMVP() {
  return (
    <FiltersProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col lg:ml-64">
          <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          <DashboardFilters />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <ARPUKPICard />
            <CACRatioKPICard />
            <CompanyActivosKPICard />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <KPICard title="Expanciones" value="23" change="+8.7% vs mes anterior" icon={TrendingUp} trend="up" />
            <KPICard title="Downgrade" value="5" change="-3.2% vs mes anterior" icon={TrendingDown} trend="down" />
            <MRRKPICard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ARRMetricsChart />
            <DCPAMRPAChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DollarChurnChart />
            <CACPaybackChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <NRRGRRChart />
            <CACLTVChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ARPAClientesChart />
            <MRR2025Chart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TicketPromedioChart />
          </div>
        </main>
        </div>
      </div>
    </FiltersProvider>
  )
}
