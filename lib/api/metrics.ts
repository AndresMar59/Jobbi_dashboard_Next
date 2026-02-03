/**
 * Servicios para obtener métricas del microservicio
 * Aquí defines las funciones que llaman a cada endpoint de tu API
 */

import { api } from "./client"
import type {
  DashboardKPIs,
  ARRMetricsDataPoint,
  CACPaybackDataPoint,
  CACLTVData,
  DCPAMRPADataPoint,
  TicketPromedioDataPoint,
  RetentionKPIs,
  RetentionCohorteDataPoint,
  ChurnAnalysisDataPoint,
  CalculatedMetrics,
} from "./types"

// ============================================
// DASHBOARD - Página principal
// ============================================

/**
 * Obtiene los KPIs principales del dashboard
 * TODO: Actualizar endpoint cuando esté disponible
 */
export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  // return api.get<DashboardKPIs>("/dashboard/kpis")
  
  // Datos de ejemplo mientras se configura el endpoint real
  return {
    arpu: { value: 125.50, change: 12.3, trend: "up" },
    cacRatio: { value: "3.2x", change: 5.1, trend: "up" },
    companyActivos: { value: 847, change: 15.3, trend: "up" },
    expansiones: { value: 23, change: 8.7, trend: "up" },
    downgrade: { value: 5, change: -3.2, trend: "down" },
    mrr: { value: "8.7%", change: 4.5, trend: "up" },
  }
}

/**
 * Obtiene datos para el gráfico ARR Metrics
 */
export async function getARRMetrics(): Promise<ARRMetricsDataPoint[]> {
  // return api.get<ARRMetricsDataPoint[]>("/metrics/arr")
  
  return [
    { mes: "Ene", churnARR: 2000, expansionARR: 8000, netNewARR: 12000, newDinero: 5000 },
    { mes: "Feb", churnARR: 2500, expansionARR: 9000, netNewARR: 13000, newDinero: 5500 },
    { mes: "Mar", churnARR: 2200, expansionARR: 10000, netNewARR: 14000, newDinero: 6000 },
    { mes: "Abr", churnARR: 2800, expansionARR: 11000, netNewARR: 15000, newDinero: 7000 },
    { mes: "May", churnARR: 3000, expansionARR: 12000, netNewARR: 16000, newDinero: 8000 },
    { mes: "Jun", churnARR: 2700, expansionARR: 14000, netNewARR: 18000, newDinero: 9000 },
    { mes: "Jul", churnARR: 3200, expansionARR: 15000, netNewARR: 20000, newDinero: 10000 },
    { mes: "Ago", churnARR: 3500, expansionARR: 17000, netNewARR: 22000, newDinero: 11000 },
    { mes: "Sep", churnARR: 3300, expansionARR: 18000, netNewARR: 24000, newDinero: 12000 },
    { mes: "Oct", churnARR: 4000, expansionARR: 20000, netNewARR: 26000, newDinero: 13000 },
    { mes: "Nov", churnARR: 3800, expansionARR: 22000, netNewARR: 28000, newDinero: 14000 },
    { mes: "Dic", churnARR: 4200, expansionARR: 24000, netNewARR: 30000, newDinero: 15000 },
  ]
}

/**
 * Obtiene datos para el gráfico CAC Payback
 */
export async function getCACPayback(): Promise<CACPaybackDataPoint[]> {
  // return api.get<CACPaybackDataPoint[]>("/metrics/cac-payback")
  
  return [
    { mes: "Ene", cacPayback: 10 },
    { mes: "Feb", cacPayback: 9 },
    { mes: "Mar", cacPayback: 10 },
    { mes: "Abr", cacPayback: 11 },
    { mes: "May", cacPayback: 12 },
    { mes: "Jun", cacPayback: 13 },
    { mes: "Jul", cacPayback: 14 },
    { mes: "Ago", cacPayback: 15 },
    { mes: "Sep", cacPayback: 16 },
    { mes: "Oct", cacPayback: 18 },
    { mes: "Nov", cacPayback: 20 },
    { mes: "Dic", cacPayback: 22 },
  ]
}

/**
 * Obtiene datos para el gráfico CAC vs LTV
 */
export async function getCACvsLTV(): Promise<CACLTVData> {
  // return api.get<CACLTVData>("/metrics/cac-ltv")
  
  return {
    cac: 6.5,
    ltv: 25,
  }
}

