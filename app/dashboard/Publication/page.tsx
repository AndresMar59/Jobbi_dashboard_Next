"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { TalentSearchHeader } from "@/components/Talent/TalentSearchHeader"
import { CompanySummaryView } from "@/components/Talent/SummaryView"
import { PostingDetailView } from "@/components/Talent/Posting_Metrics"
import { useState } from "react"

export default function PublicationPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [searchType, setSearchType] = useState<"company" | "posting">("company")

  const handleSearch = (type: string, id: string) => {
    setSearchType(type as any)
    setActiveId(id || null)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          {/* Cabecera y Buscador */}
          <div className="mb-8">
            <TalentSearchHeader onSearch={handleSearch} />
          </div>

          {/* Renderizado de Métricas siguiendo tu estructura de Grid */}
          {searchType === "company" ? (
            <CompanySummaryView companyId={activeId} />
          ) : (
            <PostingDetailView postingId={activeId} />
          )}
        </main>
      </div>
    </div>
  )
}