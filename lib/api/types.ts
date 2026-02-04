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
// MRR NEW - Respuesta del endpoint /micro/mrr_new
// ============================================

export interface MRRNewCompanyData {
  new_MRR: number
  subscriptions: number
}

export interface MRRNewMonthData {
  [companyId: string]: MRRNewCompanyData
}

export interface MRRNewPlanData {
  [month: string]: MRRNewMonthData
}

export interface MRRNewResponse {
  [plan: string]: MRRNewPlanData
}

export interface MRRNewProcessed {
  totalNewMRR: number
  newMRRByPlan: { plan: string; newMRR: number; subscriptions: number }[]
  newMRRByMonth: { month: string; newMRR: number }[]
}

// ============================================
// CHURN MRR - Respuesta del endpoint /micro/churn_mrr
// ============================================

export interface ChurnMRRResponse {
  [plan: string]: {
    [month: string]: {
      [companyId: string]: {
        churned_MRR: number
      }
    }
  }
}

export interface ChurnMRRProcessed {
  totalChurnMRR: number
  churnMRRByPlan: { plan: string; churnMRR: number }[]
  churnMRRByMonth: { month: string; churnMRR: number }[]
}

// ============================================
// ARPU - Respuesta del endpoint /micro/arpu
// Estructura: { [plan]: { [month]: { arpu, users } } }
// ============================================

export interface ARPUMonthData {
  arpu: number
  users: number
}

export interface ARPUResponse {
  [plan: string]: {
    [month: string]: ARPUMonthData
  }
}

export interface ARPUProcessed {
  totalARPU: number
  currentARPU: number
  arpuByPlan: { plan: string; arpu: number; users: number }[]
  arpuByMonth: { month: string; arpu: number }[]
  arpuByPlanAndMonth: { plan: string; month: string; arpu: number; users: number }[]
  plans: string[]
}

// ============================================
// LTV - Respuesta del endpoint /micro/ltv
// ============================================

export interface LTVResponse {
  [plan: string]: {
    total_revenue: number
    ltv: number
    companies: number
  }
}

export interface LTVProcessed {
  averageLTV: number
  ltvByPlan: { plan: string; ltv: number; totalRevenue: number; companies: number }[]
}

// ============================================
// TICKET PROMEDIO - Respuesta del endpoint /micro/ticket_promedio
// ============================================

export interface TicketPromedioResponse {
  [month: string]: {
    total_revenue: number
    Prom_ticket: number
    invoice_id: number
    prom_ticket: number
  }
}

export interface TicketPromedioProcessed {
  currentTicket: number
  ticketByMonth: { month: string; ticket: number; totalRevenue: number; invoices: number }[]
}

// ============================================
// TASA RETENTION - Respuesta del endpoint /micro/tasa_retention
// ============================================

export interface TasaRetentionResponse {
  [month: string]: {
    [plan: string]: {
      retention_rate: number
      retained_companies: number
      total_companies: number
    }
  }
}

export interface TasaRetentionProcessed {
  currentRetentionRate: number
  retentionByMonth: { month: string; retentionRate: number }[]
  retentionByPlan: { plan: string; retentionRate: number }[]
}

// ============================================
// TASA CHURN - Respuesta del endpoint /micro/tasa_churn
// ============================================

export interface TasaChurnResponse {
  [month: string]: {
    [plan: string]: {
      churn_rate: number
      churned_companies: number
      total_companies: number
    }
  }
}

export interface TasaChurnProcessed {
  currentChurnRate: number
  churnByMonth: { month: string; churnRate: number }[]
  churnByPlan: { plan: string; churnRate: number }[]
}

// ============================================
// REVENUE CHURN - Respuesta del endpoint /micro/revenue_churn
// ============================================

export interface RevenueChurnResponse {
  [month: string]: {
    [plan: string]: {
      revenue_churn: number
      churned_revenue: number
      total_revenue: number
    }
  }
}

export interface RevenueChurnProcessed {
  currentRevenueChurn: number
  revenueChurnByMonth: { month: string; revenueChurn: number }[]
}

// ============================================
// USUARIOS ACTIVOS - Respuesta del endpoint /micro/usuarios_activos
// Estructura: { [month]: { active_users: number, [plan]: { companies: [] } } }
// ============================================

export interface UsuariosActivosPlanData {
  companies: string[]
}

export interface UsuariosActivosMonthData {
  active_users?: number
  [plan: string]: UsuariosActivosPlanData | number | undefined
}

export interface UsuariosActivosResponse {
  [month: string]: UsuariosActivosMonthData
}

export interface UsuariosActivosProcessed {
  currentActiveCompanies: number
  previousActiveCompanies: number
  activeCompaniesByMonth: { month: string; activeCompanies: number }[]
  activeCompaniesByPlan: { plan: string; companies: number }[]
  plans: string[]
}

