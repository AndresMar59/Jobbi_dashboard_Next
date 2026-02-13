"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
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
            
            <div className="text-center py-12">
              <p className="text-muted-foreground">Los gráficos de retención se han integrado a la página de Overview</p>
            </div>
          </main>
        </div>
      </div>
    </FiltersProvider>
  )
}
