"use client"

/**
 * HOOKS PARA CONSUMO DE APIs
 * 
 * Cada hook:
 *   1. Usa SWR para fetch de data cruda via route handlers proxy
 *   2. Aplica filtros globales (año, mes, plan) segun corresponda
 *   3. Retorna data filtrada, loading, error y planes disponibles
 * 
 * Mapeos de meses:
 *   - Los filtros usan etiquetas ("Ene", "Feb"...) -> se convierten a "01", "02"...
 *   - La data de APIs viene en formato "2026-01", "2026-02"...
 * 
 * Reglas de continuidad:
 *   - Meses sin datos se rellenan con 0
 *   - Planes que no aparecen se tratan como 0
 */

import useSWR from "swr"
import { useMemo } from "react"
import { fetcher, ALL_MONTHS } from "@/lib/api/metrics"
import type {
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
} from "@/lib/api/types"

// ============================================
// CONSTANTES COMPARTIDAS
// ============================================

export const MONTH_MAP: Record<string, string> = {
  "Ene": "01", "Feb": "02", "Mar": "03", "Abr": "04",
  "May": "05", "Jun": "06", "Jul": "07", "Ago": "08",
  "Sep": "09", "Oct": "10", "Nov": "11", "Dic": "12",
}

export const MONTH_LABELS: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
}

const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 60000,
}

// ============================================
// TIPO COMPARTIDO DE OPCIONES DE FILTRO
// ============================================

interface FilterOptions {
  year?: string    // "2026", "2025", etc.
  month?: string   // "Todos", "Ene", "Feb", etc.
  plan?: string    // "Todos", "Free", "Starter", etc.
}


// ============================================
// useMRRData - /micro/mrr
// Niveles: plan > mes > nivel_id
// Filtros: año, mes, plan
// ============================================

export interface MRRDataPoint {
  month: string      // "2026-01"
  monthLabel: string  // "Ene"
  mrr: number
}

