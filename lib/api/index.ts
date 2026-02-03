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
} from "./types"

// Servicios de métricas
export {
  // Dashboard
  getDashboardKPIs,
  getARRMetrics,
  getCACPayback,
  getCACvsLTV,
  getDCPAMRPA,
  getTicketPromedio,
  // Retención
  getRetentionKPIs,
  getRetentionCohorte,
  getChurnAnalysis,
  // Cálculos
  calculateMetrics,
} from "./metrics"