/**
 * Obtiene datos para el gráfico DCPA vs MRPA
 */
export async function getDCPAMRPA(): Promise<DCPAMRPADataPoint[]> {
  // return api.get<DCPAMRPADataPoint[]>("/metrics/dcpa-mrpa")
  
  return [
    { mes: "Ene", dcpa: 100, mrpa: 120 },
    { mes: "Feb", dcpa: 110, mrpa: 130 },
    { mes: "Mar", dcpa: 105, mrpa: 125 },
    { mes: "Abr", dcpa: 115, mrpa: 140 },
    { mes: "May", dcpa: 120, mrpa: 145 },
    { mes: "Jun", dcpa: 130, mrpa: 155 },
    { mes: "Jul", dcpa: 125, mrpa: 150 },
    { mes: "Ago", dcpa: 135, mrpa: 160 },
    { mes: "Sep", dcpa: 140, mrpa: 165 },
    { mes: "Oct", dcpa: 145, mrpa: 170 },
    { mes: "Nov", dcpa: 150, mrpa: 175 },
    { mes: "Dic", dcpa: 155, mrpa: 180 },
  ]
}

/**
 * Obtiene datos para el gráfico Ticket Promedio
 */
export async function getTicketPromedio(): Promise<TicketPromedioDataPoint[]> {
  // return api.get<TicketPromedioDataPoint[]>("/metrics/ticket-promedio")
  
  return [
    { mes: "Ene", ticket: 45 },
    { mes: "Feb", ticket: 48 },
    { mes: "Mar", ticket: 52 },
    { mes: "Abr", ticket: 49 },
    { mes: "May", ticket: 55 },
    { mes: "Jun", ticket: 58 },
    { mes: "Jul", ticket: 62 },
    { mes: "Ago", ticket: 59 },
    { mes: "Sep", ticket: 65 },
    { mes: "Oct", ticket: 68 },
    { mes: "Nov", ticket: 72 },
    { mes: "Dic", ticket: 75 },
  ]
}

// ============================================
// RETENCIÓN - Página de retención
// ============================================

/**
 * Obtiene los KPIs de la página de retención
 */
export async function getRetentionKPIs(): Promise<RetentionKPIs> {
  // return api.get<RetentionKPIs>("/retention/kpis")
  
  return {
    tasaRetencion: { value: 805, change: 6.5, trend: "up" },
    churnRate: { value: "2.3%", change: -0.5, trend: "up" },
    nps: { value: 72, change: 5, trend: "up" },
    healthScore: { value: "85%", change: 3.2, trend: "up" },
  }
}

/**
 * Obtiene datos de retención por cohorte
 */
export async function getRetentionCohorte(): Promise<RetentionCohorteDataPoint[]> {
  // return api.get<RetentionCohorteDataPoint[]>("/retention/cohorte")
  
  return [
    { mes: "Ene", retencion: 100 },
    { mes: "Feb", retencion: 95 },
    { mes: "Mar", retencion: 90 },
    { mes: "Abr", retencion: 87 },
    { mes: "May", retencion: 85 },
    { mes: "Jun", retencion: 83 },
  ]
}

/**
 * Obtiene datos de análisis de churn
 */
export async function getChurnAnalysis(): Promise<ChurnAnalysisDataPoint[]> {
  // return api.get<ChurnAnalysisDataPoint[]>("/retention/churn-analysis")
  
  return [
    { mes: "Ene", churn: 5, recovered: 2 },
    { mes: "Feb", churn: 8, recovered: 3 },
    { mes: "Mar", churn: 6, recovered: 4 },
    { mes: "Abr", churn: 7, recovered: 3 },
    { mes: "May", churn: 4, recovered: 2 },
    { mes: "Jun", churn: 5, recovered: 3 },
  ]
}

// ============================================
// MÉTRICAS CALCULADAS
// ============================================

/**
 * Calcula métricas derivadas basadas en los datos del microservicio
 */
export function calculateMetrics(
  cac: number,
  ltv: number,
  monthlyRevenue: number
): CalculatedMetrics {
  return {
    ltvCacRatio: ltv / cac,
    paybackMonths: cac / (monthlyRevenue / 12),
    nrr: 0, // TODO: Calcular con datos reales
    grr: 0, // TODO: Calcular con datos reales
  }
}