export function useMRRData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<MRRResponse>(
    "/api/micro/mrr", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as MRRDataPoint[], totalMRR: 0, currentMRR: 0, previousMRR: 0, mrrGrowthPercent: 0, plans: [] as string[], totalSubscriptions: 0, isLoading, error }

  if (!rawData) return result

  // Estructura correcta de la API: { plan: { mes: { mrr, subscriptions } } }
  const monthMap = new Map<string, number>()
  const subscriptionMap = new Map<string, number>()
  const plans = new Set<string>()

  for (const [planName, monthsData] of Object.entries(rawData)) {
    // Siempre agregar el plan al conjunto de planes disponibles, aunque no lo filtremos
    plans.add(planName)
    
    // Solo procesar datos de este plan si coincide con el filtro
    if (plan !== "Todos" && planName !== plan) continue
    
    // monthsData es { "2026-01": { mrr, subscriptions }, ... }
    for (const [monthKey, data] of Object.entries(monthsData)) {
      if (typeof data !== 'object' || data === null) continue
      
      const [dataYear, dataMonth] = monthKey.split('-')
      
      if (year !== "Todos" && dataYear !== year) continue
      if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
      
      const mrrValue = (data as any).mrr || 0
      const subValue = (data as any).subscriptions || 0
      
      monthMap.set(dataMonth, (monthMap.get(dataMonth) || 0) + mrrValue)
      subscriptionMap.set(dataMonth, (subscriptionMap.get(dataMonth) || 0) + subValue)
    }
  }

  result.plans = Array.from(plans)
  result.totalSubscriptions = Array.from(subscriptionMap.values()).reduce((a, b) => a + b, 0)

  // Crear chart data con continuidad (meses sin datos = 0)
  const chartData: MRRDataPoint[] = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`,
    monthLabel: MONTH_LABELS[m],
    mrr: monthMap.get(m) || 0,
  }))

  // Si hay filtro de mes especifico, solo mostrar ese mes
  if (month !== "Todos") {
    const filtered = chartData.filter(d => d.month === `${year}-${MONTH_MAP[month]}`)
    result.chartData = filtered
    result.totalMRR = filtered[0]?.mrr || 0
    result.currentMRR = filtered[0]?.mrr || 0
    return result
  }

  result.chartData = chartData

  // Calcular totales y crecimiento
  const monthsWithData = chartData.filter(d => d.mrr > 0)
  result.totalMRR = monthsWithData.reduce((sum, d) => sum + d.mrr, 0)
  result.currentMRR = monthsWithData[monthsWithData.length - 1]?.mrr || 0
  result.previousMRR = monthsWithData[monthsWithData.length - 2]?.mrr || 0

  if (result.previousMRR > 0) {
    result.mrrGrowthPercent = ((result.currentMRR - result.previousMRR) / result.previousMRR) * 100
  }

  return result
}


// ============================================
// useMRRNewData - /micro/mrr_new
// Niveles: plan > mes > nivel_id
// Filtros: año, mes, plan
// ============================================

export interface MRRNewDataPoint {
  month: string
  monthLabel: string
  newMRR: number
}

export function useMRRNewData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<MRRNewResponse>(
    "/api/micro/mrr_new", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as MRRNewDataPoint[], totalNewMRR: 0, currentNewMRR: 0, previousNewMRR: 0, growthPercent: 0, plans: [] as string[], isLoading, error }

  if (!rawData) return result

  // Estructura correcta de la API: { plan: { mes: { new_MRR, subscriptions } } }
  const monthMap = new Map<string, number>()
  const plans = new Set<string>()

  for (const [planName, monthsData] of Object.entries(rawData)) {
    // Siempre agregar el plan al conjunto de planes disponibles
    plans.add(planName)
    
    // Solo procesar datos si coincide con el filtro
    if (plan !== "Todos" && planName !== plan) continue
    
    // monthsData es { "2026-01": { new_MRR, subscriptions }, ... }
    for (const [monthKey, data] of Object.entries(monthsData)) {
      if (typeof data !== 'object' || data === null) continue
      
      const [dataYear, dataMonth] = monthKey.split('-')
      
      if (year !== "Todos" && dataYear !== year) continue
      if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
      
      const newMRRValue = (data as any).new_MRR || 0
      monthMap.set(dataMonth, (monthMap.get(dataMonth) || 0) + newMRRValue)
    }
  }

  result.plans = Array.from(plans)

  const chartData = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`, monthLabel: MONTH_LABELS[m], newMRR: monthMap.get(m) || 0,
  }))

  if (month !== "Todos") {
    const filtered = chartData.filter(d => d.month === `${year}-${MONTH_MAP[month]}`)
    result.chartData = filtered
    result.totalNewMRR = filtered[0]?.newMRR || 0
    result.currentNewMRR = filtered[0]?.newMRR || 0
    return result
  }

  result.chartData = chartData
  const withData = chartData.filter(d => d.newMRR > 0)
  result.totalNewMRR = withData.reduce((s, d) => s + d.newMRR, 0)
  result.currentNewMRR = withData[withData.length - 1]?.newMRR || 0
  result.previousNewMRR = withData[withData.length - 2]?.newMRR || 0
  if (result.previousNewMRR > 0) {
    result.growthPercent = ((result.currentNewMRR - result.previousNewMRR) / result.previousNewMRR) * 100
  }

  return result
}


// ============================================
// useChurnMRRData - /micro/churn_mrr
// Niveles: plan > mes > nivel_id
// Filtros: año, mes, plan
// Key en respuesta: Chur_MRR
// ============================================

export interface ChurnMRRDataPoint {
  month: string
  monthLabel: string
  churnMRR: number
}

