/**
 * Servicios para obtener métricas del microservicio
 * Funciones que llaman a cada endpoint de tu API
 */

import type {
  MRRResponse,
  MRRProcessed,
  MRRNewResponse,
  MRRNewProcessed,
  ChurnMRRResponse,
  ChurnMRRProcessed,
  ARPUResponse,
  ARPUProcessed,
  LTVResponse,
  LTVProcessed,
  TicketPromedioResponse,
  TicketPromedioProcessed,
  TasaRetentionResponse,
  TasaRetentionProcessed,
  TasaChurnResponse,
  TasaChurnProcessed,
  RevenueChurnResponse,
  RevenueChurnProcessed,
  UsuariosActivosResponse,
  UsuariosActivosProcessed,
  UsuariosNuevosResponse,
  UsuariosNuevosProcessed,
  UsuariosChurnedResponse,
  UsuariosChurnedProcessed,
  CACResponse,
  CACProcessed,
  UnitEconomicsResponse,
  UnitEconomicsProcessed,
  ExpensesResponse,
  ExpensesProcessed,
  IncomeResponse,
  IncomeProcessed,
  CACRatioProcessed,
} from "./types"

// ============================================
// FETCHER GENÉRICO
// ============================================

async function fetchMicro<T>(endpoint: string): Promise<T> {
  const response = await fetch(`/api/micro/${endpoint}`)
  if (!response.ok) throw new Error(`Error fetching ${endpoint}`)
  return response.json()
}

async function fetchCosts<T>(endpoint: string): Promise<T> {
  const response = await fetch(`/api/costs/${endpoint}`)
  if (!response.ok) throw new Error(`Error fetching ${endpoint}`)
  return response.json()
}

// ============================================
// MRR - /micro/mrr
// ============================================

export async function getMRRRaw(): Promise<MRRResponse> {
  return fetchMicro<MRRResponse>("mrr")
}

