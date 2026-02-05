/**
 * Punto de entrada principal para la capa de API
 * 
 * Exporta:
 * - Cliente HTTP base
 * - Tipos de respuesta de APIs
 * - Tipos de metricas calculadas
 * - Fetcher generico para SWR
 * - Funciones de calculo de metricas
 */

// Cliente base
export { api, apiClient } from "./client"

// Tipos de respuesta de APIs (Section 1 de types.ts)
export type {
  MRRResponse,
  MRRNewResponse,
  ChurnMRRResponse,
  ARPUResponse,
  LTVResponse,
  TicketPromedioResponse,
  TasaRetentionResponse,
  TasaChurnResponse,
  RevenueChurnResponse,
  UsuariosActivosResponse,
  UsuariosNuevosResponse,
  UsuariosChurnedResponse,
  CACResponse,
  UnitEconomicsResponse,
} from "./types"

// Tipos de metricas calculadas (Section 2 de types.ts)
export type {
  // CAC Ratio
  CACRatioDataPoint,
  CACRatioResult,
  // New ARR
  NewARRDataPoint,
  NewARRResult,
  // Churn ARR
  ChurnARRDataPoint,
  ChurnARRResult,
  // CAC Payback
  CACPaybackDataPoint,
  CACPaybackResult,
} from "./types"

// Fetcher generico para SWR y constantes
export {
  fetcher,
  GROSS_MARGIN,
  ALL_MONTHS,
} from "./metrics"

// Funciones de calculo de metricas
export {
  calculateCACRatio,
  calculateNewARR,
  calculateChurnARR,
  calculateCACPayback,
} from "./metrics"
