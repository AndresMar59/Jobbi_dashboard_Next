"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { KFactorChurnChart } from "@/components/dashboard/k-factor-churn-chart"

export default function RetentionPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Retención & Salud</h1>
            <p className="text-muted-foreground">
              Monitorea la retención de clientes, análisis de cohortes y salud del negocio
            </p>
          </div>

          <div className="grid gap-6">
            <KFactorChurnChart />
          </div>
        </main>
      </div>
    </div>
  )
}
