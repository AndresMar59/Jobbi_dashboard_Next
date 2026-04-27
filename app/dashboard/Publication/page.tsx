"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { DashboardFilters } from "@/components/Talent/dasboard-filter"
import { FiltersProvider } from "@/lib/contexts/filter-context-posting"
import {PostingKPICard} from "@/components/Talent/Posting_kpi"


export default function PublicationPage() {


  return (
    <FiltersProvider>

    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">
          <DashboardFilters />
        </main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <PostingKPICard />
        </div>
      </div>
    </div>
    </FiltersProvider>
  )
}