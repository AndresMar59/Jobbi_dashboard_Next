"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { KPICard } from "@/components/dashboard/kpi-card-clean"
import { KFactorChurnChart } from "@/components/dashboard/k-factor-churn-chart"
import { CohortAnalysisChart } from "@/components/dashboard/cohort-analysis-chart"
import { RetentionMetricsTable } from "@/components/dashboard/retention-metrics-table"
import { FiltersProvider } from "@/lib/contexts/filters-context"
import { Users, Percent, DollarSign, UserCheck } from "lucide-react"

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
              <KPICard title="# Churn" value="42" change="-5.3% vs mes anterior" icon={Users} trend="down" />
              <KPICard title="MRR %" value="8.7%" change="+2.1% vs mes anterior" icon={Percent} trend="up" />
              <KPICard title="$ Churn" value="$12,450" change="-8.2% vs mes anterior" icon={DollarSign} trend="down" />
              <KPICard title="Tasa de retención" value="805" change="+6.5% vs mes anterior" icon={UserCheck} trend="up" />
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
