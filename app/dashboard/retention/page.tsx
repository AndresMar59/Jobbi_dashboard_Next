"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { ChurnKPICard } from "@/components/dashboard/churn-kpi-card"
import { MRRPercentKPICard } from "@/components/dashboard/mrr-percent-kpi-card"
import { DollarChurnKPICard } from "@/components/dashboard/dollar-churn-kpi-card"
import { TasaRetencionKPICard } from "@/components/dashboard/tasa-retencion-kpi-card"
import { KFactorChurnChart } from "@/components/dashboard/k-factor-churn-chart"
import { CohortAnalysisChart } from "@/components/dashboard/cohort-analysis-chart"
import { RetentionMetricsTable } from "@/components/dashboard/retention-metrics-table"
import { FiltersProvider } from "@/lib/contexts/filters-context"

export default function RetentionPage() {
  return (
    <FiltersProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col lg:ml-64">
          <Navbar />

          <main className="flex-1 p-6 lg:p-8">
            <DashboardFilters />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <ChurnKPICard />
              <MRRPercentKPICard />
              <DollarChurnKPICard />
              <TasaRetencionKPICard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <KFactorChurnChart />
              <RetentionMetricsTable />
            </div>

            <div className="w-full">
              <CohortAnalysisChart />
            </div>
          </main>
        </div>
      </div>
    </FiltersProvider>
  )
}