export function useChurnMRRData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<ChurnMRRResponse>(
    "/api/micro/churn_mrr", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as ChurnMRRDataPoint[], totalChurnMRR: 0, currentChurnMRR: 0, previousChurnMRR: 0, plans: [] as string[], isLoading, error }

  if (!rawData) return result

  // Estructura correcta de la API: { plan: { mes: { Chur_MRR, subscriptions } } }
  const monthMap = new Map<string, number>()
  const plans = new Set<string>()

  for (const [planName, monthsData] of Object.entries(rawData)) {
    // Siempre agregar el plan al conjunto de planes disponibles
    plans.add(planName)
    
    // Solo procesar datos si coincide con el filtro
    if (plan !== "Todos" && planName !== plan) continue
    
    // monthsData es { "2026-01": { Chur_MRR, subscriptions }, ... }
    for (const [monthKey, data] of Object.entries(monthsData)) {
      if (typeof data !== 'object' || data === null) continue
      
      const [dataYear, dataMonth] = monthKey.split('-')
      
      if (year !== "Todos" && dataYear !== year) continue
      if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
      
      // Nota: API devuelve "Chur_MRR" (no "churnMRR" o "churn_mrr")
      const mrrValue = (data as any)['Chur_MRR'] || 0
      monthMap.set(dataMonth, (monthMap.get(dataMonth) || 0) + mrrValue)
    }
  }

  result.plans = Array.from(plans)

  const chartData = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`, monthLabel: MONTH_LABELS[m], churnMRR: monthMap.get(m) || 0,
  }))

  if (month !== "Todos") {
    const filtered = chartData.filter(d => d.month === `${year}-${MONTH_MAP[month]}`)
    result.chartData = filtered
    result.totalChurnMRR = filtered[0]?.churnMRR || 0
    result.currentChurnMRR = filtered[0]?.churnMRR || 0
    return result
  }

  result.chartData = chartData
  const withData = chartData.filter(d => d.churnMRR > 0)
  result.totalChurnMRR = withData.reduce((s, d) => s + d.churnMRR, 0)
  result.currentChurnMRR = withData[withData.length - 1]?.churnMRR || 0
  result.previousChurnMRR = withData[withData.length - 2]?.churnMRR || 0

  return result
}


// ============================================
// useExpansionMRRData - /micro/expansion_mrr
// Nueva estructura: plan-mes
// Filtros: año, mes, plan
// ============================================

export interface ExpansionMRRDataPoint {
  month: string
  monthLabel: string
  expansionMRR: number
}

export function useExpansionMRRData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<Record<string, { mrr: number; subscription: number }>>(
    "/api/micro/expansion_mrr", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as ExpansionMRRDataPoint[], totalExpansionMRR: 0, currentExpansionMRR: 0, previousExpansionMRR: 0, plans: [] as string[], isLoading, error }

  if (!rawData) return result

  // Estructura correcta de la API: { plan: { mes: { expansion_mrr, subscriptions } } }
  const monthMap = new Map<string, number>()
  const plans = new Set<string>()

  for (const [planName, monthsData] of Object.entries(rawData)) {
    // Siempre agregar el plan al conjunto de planes disponibles
    plans.add(planName)
    
    // Solo procesar datos si coincide con el filtro
    if (plan !== "Todos" && planName !== plan) continue
    
    // monthsData es { "2026-01": { expansion_mrr, subscriptions }, ... }
    for (const [monthKey, data] of Object.entries(monthsData)) {
      if (typeof data !== 'object' || data === null) continue
      
      const [dataYear, dataMonth] = monthKey.split('-')
      
      if (year !== "Todos" && dataYear !== year) continue
      if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
      
      const mrrValue = (data as any).expansion_mrr || 0
      monthMap.set(dataMonth, (monthMap.get(dataMonth) || 0) + mrrValue)
    }
  }

  result.plans = Array.from(plans)

  const chartData = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`, monthLabel: MONTH_LABELS[m], expansionMRR: monthMap.get(m) || 0,
  }))

  if (month !== "Todos") {
    const filtered = chartData.filter(d => d.month === `${year}-${MONTH_MAP[month]}`)
    result.chartData = filtered
    result.totalExpansionMRR = filtered[0]?.expansionMRR || 0
    result.currentExpansionMRR = filtered[0]?.expansionMRR || 0
    return result
  }

  result.chartData = chartData
  const withData = chartData.filter(d => d.expansionMRR > 0)
  result.totalExpansionMRR = withData.reduce((s, d) => s + d.expansionMRR, 0)
  result.currentExpansionMRR = withData[withData.length - 1]?.expansionMRR || 0
  result.previousExpansionMRR = withData[withData.length - 2]?.expansionMRR || 0

  return result
}


// ============================================
// useContractionMRRData - /micro/contraction_mrr
// Nueva estructura: plan-mes
// Filtros: año, mes, plan
// ============================================

export interface ContractionMRRDataPoint {
  month: string
  monthLabel: string
  contractionMRR: number
}