export async function getMRR(): Promise<MRRProcessed> {
  const rawData = await getMRRRaw()
  
  let totalMRR = 0
  let totalSubscriptions = 0
  const planMap = new Map<string, { mrr: number; subscriptions: number }>()
  const monthMap = new Map<string, number>()
  
  for (const [plan, planData] of Object.entries(rawData)) {
    for (const [month, monthData] of Object.entries(planData)) {
      for (const [, companyData] of Object.entries(monthData)) {
        totalMRR += companyData.mrr
        totalSubscriptions += companyData.subscriptions
        
        const planEntry = planMap.get(plan) || { mrr: 0, subscriptions: 0 }
        planEntry.mrr += companyData.mrr
        planEntry.subscriptions += companyData.subscriptions
        planMap.set(plan, planEntry)
        
        const monthMRR = monthMap.get(month) || 0
        monthMap.set(month, monthMRR + companyData.mrr)
      }
    }
  }
  
  return {
    totalMRR,
    mrrByPlan: Array.from(planMap.entries()).map(([plan, data]) => ({
      plan,
      mrr: data.mrr,
      subscriptions: data.subscriptions,
    })),
    mrrByMonth: Array.from(monthMap.entries())
      .map(([month, mrr]) => ({ month, mrr }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    totalSubscriptions,
  }
}

// ============================================
// MRR NEW - /micro/mrr_new
// ============================================

export async function getMRRNewRaw(): Promise<MRRNewResponse> {
  return fetchMicro<MRRNewResponse>("mrr_new")
}

export async function getMRRNew(): Promise<MRRNewProcessed> {
  const rawData = await getMRRNewRaw()
  
  let totalNewMRR = 0
  const planMap = new Map<string, { newMRR: number; subscriptions: number }>()
  const monthMap = new Map<string, number>()
  
  for (const [plan, planData] of Object.entries(rawData)) {
    for (const [month, monthData] of Object.entries(planData)) {
      for (const [, companyData] of Object.entries(monthData)) {
        totalNewMRR += companyData.new_MRR
        
        const planEntry = planMap.get(plan) || { newMRR: 0, subscriptions: 0 }
        planEntry.newMRR += companyData.new_MRR
        planEntry.subscriptions += companyData.subscriptions
        planMap.set(plan, planEntry)
        
        const monthMRR = monthMap.get(month) || 0
        monthMap.set(month, monthMRR + companyData.new_MRR)
      }
    }
  }
  
  return {
    totalNewMRR,
    newMRRByPlan: Array.from(planMap.entries()).map(([plan, data]) => ({
      plan,
      newMRR: data.newMRR,
      subscriptions: data.subscriptions,
    })),
    newMRRByMonth: Array.from(monthMap.entries())
      .map(([month, newMRR]) => ({ month, newMRR }))
      .sort((a, b) => a.month.localeCompare(b.month)),
  }
}

// ============================================
// CHURN MRR - /micro/churn_mrr
// ============================================

export async function getChurnMRRRaw(): Promise<ChurnMRRResponse> {
  return fetchMicro<ChurnMRRResponse>("churn_mrr")
}

export async function getChurnMRR(): Promise<ChurnMRRProcessed> {
  const rawData = await getChurnMRRRaw()
  
  let totalChurnMRR = 0
  const planMap = new Map<string, number>()
  const monthMap = new Map<string, number>()
  
  for (const [plan, planData] of Object.entries(rawData)) {
    for (const [month, monthData] of Object.entries(planData)) {
      for (const [, companyData] of Object.entries(monthData)) {
        totalChurnMRR += companyData.churned_MRR
        
        const planChurn = planMap.get(plan) || 0
        planMap.set(plan, planChurn + companyData.churned_MRR)
        
        const monthChurn = monthMap.get(month) || 0
        monthMap.set(month, monthChurn + companyData.churned_MRR)
      }
    }
  }
  
  return {
    totalChurnMRR,
    churnMRRByPlan: Array.from(planMap.entries()).map(([plan, churnMRR]) => ({
      plan,
      churnMRR,
    })),
    churnMRRByMonth: Array.from(monthMap.entries())
      .map(([month, churnMRR]) => ({ month, churnMRR }))
      .sort((a, b) => a.month.localeCompare(b.month)),
  }
}

// ============================================
// ARPU - /micro/arpu
// ============================================

export async function getARPURaw(): Promise<ARPUResponse> {
  return fetchMicro<ARPUResponse>("arpu")
}

export async function getARPU(): Promise<ARPUProcessed> {
  const rawData = await getARPURaw()
  
  let totalRevenue = 0
  let totalCompanies = 0
  const arpuByPlan: ARPUProcessed["arpuByPlan"] = []
  
  for (const [plan, data] of Object.entries(rawData)) {
    totalRevenue += data.total_revenue
    totalCompanies += data.active_companies
    arpuByPlan.push({
      plan,
      arpu: data.arpu,
      totalRevenue: data.total_revenue,
      activeCompanies: data.active_companies,
    })
  }
  
  return {
    totalARPU: totalCompanies > 0 ? totalRevenue / totalCompanies : 0,
    arpuByPlan,
  }
}

// ============================================
// LTV - /micro/ltv
// ============================================

export async function getLTVRaw(): Promise<LTVResponse> {
  return fetchMicro<LTVResponse>("ltv")
}

export async function getLTV(): Promise<LTVProcessed> {
  const rawData = await getLTVRaw()
  
  let totalLTV = 0
  let totalCompanies = 0
  const ltvByPlan: LTVProcessed["ltvByPlan"] = []
  
  for (const [plan, data] of Object.entries(rawData)) {
    totalLTV += data.ltv * data.companies
    totalCompanies += data.companies
    ltvByPlan.push({
      plan,
      ltv: data.ltv,
      totalRevenue: data.total_revenue,
      companies: data.companies,
    })
  }
  
  return {
    averageLTV: totalCompanies > 0 ? totalLTV / totalCompanies : 0,
    ltvByPlan,
  }
}

// ============================================
// TICKET PROMEDIO - /micro/ticket_promedio
// ============================================

export async function getTicketPromedioRaw(): Promise<TicketPromedioResponse> {
  return fetchMicro<TicketPromedioResponse>("ticket_promedio")
}

export async function getTicketPromedio(): Promise<TicketPromedioProcessed> {
  const rawData = await getTicketPromedioRaw()
  
  const ticketByMonth: TicketPromedioProcessed["ticketByMonth"] = []
  let currentTicket = 0
  
  for (const [month, data] of Object.entries(rawData)) {
    ticketByMonth.push({
      month,
      ticket: data.prom_ticket,
      totalRevenue: data.total_revenue,
      invoices: data.invoice_id,
    })
    currentTicket = data.prom_ticket
  }
  
  ticketByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  return {
    currentTicket: ticketByMonth[ticketByMonth.length - 1]?.ticket || currentTicket,
    ticketByMonth,
  }
}

// ============================================
// TASA RETENTION - /micro/tasa_retention
// ============================================

export async function getTasaRetentionRaw(): Promise<TasaRetentionResponse> {
  return fetchMicro<TasaRetentionResponse>("tasa_retention")
}

export async function getTasaRetention(): Promise<TasaRetentionProcessed> {
  const rawData = await getTasaRetentionRaw()
  
  const retentionByMonth: TasaRetentionProcessed["retentionByMonth"] = []
  const planMap = new Map<string, { rate: number; count: number }>()
  
  for (const [month, monthData] of Object.entries(rawData)) {
    let monthRetention = 0
    let planCount = 0
    
    for (const [plan, planData] of Object.entries(monthData)) {
      monthRetention += planData.retention_rate
      planCount++
      
      const entry = planMap.get(plan) || { rate: 0, count: 0 }
      entry.rate += planData.retention_rate
      entry.count++
      planMap.set(plan, entry)
    }
    
    retentionByMonth.push({
      month,
      retentionRate: planCount > 0 ? monthRetention / planCount : 0,
    })
  }
  
  retentionByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  return {
    currentRetentionRate: retentionByMonth[retentionByMonth.length - 1]?.retentionRate || 0,
    retentionByMonth,
    retentionByPlan: Array.from(planMap.entries()).map(([plan, data]) => ({
      plan,
      retentionRate: data.count > 0 ? data.rate / data.count : 0,
    })),
  }
}

// ============================================
// TASA CHURN - /micro/tasa_churn
// ============================================

export async function getTasaChurnRaw(): Promise<TasaChurnResponse> {
  return fetchMicro<TasaChurnResponse>("tasa_churn")
}

export async function getTasaChurn(): Promise<TasaChurnProcessed> {
  const rawData = await getTasaChurnRaw()
  
  const churnByMonth: TasaChurnProcessed["churnByMonth"] = []
  const planMap = new Map<string, { rate: number; count: number }>()
  
  for (const [month, monthData] of Object.entries(rawData)) {
    let monthChurn = 0
    let planCount = 0
    
    for (const [plan, planData] of Object.entries(monthData)) {
      monthChurn += planData.churn_rate
      planCount++
      
      const entry = planMap.get(plan) || { rate: 0, count: 0 }
      entry.rate += planData.churn_rate
      entry.count++
      planMap.set(plan, entry)
    }
    
    churnByMonth.push({
      month,
      churnRate: planCount > 0 ? monthChurn / planCount : 0,
    })
  }
  
  churnByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  return {
    currentChurnRate: churnByMonth[churnByMonth.length - 1]?.churnRate || 0,
    churnByMonth,
    churnByPlan: Array.from(planMap.entries()).map(([plan, data]) => ({
      plan,
      churnRate: data.count > 0 ? data.rate / data.count : 0,
    })),
  }
}

// ============================================
// REVENUE CHURN - /micro/revenue_churn
// ============================================

export async function getRevenueChurnRaw(): Promise<RevenueChurnResponse> {
  return fetchMicro<RevenueChurnResponse>("revenue_churn")
}

export async function getRevenueChurn(): Promise<RevenueChurnProcessed> {
  const rawData = await getRevenueChurnRaw()
  
  const revenueChurnByMonth: RevenueChurnProcessed["revenueChurnByMonth"] = []
  
  for (const [month, monthData] of Object.entries(rawData)) {
    let monthRevenueChurn = 0
    let planCount = 0
    
    for (const [, planData] of Object.entries(monthData)) {
      monthRevenueChurn += planData.revenue_churn
      planCount++
    }
    
    revenueChurnByMonth.push({
      month,
      revenueChurn: planCount > 0 ? monthRevenueChurn / planCount : 0,
    })
  }
  
  revenueChurnByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  return {
    currentRevenueChurn: revenueChurnByMonth[revenueChurnByMonth.length - 1]?.revenueChurn || 0,
    revenueChurnByMonth,
  }
}

// ============================================
// USUARIOS ACTIVOS - /micro/usuarios_activos
// ============================================

export async function getUsuariosActivosRaw(): Promise<UsuariosActivosResponse> {
  return fetchMicro<UsuariosActivosResponse>("usuarios_activos")
}

export async function getUsuariosActivos(): Promise<UsuariosActivosProcessed> {
  const rawData = await getUsuariosActivosRaw()
  
  let totalActiveUsers = 0
  const activeUsersByMonth: UsuariosActivosProcessed["activeUsersByMonth"] = []
  const planMap = new Map<string, number>()
  
  for (const [month, monthData] of Object.entries(rawData)) {
    const activeUsers = typeof monthData.active_users === 'number' ? monthData.active_users : 0
    totalActiveUsers += activeUsers
    activeUsersByMonth.push({ month, activeUsers })
    
    for (const [key, value] of Object.entries(monthData)) {
      if (key !== 'active_users' && typeof value === 'object' && 'companies' in value) {
        const companies = (value as { companies: string[] }).companies.length
        planMap.set(key, (planMap.get(key) || 0) + companies)
      }
    }
  }
  
  activeUsersByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  return {
    totalActiveUsers,
    activeUsersByMonth,
    activeUsersByPlan: Array.from(planMap.entries()).map(([plan, companies]) => ({
      plan,
      companies,
    })),
  }
}

// ============================================
// USUARIOS NUEVOS - /micro/usuarios_nuevos
// ============================================

export async function getUsuariosNuevosRaw(): Promise<UsuariosNuevosResponse> {
  return fetchMicro<UsuariosNuevosResponse>("usuarios_nuevos")
}

export async function getUsuariosNuevos(): Promise<UsuariosNuevosProcessed> {
  const rawData = await getUsuariosNuevosRaw()
  
  let totalNewUsers = 0
  const newUsersByMonth: UsuariosNuevosProcessed["newUsersByMonth"] = []
  const planMap = new Map<string, number>()
  
  for (const [month, monthData] of Object.entries(rawData)) {
    let monthNewUsers = 0
    
    for (const [plan, planData] of Object.entries(monthData)) {
      monthNewUsers += planData.new_users
      planMap.set(plan, (planMap.get(plan) || 0) + planData.new_users)
    }
    
    totalNewUsers += monthNewUsers
    newUsersByMonth.push({ month, newUsers: monthNewUsers })
  }
  
  newUsersByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  return {
    totalNewUsers,
    newUsersByMonth,
    newUsersByPlan: Array.from(planMap.entries()).map(([plan, newUsers]) => ({
      plan,
      newUsers,
    })),
  }
}

// ============================================
// USUARIOS CHURNED - /micro/usuarios_churned
// ============================================

export async function getUsuariosChurnedRaw(): Promise<UsuariosChurnedResponse> {
  return fetchMicro<UsuariosChurnedResponse>("usuarios_churned")
}

export async function getUsuariosChurned(): Promise<UsuariosChurnedProcessed> {
  const rawData = await getUsuariosChurnedRaw()
  
  let totalChurnedUsers = 0
  const churnedUsersByMonth: UsuariosChurnedProcessed["churnedUsersByMonth"] = []
  
  for (const [month, monthData] of Object.entries(rawData)) {
    let monthChurnedUsers = 0
    
    for (const [, planData] of Object.entries(monthData)) {
      monthChurnedUsers += planData.churned_users
    }
    
    totalChurnedUsers += monthChurnedUsers
    churnedUsersByMonth.push({ month, churnedUsers: monthChurnedUsers })
  }
  
  churnedUsersByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  return {
    totalChurnedUsers,
    churnedUsersByMonth,
  }
}

// ============================================
// CAC - /costs/cac
// ============================================

export async function getCACRaw(): Promise<CACResponse> {
  return fetchCosts<CACResponse>("cac")
}

export async function getCAC(): Promise<CACProcessed> {
  const rawData = await getCACRaw()
  
  const cacByMonth: CACProcessed["cacByMonth"] = []
  
  for (const [month, data] of Object.entries(rawData)) {
    cacByMonth.push({
      month,
      cac: data.cac,
      marketingCost: data.total_marketing_cost,
      newCustomers: data.new_customers,
    })
  }
  
  cacByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  return {
    currentCAC: cacByMonth[cacByMonth.length - 1]?.cac || 0,
    cacByMonth,
  }
}

// ============================================
// UNIT ECONOMICS - /costs/ue
// ============================================

export async function getUnitEconomicsRaw(): Promise<UnitEconomicsResponse> {
  return fetchCosts<UnitEconomicsResponse>("ue")
}

export async function getUnitEconomics(): Promise<UnitEconomicsProcessed> {
  const rawData = await getUnitEconomicsRaw()
  
  return {
    ltv: rawData.ltv,
    cac: rawData.cac,
    ltvCacRatio: rawData.ltv_cac_ratio,
    paybackMonths: rawData.payback_months,
  }
}

// ============================================
// EXPENSES - /costs/expenses
// ============================================

export async function getExpensesRaw(): Promise<ExpensesResponse> {
  return fetchCosts<ExpensesResponse>("expenses")
}

export async function getExpenses(): Promise<ExpensesProcessed> {
  const rawData = await getExpensesRaw()
  
  let totalExpenses = 0
  const expensesByMonth: ExpensesProcessed["expensesByMonth"] = []
  const categoryMap = new Map<string, number>()
  
  for (const [month, data] of Object.entries(rawData)) {
    totalExpenses += data.total_expenses
    expensesByMonth.push({ month, expenses: data.total_expenses })
    
    for (const [category, amount] of Object.entries(data.categories)) {
      categoryMap.set(category, (categoryMap.get(category) || 0) + amount)
    }
  }
  
  expensesByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  return {
    totalExpenses,
    expensesByMonth,
    expensesByCategory: Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    })),
  }
}

