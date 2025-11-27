"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"

export default function UnitEconomicsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Unit Economics & Eficiencia</h1>
            <p className="text-muted-foreground">
              Analiza métricas unitarias, CAC, LTV y eficiencia económica por cliente
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Contenido de Unit Economics & Eficiencia próximamente</p>
          </div>
        </main>
      </div>
    </div>
  )
}