export function useContractionMRRData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<Record<string, { mrr: number; subscription: number }>>(
    "/api/micro/contraction_mrr", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as ContractionMRRDataPoint[], totalContractionMRR: 0, currentContractionMRR: 0, previousContractionMRR: 0, plans: [] as string[], isLoading, error }

  if (!rawData) return result

  // Estructura correcta de la API: { plan: { mes: { contraction_mrr, subscriptions } } }
  const monthMap = new Map<string, number>()
  const plans = new Set<string>()

  for (const [planName, monthsData] of Object.entries(rawData)) {
    // Siempre agregar el plan al conjunto de planes disponibles
    plans.add(planName)
    
    // Solo procesar datos si coincide con el filtro
    if (plan !== "Todos" && planName !== plan) continue
    
    // monthsData es { "2026-01": { contraction_mrr, subscriptions }, ... }
    for (const [monthKey, data] of Object.entries(monthsData)) {
      if (typeof data !== 'object' || data === null) continue
      
      const [dataYear, dataMonth] = monthKey.split('-')
      
      if (year !== "Todos" && dataYear !== year) continue
      if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
      
      const mrrValue = (data as any).contraction_mrr || 0
      monthMap.set(dataMonth, (monthMap.get(dataMonth) || 0) + mrrValue)
    }
  }

  result.plans = Array.from(plans)

  const chartData = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`, monthLabel: MONTH_LABELS[m], contractionMRR: monthMap.get(m) || 0,
  }))

  if (month !== "Todos") {
    const filtered = chartData.filter(d => d.month === `${year}-${MONTH_MAP[month]}`)
    result.chartData = filtered
    result.totalContractionMRR = filtered[0]?.contractionMRR || 0
    result.currentContractionMRR = filtered[0]?.contractionMRR || 0
    return result
  }

  result.chartData = chartData
  const withData = chartData.filter(d => d.contractionMRR > 0)
  result.totalContractionMRR = withData.reduce((s, d) => s + d.contractionMRR, 0)
  result.currentContractionMRR = withData[withData.length - 1]?.contractionMRR || 0
  result.previousContractionMRR = withData[withData.length - 2]?.contractionMRR || 0

  return result
}


// ============================================
// useARPUData - /micro/arpu
// Niveles: plan > mes
// Para global mensual: promediar arpu de planes (NO basarse en users)
// Filtros: año, mes, plan
// ============================================

export interface ARPUDataPoint {
  month: string
  monthLabel: string
  arpu: number
}

export function useARPUData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<ARPUResponse>(
    "/api/micro/arpu", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as ARPUDataPoint[], currentARPU: 0, previousARPU: 0, plans: [] as string[], isLoading, error }

  if (!rawData) return result

  result.plans = Object.keys(rawData)
  // Mapa: monthNum -> { totalArpu, count } para promediar
  const monthMap = new Map<string, { totalArpu: number; count: number }>()

  for (const [planName, monthsData] of Object.entries(rawData)) {
    if (plan !== "Todos" && planName !== plan) continue
    for (const [monthKey, data] of Object.entries(monthsData)) {
      const [dataYear, dataMonth] = monthKey.split("-")
      if (year !== "Todos" && dataYear !== year) continue
      if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
      const entry = monthMap.get(dataMonth) || { totalArpu: 0, count: 0 }
      entry.totalArpu += data.arpu
      entry.count += 1
      monthMap.set(dataMonth, entry)
    }
  }

  const chartData = ALL_MONTHS.map(m => {
    const entry = monthMap.get(m)
    return {
      month: `${year}-${m}`,
      monthLabel: MONTH_LABELS[m],
      arpu: entry && entry.count > 0 ? entry.totalArpu / entry.count : 0,
    }
  })

  if (month !== "Todos") {
    const filtered = chartData.filter(d => d.month === `${year}-${MONTH_MAP[month]}`)
    result.chartData = filtered
    result.currentARPU = filtered[0]?.arpu || 0
    return result
  }

  result.chartData = chartData
  const withData = chartData.filter(d => d.arpu > 0)
  result.currentARPU = withData[withData.length - 1]?.arpu || 0
  result.previousARPU = withData[withData.length - 2]?.arpu || 0

  return result
}


// ============================================
// useLTVData - /micro/ltv
// Niveles: solo plan (sin fecha)
// Filtros: plan
// ============================================

export interface LTVDataPoint {
  plan: string
  ltv: number
  totalRevenue: number
  companies: number
}

export function useLTVData(options: { plan?: string } = {}) {
  const { plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<LTVResponse>(
    "/api/micro/ltv", fetcher, SWR_CONFIG
  )

  const result = { data: [] as LTVDataPoint[], averageLTV: 0, plans: [] as string[], isLoading, error }

  if (!rawData) return result

  result.plans = Object.keys(rawData)
  const items: LTVDataPoint[] = []

  for (const [planName, data] of Object.entries(rawData)) {
    if (plan !== "Todos" && planName !== plan) continue
    items.push({ plan: planName, ltv: data.ltv, totalRevenue: data.total_revenue, companies: data.companies })
  }

  result.data = items

  // Promedio ponderado por companies
  const totalWeighted = items.reduce((s, i) => s + i.ltv * i.companies, 0)
  const totalCompanies = items.reduce((s, i) => s + i.companies, 0)
  result.averageLTV = totalCompanies > 0 ? totalWeighted / totalCompanies : 0

  return result
}


// ============================================
// useTicketPromedioData - /micro/ticket_promedio
// Niveles: solo fecha (sin plan)
// Valor clave: prom_ticket (minuscula)
// Para global: promediar todos los meses
// Filtros: año, mes
// ============================================

export interface TicketDataPoint {
  month: string
  monthLabel: string
  ticket: number
  totalRevenue: number
  invoices: number
}

export function useTicketPromedioData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<TicketPromedioResponse>(
    "/api/micro/ticket_promedio", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as TicketDataPoint[], currentTicket: 0, previousTicket: 0, isLoading, error }

  if (!rawData) return result

  const monthMap = new Map<string, { ticket: number; revenue: number; invoices: number }>()

  for (const [monthKey, data] of Object.entries(rawData)) {
    const [dataYear, dataMonth] = monthKey.split("-")
    if (year !== "Todos" && dataYear !== year) continue
    if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
    // Usar prom_ticket como propiedad normalizada 'ticket'
    const ticketValue = (data as any).prom_ticket || 0
    monthMap.set(dataMonth, { ticket: ticketValue, revenue: data.total_revenue, invoices: data.invoice_id })
  }

  const chartData = ALL_MONTHS.map(m => {
    const entry = monthMap.get(m)
    return {
      month: `${year}-${m}`,
      monthLabel: MONTH_LABELS[m],
      ticket: entry?.ticket || 0,
      totalRevenue: entry?.revenue || 0,
      invoices: entry?.invoices || 0,
    }
  })

  result.chartData = chartData
  const withData = chartData.filter(d => d.ticket > 0)
  result.currentTicket = withData[withData.length - 1]?.ticket || 0
  result.previousTicket = withData[withData.length - 2]?.ticket || 0

  return result
}


// ============================================
// useTasaRetentionData - /micro/tasa_retention
// Niveles: solo fecha (sin plan)
// Valor: porcentaje (100 = 100%)
// Filtros: año, mes
// ============================================

export interface TasaRetentionDataPoint {
  month: string
  monthLabel: string
  retentionRate: number
}

export function useTasaRetentionData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<TasaRetentionResponse>(
    "/api/micro/tasa_retention", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as TasaRetentionDataPoint[], currentRate: 0, previousRate: 0, isLoading, error }

  if (!rawData) return result

  const monthMap = new Map<string, number>()
  for (const [monthKey, rate] of Object.entries(rawData)) {
    const [dataYear, dataMonth] = monthKey.split("-")
    if (year !== "Todos" && dataYear !== year) continue
    if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
    monthMap.set(dataMonth, typeof rate === "number" ? rate : 0)
  }

  const chartData = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`, monthLabel: MONTH_LABELS[m], retentionRate: monthMap.get(m) || 0,
  }))

  result.chartData = chartData
  const withData = chartData.filter(d => d.retentionRate > 0)
  result.currentRate = withData[withData.length - 1]?.retentionRate || 0
  result.previousRate = withData[withData.length - 2]?.retentionRate || 0

  return result
}


