"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { MRRKPICard } from "@/components/dashboard/mrr-kpi-card"
import { ARPUKPICard } from "@/components/dashboard/arpu-kpi-card"
import { CompanyActivosKPICard } from "@/components/dashboard/company-activos-kpi-card"
import { CACRatioKPICard } from "@/components/dashboard/cac-ratio-kpi-card"
import { ExpansionKPICard } from "@/components/dashboard/expansion-kpi-card"
import { DowngradeKPICard } from "@/components/dashboard/downgrade-kpi-card"
import { ChurnKPICard } from "@/components/dashboard/churn-kpi-card"
import { TasaRetencionKPICard } from "@/components/dashboard/tasa-retencion-kpi-card"
import { MRRMetricsChart } from "@/components/dashboard/mrr-metrics-chart"
import { ARRMetricsChart } from "@/components/dashboard/arr-metrics-chart"
import { CACVsLTVChart } from "@/components/dashboard/cac-vs-ltv-chart"
import { DollarChurnChart } from "@/components/dashboard/dollar-churn-chart"
import { CACPaybackChart } from "@/components/dashboard/cac-payback-chart"
import { NRRGRRChart } from "@/components/dashboard/nrr-grr-chart"
import { ARPAClientesChart } from "@/components/dashboard/arpa-clientes-chart"
import { TicketPromedioChart } from "@/components/dashboard/ticket-promedio-chart"
import { DCPAMRPAChart } from "@/components/dashboard/dcpa-mrpa-chart"
import { KFactorChurnChart } from "@/components/dashboard/k-factor-churn-chart"
import { CohortAnalysisChart } from "@/components/dashboard/cohort-analysis-chart"
import { FiltersProvider } from "@/lib/contexts/filters-context"

export default function DashboardMVP() {

  return (
    <FiltersProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col lg:ml-64">
          <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          <DashboardFilters />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <ARPUKPICard />
            <CACRatioKPICard />
            <CompanyActivosKPICard />
            <ChurnKPICard />
            <TasaRetencionKPICard />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <ExpansionKPICard />
            <DowngradeKPICard />
            <MRRKPICard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <MRRMetricsChart />
            <ARRMetricsChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DCPAMRPAChart />
            <DollarChurnChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CACPaybackChart />
            <NRRGRRChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ARPAClientesChart />
            <CACVsLTVChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TicketPromedioChart />
            <KFactorChurnChart />
          </div>

          <div className="w-full mb-6">
            <CohortAnalysisChart />
          </div>
        </main>
        </div>
      </div>
    </FiltersProvider>
  )
}
