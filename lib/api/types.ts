/**
 * Tipos e interfaces para los datos del microservicio
 * Define aquí las estructuras de datos que devuelve tu API
 */

// ============================================
// TIPOS BASE - Respuestas del microservicio
// ============================================

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// ============================================
// MRR - Respuesta del endpoint /micro/mrr
// ============================================

// Estructura: { [plan]: { [mes]: { [company_id]: { mrr, subscriptions } } } }
export interface MRRCompanyData {
  mrr: number
  subscriptions: number
}

export interface MRRMonthData {
  [companyId: string]: MRRCompanyData
}

export interface MRRPlanData {
  [month: string]: MRRMonthData
}

export interface MRRResponse {
  [plan: string]: MRRPlanData
}

// Datos procesados de MRR para uso en gráficas
export interface MRRProcessed {
  totalMRR: number
  mrrByPlan: { plan: string; mrr: number; subscriptions: number }[]
  mrrByMonth: { month: string; mrr: number }[]
  totalSubscriptions: number
}

// ============================================
// KPIs - Tarjetas de métricas principales
// ============================================

export interface KPIData {
  value: number | string
  change: number // Porcentaje de cambio vs periodo anterior
  trend: "up" | "down" | "neutral"
}

export interface DashboardKPIs {
  arpu: KPIData
  cacRatio: KPIData
  companyActivos: KPIData
  expansiones: KPIData
  downgrade: KPIData
  mrr: KPIData
}

// ============================================
// GRÁFICAS - Datos para visualizaciones
// ============================================

// ARR Metrics Chart
export interface ARRMetricsDataPoint {
  mes: string
  churnARR: number
  expansionARR: number
  netNewARR: number
  newDinero: number
}

// CAC Payback Chart
export interface CACPaybackDataPoint {
  mes: string
  cacPayback: number
}

// CAC vs LTV Chart
export interface CACLTVData {
  cac: number
  ltv: number
}

// DCPA vs MRPA Chart
export interface DCPAMRPADataPoint {
  mes: string
  dcpa: number
  mrpa: number
}

// Ticket Promedio Chart
export interface TicketPromedioDataPoint {
  mes: string
  ticket: number
}

// ============================================
// RETENCIÓN - Página de retención
// ============================================

export interface RetentionKPIs {
  tasaRetencion: KPIData
  churnRate: KPIData
  nps: KPIData
  healthScore: KPIData
}

export interface RetentionCohorteDataPoint {
  mes: string
  retencion: number
}

export interface ChurnAnalysisDataPoint {
  mes: string
  churn: number
  recovered: number
}

// ============================================
// MÉTRICAS CALCULADAS - Variables derivadas
// ============================================

export interface CalculatedMetrics {
  // Ratio LTV/CAC
  ltvCacRatio: number
  // Payback period en meses
  paybackMonths: number
  // Net Revenue Retention
  nrr: number
  // Gross Revenue Retention
  grr: number
}