// ============================================
// useTasaChurnData - /micro/tasa_churn
// Niveles: solo fecha (sin plan)
// Valor: porcentaje (0 = 0%)
// Filtros: año, mes
// ============================================

export interface TasaChurnDataPoint {
  month: string
  monthLabel: string
  churnRate: number
}

export function useTasaChurnData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<TasaChurnResponse>(
    "/api/micro/tasa_churn", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as TasaChurnDataPoint[], currentRate: 0, previousRate: 0, isLoading, error }

  if (!rawData) return result

  const monthMap = new Map<string, number>()
  for (const [monthKey, rate] of Object.entries(rawData)) {
    const [dataYear, dataMonth] = monthKey.split("-")
    if (year !== "Todos" && dataYear !== year) continue
    if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
    monthMap.set(dataMonth, typeof rate === "number" ? rate : 0)
  }

  const chartData = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`, monthLabel: MONTH_LABELS[m], churnRate: monthMap.get(m) || 0,
  }))

  result.chartData = chartData
  const withData = chartData.filter(d => d.churnRate > 0)
  result.currentRate = withData[withData.length - 1]?.churnRate || 0
  result.previousRate = withData[withData.length - 2]?.churnRate || 0

  return result
}


// ============================================
// useRevenueChurnData - /micro/revenue_churn
// Niveles: solo fecha (sin plan)
// Valor: monto en dolares
// Filtros: año, mes
// ============================================

export interface RevenueChurnDataPoint {
  month: string
  monthLabel: string
  revenueChurn: number
}

export function useRevenueChurnData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<RevenueChurnResponse>(
    "/api/micro/revenue_churn", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as RevenueChurnDataPoint[], currentRevChurn: 0, previousRevChurn: 0, isLoading, error }

  if (!rawData) return result

  const monthMap = new Map<string, number>()
  for (const [monthKey, val] of Object.entries(rawData)) {
    const [dataYear, dataMonth] = monthKey.split("-")
    if (year !== "Todos" && dataYear !== year) continue
    if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
    monthMap.set(dataMonth, typeof val === "number" ? val : 0)
  }

  const chartData = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`, monthLabel: MONTH_LABELS[m], revenueChurn: monthMap.get(m) || 0,
  }))

  result.chartData = chartData
  const withData = chartData.filter(d => d.revenueChurn > 0)
  result.currentRevChurn = withData[withData.length - 1]?.revenueChurn || 0
  result.previousRevChurn = withData[withData.length - 2]?.revenueChurn || 0

  return result
}


