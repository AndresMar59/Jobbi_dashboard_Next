/**
 * Punto de entrada principal para la capa de API
 * Exporta todos los servicios, tipos y utilidades
 */

// Cliente base
export { api, apiClient } from "./client"

// Tipos e interfaces
export type {
  ApiResponse,
  KPIData,
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
  // MRR
  MRRResponse,
  MRRCompanyData,
  MRRMonthData,
  MRRPlanData,
  MRRProcessed,
  // MRR New
  MRRNewResponse,
  MRRNewProcessed,
  // Churn MRR
  ChurnMRRResponse,
  ChurnMRRProcessed,
  // ARPU
  ARPUResponse,
  ARPUProcessed,
  // LTV
  LTVResponse,
  LTVProcessed,
  // Ticket Promedio
  TicketPromedioResponse,
  TicketPromedioProcessed,
  // Tasa Retention
  TasaRetentionResponse,
  TasaRetentionProcessed,
  // Tasa Churn
  TasaChurnResponse,
  TasaChurnProcessed,
  // Revenue Churn
  RevenueChurnResponse,
  RevenueChurnProcessed,
  // Usuarios Activos
  UsuariosActivosResponse,
  UsuariosActivosProcessed,
  // Usuarios Nuevos
  UsuariosNuevosResponse,
  UsuariosNuevosProcessed,
  // Usuarios Churned
  UsuariosChurnedResponse,
  UsuariosChurnedProcessed,
  // CAC
  CACResponse,
  CACProcessed,
  // Unit Economics
  UnitEconomicsResponse,
  UnitEconomicsProcessed,
  // Expenses
  ExpensesResponse,
  ExpensesProcessed,
  // Income
  IncomeResponse,
  IncomeProcessed,
  // CAC Ratio (métrica calculada)
  CACRatioDataPoint,
  CACRatioProcessed,
  // CAC Payback (métrica calculada)
  CACPaybackCalculatedDataPoint,
  CACPaybackCalculatedProcessed,
  // New ARR (métrica anualizada con proyección)
  NewARRDataPoint,
  NewARRProcessed,
  // Churn ARR (métrica anualizada con proyección)
  ChurnARRDataPoint,
  ChurnARRProcessed,
} from "./types"

// Servicios de métricas
export {
  // MRR
  getMRRRaw,
  getMRR,
  // MRR New
  getMRRNewRaw,
  getMRRNew,
  // Churn MRR
  getChurnMRRRaw,
  getChurnMRR,
  // ARPU
  getARPURaw,
  getARPU,
  // LTV
  getLTVRaw,
  getLTV,
  // Ticket Promedio
  getTicketPromedioRaw,
  getTicketPromedio,
  // Tasa Retention
  getTasaRetentionRaw,
  getTasaRetention,
  // Tasa Churn
  getTasaChurnRaw,
  getTasaChurn,
  // Revenue Churn
  getRevenueChurnRaw,
  getRevenueChurn,
  // Usuarios Activos
  getUsuariosActivosRaw,
  getUsuariosActivos,
  // Usuarios Nuevos
  getUsuariosNuevosRaw,
  getUsuariosNuevos,
  // Usuarios Churned
  getUsuariosChurnedRaw,
  getUsuariosChurned,
  // CAC
  getCACRaw,
  getCAC,
  // Unit Economics
  getUnitEconomicsRaw,
  getUnitEconomics,
  // Expenses
  getExpensesRaw,
  getExpenses,
  // Income
  getIncomeRaw,
  getIncome,
  // CAC Ratio (métrica calculada)
  getCACRatio,
  // CAC Payback (métrica calculada)
  getCACPaybackCalculated,
  // New ARR (métrica anualizada con proyección)
  getNewARR,
  // Churn ARR (métrica anualizada con proyección)
  getChurnARR,
} from "./metrics"
