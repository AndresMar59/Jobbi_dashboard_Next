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
  CACPaybackCalculatedProcessed,
  NewARRProcessed,
  ChurnARRProcessed,
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
  
  const plans: string[] = []
  const arpuByPlanAndMonth: ARPUProcessed["arpuByPlanAndMonth"] = []
  const monthMap = new Map<string, { totalArpu: number; count: number }>()
  const planMap = new Map<string, { totalArpu: number; totalUsers: number; count: number }>()
  
  // Procesar estructura: Plan > Mes > { arpu, users }
  for (const [plan, monthsData] of Object.entries(rawData)) {
    if (!plans.includes(plan)) plans.push(plan)
    
    for (const [month, data] of Object.entries(monthsData)) {
      arpuByPlanAndMonth.push({
        plan,
        month,
        arpu: data.arpu,
        users: data.users,
      })
      
      // Agregar al mapa de meses
      const monthEntry = monthMap.get(month) || { totalArpu: 0, count: 0 }
      monthEntry.totalArpu += data.arpu
      monthEntry.count += 1
      monthMap.set(month, monthEntry)
      
      // Agregar al mapa de planes
      const planEntry = planMap.get(plan) || { totalArpu: 0, totalUsers: 0, count: 0 }
      planEntry.totalArpu += data.arpu
      planEntry.totalUsers += data.users
      planEntry.count += 1
      planMap.set(plan, planEntry)
    }
  }
  
  // Convertir a arrays
  const arpuByMonth = Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      arpu: data.count > 0 ? data.totalArpu / data.count : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
  
  const arpuByPlan = Array.from(planMap.entries()).map(([plan, data]) => ({
    plan,
    arpu: data.count > 0 ? data.totalArpu / data.count : 0,
    users: data.totalUsers,
  }))
  
  // Calcular ARPU total y actual
  const allArpus = arpuByPlanAndMonth.map(item => item.arpu)
  const totalARPU = allArpus.length > 0 ? allArpus.reduce((a, b) => a + b, 0) / allArpus.length : 0
  const currentARPU = arpuByMonth[arpuByMonth.length - 1]?.arpu || 0
  
  return {
    totalARPU,
    currentARPU,
    arpuByPlan,
    arpuByMonth,
    arpuByPlanAndMonth,
    plans,
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
  
  const activeCompaniesByMonth: UsuariosActivosProcessed["activeCompaniesByMonth"] = []
  const planMap = new Map<string, number>()
  const plans = new Set<string>()
  
  for (const [month, monthData] of Object.entries(rawData)) {
    // Contar companies activas en este mes sumando todas las companies de cada plan
    let monthActiveCompanies = 0
    
    for (const [key, value] of Object.entries(monthData)) {
      if (key !== 'active_users' && typeof value === 'object' && value !== null && 'companies' in value) {
        const planData = value as { companies: string[] }
        const companiesCount = planData.companies.length
        monthActiveCompanies += companiesCount
        plans.add(key)
        planMap.set(key, (planMap.get(key) || 0) + companiesCount)
      }
    }
    
    activeCompaniesByMonth.push({ month, activeCompanies: monthActiveCompanies })
  }
  
  activeCompaniesByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  // Obtener el valor actual (último mes) y anterior
  const currentActiveCompanies = activeCompaniesByMonth[activeCompaniesByMonth.length - 1]?.activeCompanies || 0
  const previousActiveCompanies = activeCompaniesByMonth[activeCompaniesByMonth.length - 2]?.activeCompanies || 0
  
  return {
    currentActiveCompanies,
    previousActiveCompanies,
    activeCompaniesByMonth,
    activeCompaniesByPlan: Array.from(planMap.entries()).map(([plan, companies]) => ({
      plan,
      companies,
    })),
    plans: Array.from(plans),
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
  
  // Estructura: { [month]: cac_value }
  for (const [month, cac] of Object.entries(rawData)) {
    cacByMonth.push({
      month,
      cac: typeof cac === 'number' ? cac : 0,
    })
  }
  
  cacByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  const currentCAC = cacByMonth[cacByMonth.length - 1]?.cac || 0
  const previousCAC = cacByMonth[cacByMonth.length - 2]?.cac || 0
  
  return {
    currentCAC,
    previousCAC,
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
    cacData.cacByMonth.map(item => [item.month, item.cac])
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

// ============================================
// CAC PAYBACK - Métrica calculada
// Fórmula: CAC / (ARPU Mensual × Margen Bruto %)
// Margen Bruto fijo: 70%
// ============================================

export async function getCACPaybackCalculated(): Promise<CACPaybackCalculatedProcessed> {
  // Obtener datos de CAC (numerador) y ARPU (denominador)
  const [cacData, arpuData] = await Promise.all([
    getCAC(),
    getARPU(),
  ])
  
  // ARPU es un valor único por plan, usamos el ARPU total
  const arpu = arpuData.totalARPU
  
  // Calcular CAC Payback para cada mes
  const cacPaybackByMonth: CACPaybackCalculatedProcessed["cacPaybackByMonth"] = []
  let totalCACPayback = 0
  let validMonths = 0
  
  for (const cacMonth of cacData.cacByMonth) {
    const cac = cacMonth.cac
    
    // CAC Payback = CAC / (ARPU × Margen Bruto)
    // Si ARPU es 0, el payback es 0
    const denominator = arpu * GROSS_MARGIN
    const cacPayback = denominator > 0 ? cac / denominator : 0
    
    cacPaybackByMonth.push({
      month: cacMonth.month,
      cacPayback,
      cac,
      arpu,
      grossMargin: GROSS_MARGIN,
    })
    
    if (cacPayback > 0) {
      totalCACPayback += cacPayback
      validMonths++
    }
  }
  
  // El CAC Payback actual es el del último mes con datos
  const currentCACPayback = cacPaybackByMonth[cacPaybackByMonth.length - 1]?.cacPayback || 0
  const averageCACPayback = validMonths > 0 ? totalCACPayback / validMonths : 0
  
  return {
    currentCACPayback,
    cacPaybackByMonth,
    averageCACPayback,
  }
}

// ============================================
// NEW ARR - Métrica anualizada con proyección
// Fórmula: New ARR = New MRR × 12
// Proyección: el último mes real se usa para los meses restantes del año
// ============================================

const ALL_MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]

export async function getNewARR(year: string = "2026"): Promise<NewARRProcessed> {
  const mrrNewData = await getMRRNew()
  
  // Filtrar solo los meses del año solicitado y ordenar
  const realMonthsData = mrrNewData.newMRRByMonth
    .filter(item => item.month.startsWith(year))
    .sort((a, b) => a.month.localeCompare(b.month))
  
  if (realMonthsData.length === 0) {
    return {
      totalNewARR: 0,
      currentNewMRR: 0,
      annualizedNewARR: 0,
      newARRByMonth: [],
      lastRealMonth: "",
    }
  }
  
  // Obtener el último mes con datos reales
  const lastRealData = realMonthsData[realMonthsData.length - 1]
  const lastRealMonth = lastRealData.month
  const currentNewMRR = lastRealData.newMRR
  const lastMonthNumber = parseInt(lastRealMonth.split("-")[1])
  
  // Crear mapa de meses reales
  const realDataMap = new Map(realMonthsData.map(item => [item.month, item.newMRR]))
  
  // Construir array con datos reales + proyecciones
  const newARRByMonth: NewARRProcessed["newARRByMonth"] = []
  let totalNewARR = 0
  
  for (const monthNum of ALL_MONTHS) {
    const monthKey = `${year}-${monthNum}`
    const monthInt = parseInt(monthNum)
    
    let newMRR: number
    let isProjected: boolean
    
    if (realDataMap.has(monthKey)) {
      // Datos reales
      newMRR = realDataMap.get(monthKey)!
      isProjected = false
    } else if (monthInt > lastMonthNumber) {
      // Proyección: usar el último mes real
      newMRR = currentNewMRR
      isProjected = true
    } else {
      // Mes anterior sin datos: 0
      newMRR = 0
      isProjected = false
    }
    
    const newARR = newMRR * 12
    totalNewARR += newARR
    
    newARRByMonth.push({
      month: monthKey,
      newMRR,
      newARR,
      isProjected,
    })
  }
  
  return {
    totalNewARR,
    currentNewMRR,
    annualizedNewARR: currentNewMRR * 12,
    newARRByMonth,
    lastRealMonth,
  }
}

// ============================================
// CHURN ARR - Métrica anualizada con proyección
// Fórmula: Churn ARR = Churn MRR × 12
// Proyección: el último mes real se usa para los meses restantes del año
// ============================================

export async function getChurnARR(year: string = "2026"): Promise<ChurnARRProcessed> {
  const churnMRRData = await getChurnMRR()
  
  // Filtrar solo los meses del año solicitado y ordenar
  const realMonthsData = churnMRRData.churnMRRByMonth
    .filter(item => item.month.startsWith(year))
    .sort((a, b) => a.month.localeCompare(b.month))
  
  if (realMonthsData.length === 0) {
    return {
      totalChurnARR: 0,
      currentChurnMRR: 0,
      annualizedChurnARR: 0,
      churnARRByMonth: [],
      lastRealMonth: "",
    }
  }
  
  // Obtener el último mes con datos reales
  const lastRealData = realMonthsData[realMonthsData.length - 1]
  const lastRealMonth = lastRealData.month
  const currentChurnMRR = lastRealData.churnMRR
  const lastMonthNumber = parseInt(lastRealMonth.split("-")[1])
  
  // Crear mapa de meses reales
  const realDataMap = new Map(realMonthsData.map(item => [item.month, item.churnMRR]))
  
  // Construir array con datos reales + proyecciones
  const churnARRByMonth: ChurnARRProcessed["churnARRByMonth"] = []
  let totalChurnARR = 0
  
  for (const monthNum of ALL_MONTHS) {
    const monthKey = `${year}-${monthNum}`
    const monthInt = parseInt(monthNum)
    
    let churnMRR: number
    let isProjected: boolean
    
    if (realDataMap.has(monthKey)) {
      // Datos reales
      churnMRR = realDataMap.get(monthKey)!
      isProjected = false
    } else if (monthInt > lastMonthNumber) {
      // Proyección: usar el último mes real
      churnMRR = currentChurnMRR
      isProjected = true
    } else {
      // Mes anterior sin datos: 0
      churnMRR = 0
      isProjected = false
    }
    
    const churnARR = churnMRR * 12
    totalChurnARR += churnARR
    
    churnARRByMonth.push({
      month: monthKey,
      churnMRR,
      churnARR,
      isProjected,
    })
  }
  
  return {
    totalChurnARR,
    currentChurnMRR,
    annualizedChurnARR: currentChurnMRR * 12,
    churnARRByMonth,
    lastRealMonth,
  }
}