// ============================================
// useUsuariosActivosData - /micro/usuarios_activos
// Niveles: mes > plan
// active_users: total del mes (no por plan)
// Para por plan: contar companies[]
// Filtros: año, mes, plan
// ============================================

export interface UsuariosActivosDataPoint {
  month: string
  monthLabel: string
  activeUsers: number
}

export function useUsuariosActivosData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<UsuariosActivosResponse>(
    "/api/micro/usuarios_activos", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as UsuariosActivosDataPoint[], currentActive: 0, previousActive: 0, plans: [] as string[], isLoading, error }

  if (!rawData) return result

  // Extraer planes disponibles (excluyendo active_users key)
  const plansSet = new Set<string>()
  const monthMap = new Map<string, number>()

  for (const [monthKey, monthData] of Object.entries(rawData)) {
    const [dataYear, dataMonth] = monthKey.split("-")
    if (year !== "Todos" && dataYear !== year) continue
    if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue

    if (plan === "Todos") {
      // Usar active_users del mes (total global)
      const activeUsers = (monthData as Record<string, unknown>).active_users
      monthMap.set(dataMonth, typeof activeUsers === "number" ? activeUsers : 0)
    } else {
      // Contar companies del plan especifico
      let count = 0
      for (const [key, val] of Object.entries(monthData)) {
        if (key === "active_users") continue
        plansSet.add(key)
        if (key === plan && val && typeof val === "object" && "companies" in val) {
          count += (val as { companies: string[] }).companies.length
        }
      }
      monthMap.set(dataMonth, count)
    }

    // Recopilar planes
    for (const key of Object.keys(monthData)) {
      if (key !== "active_users") plansSet.add(key)
    }
  }

  result.plans = Array.from(plansSet)

  const chartData = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`, monthLabel: MONTH_LABELS[m], activeUsers: monthMap.get(m) || 0,
  }))

  result.chartData = chartData
  const withData = chartData.filter(d => d.activeUsers > 0)
  result.currentActive = withData[withData.length - 1]?.activeUsers || 0
  result.previousActive = withData[withData.length - 2]?.activeUsers || 0

  return result
}


// ============================================
// useUsuariosNuevosData - /micro/usuarios_nuevos
// Niveles: mes > plan
// Key: new_users (0 si no existe)
// Filtros: año, mes, plan
// ============================================

export interface UsuariosNuevosDataPoint {
  month: string
  monthLabel: string
  newUsers: number
}

export function useUsuariosNuevosData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<UsuariosNuevosResponse>(
    "/api/micro/usuarios_nuevos", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as UsuariosNuevosDataPoint[], totalNewUsers: 0, currentNewUsers: 0, previousNewUsers: 0, plans: [] as string[], isLoading, error }

  if (!rawData) return result

  const plansSet = new Set<string>()
  const monthMap = new Map<string, number>()

  for (const [monthKey, monthData] of Object.entries(rawData)) {
    const [dataYear, dataMonth] = monthKey.split("-")
    if (year !== "Todos" && dataYear !== year) continue
    if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue

    let monthTotal = 0
    for (const [planName, planData] of Object.entries(monthData)) {
      plansSet.add(planName)
      if (plan !== "Todos" && planName !== plan) continue
      monthTotal += planData.new_users || 0
    }
    monthMap.set(dataMonth, (monthMap.get(dataMonth) || 0) + monthTotal)
  }

  result.plans = Array.from(plansSet)

  const chartData = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`, monthLabel: MONTH_LABELS[m], newUsers: monthMap.get(m) || 0,
  }))

  result.chartData = chartData
  const withData = chartData.filter(d => d.newUsers > 0)
  result.totalNewUsers = withData.reduce((s, d) => s + d.newUsers, 0)
  result.currentNewUsers = withData[withData.length - 1]?.newUsers || 0
  result.previousNewUsers = withData[withData.length - 2]?.newUsers || 0

  return result
}


