"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function PostingDetailView({ postingId }: { postingId: string | null }) {
  return (
    <div className="space-y-6">
      {/* Header de la Vacante */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
           <h2 className="text-2xl font-bold">Senior Software Engineer</h2>
           <p className="text-muted-foreground text-sm">ID: {postingId || "Global View"}</p>
        </div>
        <div className="flex justify-end items-center">
           <Badge>Status: Active</Badge>
        </div>
      </div>

      {/* Grid de 2 columnas para métricas de la vacante */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Source Breakdown</CardTitle></CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
             <p className="text-xs text-muted-foreground">Chart: LinkedIn vs Website</p>
          </CardContent>
        </Card>
        
        {/* Tabla de Candidatos - Ocupando espacio similar a un chart */}
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Top Candidates</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Match</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-sm font-medium">John Doe</TableCell>
                  <TableCell><Progress value={92} className="h-2 w-20" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}