// ============================================
// USUARIOS NUEVOS - Respuesta del endpoint /micro/usuarios_nuevos
// ============================================

export interface UsuariosNuevosResponse {
  [month: string]: {
    [plan: string]: {
      companies: string[]
      new_users: number
    }
  }
}

export interface UsuariosNuevosProcessed {
  totalNewUsers: number
  newUsersByMonth: { month: string; newUsers: number }[]
  newUsersByPlan: { plan: string; newUsers: number }[]
}

// ============================================
// USUARIOS CHURNED - Respuesta del endpoint /micro/usuarios_churned
// ============================================

export interface UsuariosChurnedResponse {
  [month: string]: {
    [plan: string]: {
      companies: string[]
      churned_users: number
    }
  }
}

export interface UsuariosChurnedProcessed {
  totalChurnedUsers: number
  churnedUsersByMonth: { month: string; churnedUsers: number }[]
}

// ============================================
// CAC - Respuesta del endpoint /costs/cac
// Estructura: { [month]: cac_value } (acumulado=true)
// ============================================

export interface CACResponse {
  [month: string]: number
}

export interface CACProcessed {
  currentCAC: number
  previousCAC: number
  cacByMonth: { month: string; cac: number }[]
}

// ============================================
// UNIT ECONOMICS (DCPA) - Respuesta del endpoint /costs/ue
// Estructura: { [month]: dcpa_value } (acumulado=true)
// ============================================

export interface UnitEconomicsResponse {
  [month: string]: number
}

export interface UnitEconomicsProcessed {
  currentDCPA: number
  previousDCPA: number
  dcpaByMonth: { month: string; dcpa: number }[]
}

// ============================================
// EXPENSES - Respuesta del endpoint /costs/expenses
// ============================================

export interface ExpensesResponse {
  [month: string]: {
    total_expenses: number
    categories: {
      [category: string]: number
    }
  }
}

export interface ExpensesProcessed {
  totalExpenses: number
  expensesByMonth: { month: string; expenses: number }[]
  expensesByCategory: { category: string; amount: number }[]
}

// ============================================
// INCOME - Respuesta del endpoint /costs/income
// ============================================

export interface IncomeResponse {
  [month: string]: {
    total_income: number
    sources: {
      [source: string]: number
    }
  }
}

export interface IncomeProcessed {
  totalIncome: number
  incomeByMonth: { month: string; income: number }[]
  incomeBySource: { source: string; amount: number }[]
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

// ============================================
// CAC RATIO - Métrica calculada
// Fórmula: (Nuevo MRR × Margen Bruto %) / Costo de Ventas y Marketing
// ============================================

export interface CACRatioDataPoint {
  month: string
  cacRatio: number
  newMRR: number
  grossMargin: number // Porcentaje (ej: 0.70 para 70%)
  marketingCost: number
}

export interface CACRatioProcessed {
  currentCACRatio: number
  cacRatioByMonth: CACRatioDataPoint[]
  averageCACRatio: number
}

// ============================================
// CAC PAYBACK - Métrica calculada
// Fórmula: CAC / (ARPU Mensual × Margen Bruto %)
// ============================================

export interface CACPaybackCalculatedDataPoint {
  month: string
  cacPayback: number // En meses
  cac: number
  arpu: number
  grossMargin: number
}

export interface CACPaybackCalculatedProcessed {
  currentCACPayback: number
  cacPaybackByMonth: CACPaybackCalculatedDataPoint[]
  averageCACPayback: number
}

// ============================================
// NEW ARR - Métrica anualizada con proyección
// Fórmula: New ARR = New MRR × 12
// Proyección: usa el último mes con datos para los meses restantes
// ============================================

export interface NewARRDataPoint {
  month: string
  newMRR: number
  newARR: number // newMRR × 12
  isProjected: boolean // true si es proyección del último mes real
}

export interface NewARRProcessed {
  totalNewARR: number // Suma de todos los ARR (reales + proyectados)
  currentNewMRR: number // Último MRR real
  annualizedNewARR: number // currentNewMRR × 12
  newARRByMonth: NewARRDataPoint[]
  lastRealMonth: string
}

// ============================================
// CHURN ARR - Métrica anualizada con proyección
// Fórmula: Churn ARR = Churn MRR × 12
// Proyección: usa el último mes con datos para los meses restantes
// ============================================

export interface ChurnARRDataPoint {
  month: string
  churnMRR: number
  churnARR: number // churnMRR × 12
  isProjected: boolean // true si es proyección del último mes real
}

export interface ChurnARRProcessed {
  totalChurnARR: number // Suma de todos los ARR (reales + proyectados)
  currentChurnMRR: number // Último MRR real
  annualizedChurnARR: number // currentChurnMRR × 12
  churnARRByMonth: ChurnARRDataPoint[]
  lastRealMonth: string
}