// ============================================
// useUsuariosChurnedData - /micro/usuarios_churned
// Niveles: mes > plan
// Key: churned_users (0 si no existe)
// Filtros: año, mes, plan
// ============================================

export interface UsuariosChurnedDataPoint {
  month: string
  monthLabel: string
  churnedUsers: number
}

export function useUsuariosChurnedData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<UsuariosChurnedResponse>(
    "/api/micro/usuarios_churned", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as UsuariosChurnedDataPoint[], totalChurned: 0, currentChurned: 0, previousChurned: 0, plans: [] as string[], isLoading, error }

  if (!rawData) return result

  const plansSet = new Set<string>()
  const monthMap = new Map<string, number>()

  for (const [monthKey, monthData] of Object.entries(rawData)) {
    const [dataYear, dataMonth] = monthKey.split("-")
    if (year !== "Todos" && dataYear !== year) continue
    if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue

    let monthTotal = 0
    for (const [planName, planData] of Object.entries(monthData)) {
      plansSet.add(planName)
      if (plan !== "Todos" && planName !== plan) continue
      monthTotal += planData.churned_users || 0
    }
    monthMap.set(dataMonth, (monthMap.get(dataMonth) || 0) + monthTotal)
  }

  result.plans = Array.from(plansSet)

  const chartData = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`, monthLabel: MONTH_LABELS[m], churnedUsers: monthMap.get(m) || 0,
  }))

  result.chartData = chartData
  const withData = chartData.filter(d => d.churnedUsers > 0)
  result.totalChurned = withData.reduce((s, d) => s + d.churnedUsers, 0)
  result.currentChurned = withData[withData.length - 1]?.churnedUsers || 0
  result.previousChurned = withData[withData.length - 2]?.churnedUsers || 0

  return result
}


// ============================================
// useCACData - /costs/cac
// Niveles: solo fecha
// Filtros: año, mes
// ============================================

export interface CACDataPoint {
  month: string
  monthLabel: string
  cac: number
}

export function useCACData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<CACResponse>(
    "/api/costs/cac", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as CACDataPoint[], currentCAC: 0, previousCAC: 0, isLoading, error }

  if (!rawData) return result

  const monthMap = new Map<string, number>()
  for (const [monthKey, val] of Object.entries(rawData)) {
    const [dataYear, dataMonth] = monthKey.split("-")
    if (year !== "Todos" && dataYear !== year) continue
    if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
    monthMap.set(dataMonth, typeof val === "number" ? val : 0)
  }

  const chartData = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`, monthLabel: MONTH_LABELS[m], cac: monthMap.get(m) || 0,
  }))

  result.chartData = chartData
  const withData = chartData.filter(d => d.cac > 0)
  result.currentCAC = withData[withData.length - 1]?.cac || 0
  result.previousCAC = withData[withData.length - 2]?.cac || 0

  return result
}


// ============================================
// useUnitEconomicsData - /costs/ue (DCPA)
// Niveles: solo fecha
// Filtros: año, mes
// ============================================

export interface UEDataPoint {
  month: string
  monthLabel: string
  dcpa: number
}

export function useUnitEconomicsData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos" } = options

  const { data: rawData, error, isLoading } = useSWR<UnitEconomicsResponse>(
    "/api/costs/ue", fetcher, SWR_CONFIG
  )

  const result = { chartData: [] as UEDataPoint[], currentDCPA: 0, previousDCPA: 0, isLoading, error }

  if (!rawData) return result

  const monthMap = new Map<string, number>()
  for (const [monthKey, val] of Object.entries(rawData)) {
    const [dataYear, dataMonth] = monthKey.split("-")
    if (year !== "Todos" && dataYear !== year) continue
    if (month !== "Todos" && dataMonth !== MONTH_MAP[month]) continue
    monthMap.set(dataMonth, typeof val === "number" ? val : 0)
  }

  const chartData = ALL_MONTHS.map(m => ({
    month: `${year}-${m}`, monthLabel: MONTH_LABELS[m], dcpa: monthMap.get(m) || 0,
  }))

  result.chartData = chartData
  const withData = chartData.filter(d => d.dcpa > 0)
  result.currentDCPA = withData[withData.length - 1]?.dcpa || 0
  result.previousDCPA = withData[withData.length - 2]?.dcpa || 0

  return result
}