// ============================================
// INCOME - /costs/income
// ============================================

export async function getIncomeRaw(): Promise<IncomeResponse> {
  return fetchCosts<IncomeResponse>("income")
}

export async function getIncome(): Promise<IncomeProcessed> {
  const rawData = await getIncomeRaw()
  
  let totalIncome = 0
  const incomeByMonth: IncomeProcessed["incomeByMonth"] = []
  const sourceMap = new Map<string, number>()
  
  for (const [month, data] of Object.entries(rawData)) {
    totalIncome += data.total_income
    incomeByMonth.push({ month, income: data.total_income })
    
    for (const [source, amount] of Object.entries(data.sources)) {
      sourceMap.set(source, (sourceMap.get(source) || 0) + amount)
    }
  }
  
  incomeByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  return {
    totalIncome,
    incomeByMonth,
    incomeBySource: Array.from(sourceMap.entries()).map(([source, amount]) => ({
      source,
      amount,
    })),
  }
}

// ============================================
// CAC RATIO - Métrica calculada
// Fórmula: (Nuevo MRR × Margen Bruto %) / Costo de Ventas y Marketing (S&M)
// Margen Bruto fijo: 70%
// ============================================

const GROSS_MARGIN = 0.70 // 70% margen bruto fijo

export async function getCACRatio(): Promise<CACRatioProcessed> {
  // Obtener datos de MRR New (numerador) y CAC/Marketing Cost (denominador)
  const [mrrNewData, cacData] = await Promise.all([
    getMRRNew(),
    getCAC(),
  ])
  
  // Crear mapas para acceso rápido por mes
  const mrrNewByMonth = new Map(
    mrrNewData.newMRRByMonth.map(item => [item.month, item.newMRR])
  )
  const cacByMonth = new Map(
    cacData.cacByMonth.map(item => [item.month, item.marketingCost])
  )
  
  // Obtener todos los meses únicos
  const allMonths = new Set([
    ...mrrNewData.newMRRByMonth.map(item => item.month),
    ...cacData.cacByMonth.map(item => item.month),
  ])
  
  // Calcular CAC Ratio para cada mes
  const cacRatioByMonth: CACRatioProcessed["cacRatioByMonth"] = []
  let totalCACRatio = 0
  let validMonths = 0
  
  for (const month of Array.from(allMonths).sort()) {
    const newMRR = mrrNewByMonth.get(month) || 0
    const marketingCost = cacByMonth.get(month) || 0
    
    // CAC Ratio = (Nuevo MRR × Margen Bruto) / Costo Marketing
    // Si no hay costo de marketing, el ratio es 0
    const cacRatio = marketingCost > 0 
      ? (newMRR * GROSS_MARGIN) / marketingCost 
      : 0
    
    cacRatioByMonth.push({
      month,
      cacRatio,
      newMRR,
      grossMargin: GROSS_MARGIN,
      marketingCost,
    })
    
    if (cacRatio > 0) {
      totalCACRatio += cacRatio
      validMonths++
    }
  }
  
  // El CAC Ratio actual es el del último mes con datos
  const currentCACRatio = cacRatioByMonth[cacRatioByMonth.length - 1]?.cacRatio || 0
  const averageCACRatio = validMonths > 0 ? totalCACRatio / validMonths : 0
  
  return {
    currentCACRatio,
    cacRatioByMonth,
    averageCACRatio,
  }
}