// ============================================
// REVENUE METRICS: Revenue Expansion, Gross Churn Rate, Net Revenue Churn
// Calculadas en front usando datos mes actual vs mes anterior
// ============================================

export interface RevenueMetricsDataPoint {
  month: string
  monthLabel: string
  revenueExpansion: number // (expansion_mrr / mrr_anterior) * 100
  grossChurnRate: number // ((churn_mrr + contraction_mrr) / mrr_anterior) * 100
  netRevenueChurn: number // ((churn_mrr + contraction_mrr - expansion_mrr) / mrr_anterior) * 100
}

export function useRevenueMetricsData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos", plan = "Todos" } = options

  // Obtener todos los datos necesarios
  const { chartData: mrrData, isLoading: loadingMRR } = useMRRData({ year, month: "Todos", plan })
  const { chartData: churnMRRData, isLoading: loadingChurn } = useChurnMRRData({ year, month: "Todos", plan })
  const { chartData: expansionMRRData, isLoading: loadingExpansion } = useExpansionMRRData({ year, month: "Todos", plan })
  const { chartData: contractionMRRData, isLoading: loadingContraction } = useContractionMRRData({ year, month: "Todos", plan })

  const isLoading = loadingMRR || loadingChurn || loadingExpansion || loadingContraction

  const result = useMemo(() => {
    if (!mrrData.length) return { chartData: [] as RevenueMetricsDataPoint[], isLoading }

    // Crear un mapa de datos por mes para acceso rápido
    const mrrByMonth = new Map(mrrData.map(d => [d.monthLabel, d.mrr]))
    const churnByMonth = new Map(churnMRRData.map(d => [d.monthLabel, d.churnMRR]))
    const expansionByMonth = new Map(expansionMRRData.map(d => [d.monthLabel, d.expansionMRR]))
    const contractionByMonth = new Map(contractionMRRData.map(d => [d.monthLabel, d.contractionMRR]))

    // Calcular métricas para cada mes
    const metricsData: RevenueMetricsDataPoint[] = []

    for (let i = 0; i < ALL_MONTHS.length; i++) {
      const currentMonth = ALL_MONTHS[i]
      const currentLabel = MONTH_LABELS[currentMonth]
      const previousMonth = i > 0 ? ALL_MONTHS[i - 1] : null
      const previousLabel = previousMonth ? MONTH_LABELS[previousMonth] : null

      const currentMRR = mrrByMonth.get(currentLabel) || 0
      const previousMRR = previousLabel ? (mrrByMonth.get(previousLabel) || 0) : 0

      const currentChurn = churnByMonth.get(currentLabel) || 0
      const currentExpansion = expansionByMonth.get(currentLabel) || 0
      const currentContraction = contractionByMonth.get(currentLabel) || 0

      // Revenue Expansion (%) = (expansion_mrr / mrr_anterior) * 100
      const revenueExpansion = previousMRR > 0 ? (currentExpansion / previousMRR) * 100 : 0

      // Gross Churn Rate (%) = ((churn_mrr + contraction_mrr) / mrr_anterior) * 100
      const totalChurn = currentChurn + currentContraction
      const grossChurnRate = previousMRR > 0 ? (totalChurn / previousMRR) * 100 : 0

      // Net Revenue Churn (%) = ((churn_mrr + contraction_mrr - expansion_mrr) / mrr_anterior) * 100
      const netChurn = totalChurn - currentExpansion
      const netRevenueChurn = previousMRR > 0 ? (netChurn / previousMRR) * 100 : 0

      metricsData.push({
        month: `${year}-${currentMonth}`,
        monthLabel: currentLabel,
        revenueExpansion,
        grossChurnRate,
        netRevenueChurn,
      })
    }

    // Filtrar por mes si es necesario
    let filtered = metricsData
    if (month !== "Todos") {
      filtered = filtered.filter(d => d.monthLabel === month)
    }

    return { chartData: filtered, isLoading: false }
  }, [mrrData, churnMRRData, expansionMRRData, contractionMRRData, year, month])

  return {
    chartData: result.chartData,
    isLoading,
  }
}
