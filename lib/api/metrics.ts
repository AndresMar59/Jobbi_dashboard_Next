/**
 * METRICS.TS - Fetcher generico y Metricas Calculadas
 * 
 * SECCION 1: Fetcher generico para SWR
 *   - Una sola funcion que los hooks usan con useSWR
 *   - Los route handlers (/api/micro/... y /api/costs/...) ya manejan
 *     parametros obligatorios (start_date, acumulado para CAC/UE)
 * 
 * SECCION 2: Metricas Calculadas
 *   - Funciones puras que reciben data cruda y retornan resultados
 *   - NO hacen fetch por si mismas
 *   - Se llaman desde hooks que ya tienen la data via SWR
 * 
 * NOTA: Las APIs NO se procesan aqui. Los hooks obtienen la data cruda
 * via SWR y aplican filtros (año, mes, plan) directamente.
 */

import type {
  MRRNewResponse,
  ChurnMRRResponse,
  ARPUResponse,
  CACResponse,
  CACRatioResult,
  CACRatioDataPoint,
  NewARRResult,
  NewARRDataPoint,
  ChurnARRResult,
  ChurnARRDataPoint,
  CACPaybackResult,
  CACPaybackDataPoint,
} from "./types"

// ============================================
// CONSTANTES DE NEGOCIO
// ============================================

export const GROSS_MARGIN = 0.70  // Margen bruto 70%
export const ALL_MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]

// ============================================
// SECCION 1: FETCHER GENERICO PARA SWR
// ============================================
// Uso en hooks: useSWR("/api/micro/mrr", fetcher)
// Los componentes NO llaman a esto directamente, usan hooks.

export const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
})


// ============================================
// SECCION 2: METRICAS CALCULADAS
// ============================================
// Funciones puras: reciben data cruda -> retornan resultado calculado.
// Se invocan desde los hooks despues de obtener la data via SWR.


// --------------------------------------------
// CAC RATIO
// Formula: (New MRR global mes * GROSS_MARGIN) / CAC mes
// Nivel: solo fecha (New MRR se suma globalmente por mes, sin plan)
// Reglas:
//   - Si New MRR del mes = 0 -> CAC Ratio = 0
//   - Si CAC del mes = 0 -> usar 1 como divisor (rendimiento completo)
// --------------------------------------------

export function calculateCACRatio(
  mrrNewData: MRRNewResponse,
  cacData: CACResponse
): CACRatioResult {
  // 1. Sumar New MRR global por mes (todos los planes, todos los nivel_ids)
  const newMRRByMonth = new Map<string, number>()

  for (const [, planMonths] of Object.entries(mrrNewData)) {
    for (const [month, nivelIds] of Object.entries(planMonths)) {
      let monthTotal = newMRRByMonth.get(month) || 0
      for (const [, data] of Object.entries(nivelIds)) {
        monthTotal += data.new_MRR
      }
      newMRRByMonth.set(month, monthTotal)
    }
  }

  // 2. Unir todos los meses de ambas fuentes
  const allMonths = new Set<string>([
    ...newMRRByMonth.keys(),
    ...Object.keys(cacData),
  ])
  const sortedMonths = Array.from(allMonths).sort()

  // 3. Calcular CAC Ratio por mes
  const cacRatioByMonth: CACRatioDataPoint[] = sortedMonths.map(month => {
    const newMRR = newMRRByMonth.get(month) || 0
    const cac = cacData[month] || 0

    let cacRatio = 0
    if (newMRR === 0) {
      cacRatio = 0
    } else {
      const divisor = cac === 0 ? 1 : cac
      cacRatio = (newMRR * GROSS_MARGIN) / divisor
    }

    return { month, cacRatio, newMRR, cac }
  })

  const current = cacRatioByMonth[cacRatioByMonth.length - 1]?.cacRatio || 0
  const previous = cacRatioByMonth[cacRatioByMonth.length - 2]?.cacRatio || 0

  return {
    currentCACRatio: current,
    previousCACRatio: previous,
    cacRatioByMonth,
  }
}


// --------------------------------------------
// NEW ARR
// Formula: New MRR * 12
// Nivel: plan y fecha
// Proyeccion: por cada plan, el ultimo mes real se repite
//   para los meses restantes del anio (incluso si es 0)
// --------------------------------------------

export function calculateNewARR(
  mrrNewData: MRRNewResponse,
  year: string = "2026"
): NewARRResult {
  // 1. Sumar New MRR por plan y mes (agregar nivel_ids)
  const plans = new Set<string>()
  const planMonthMap = new Map<string, number>() // key: "plan|month"

  for (const [plan, planMonths] of Object.entries(mrrNewData)) {
    plans.add(plan)
    for (const [month, nivelIds] of Object.entries(planMonths)) {
      if (!month.startsWith(year)) continue
      const key = `${plan}|${month}`
      let total = planMonthMap.get(key) || 0
      for (const [, data] of Object.entries(nivelIds)) {
        total += data.new_MRR
      }
      planMonthMap.set(key, total)
    }
  }

  // 2. Para cada plan: encontrar ultimo mes real y proyectar resto del anio
  const allPlans = Array.from(plans)
  const newARRByPlanAndMonth: NewARRDataPoint[] = []

  for (const plan of allPlans) {
    let lastRealMonthNum = 0
    let lastRealValue = 0
    for (const monthNum of ALL_MONTHS) {
      const key = `${plan}|${year}-${monthNum}`
      if (planMonthMap.has(key)) {
        lastRealMonthNum = parseInt(monthNum)
        lastRealValue = planMonthMap.get(key)!
      }
    }

    for (const monthNum of ALL_MONTHS) {
      const month = `${year}-${monthNum}`
      const monthInt = parseInt(monthNum)
      const key = `${plan}|${month}`

      let newMRR: number
      let isProjected: boolean

      if (planMonthMap.has(key)) {
        newMRR = planMonthMap.get(key)!
        isProjected = false
      } else if (monthInt > lastRealMonthNum && lastRealMonthNum > 0) {
        newMRR = lastRealValue
        isProjected = true
      } else {
        newMRR = 0
        isProjected = false
      }

      newARRByPlanAndMonth.push({
        month, plan, newMRR,
        newARR: newMRR * 12,
        isProjected,
      })
    }
  }

  // 3. Agregar por mes (global)
  const monthTotals = new Map<string, { arr: number; projected: boolean }>()
  for (const item of newARRByPlanAndMonth) {
    const entry = monthTotals.get(item.month) || { arr: 0, projected: true }
    entry.arr += item.newARR
    if (!item.isProjected) entry.projected = false
    monthTotals.set(item.month, entry)
  }

  const newARRByMonth = ALL_MONTHS.map(m => {
    const month = `${year}-${m}`
    const entry = monthTotals.get(month) || { arr: 0, projected: false }
    return { month, newARR: entry.arr, isProjected: entry.projected }
  })

  const lastReal = newARRByMonth.filter(m => !m.isProjected).pop()
  const annualizedNewARR = lastReal ? lastReal.newARR : 0

  return {
    annualizedNewARR,
    newARRByMonth,
    newARRByPlanAndMonth,
    plans: allPlans,
  }
}


// --------------------------------------------
// CHURN ARR
// Formula: Churn MRR * 12
// Nivel: plan y fecha
// Proyeccion: por cada plan, el ultimo mes real se repite
//   para los meses restantes del anio (incluso si es 0)
// Key en la respuesta: Chur_MRR
// --------------------------------------------

export function calculateChurnARR(
  churnMRRData: ChurnMRRResponse,
  year: string = "2026"
): ChurnARRResult {
  // 1. Sumar Churn MRR por plan y mes (agregar nivel_ids)
  const plans = new Set<string>()
  const planMonthMap = new Map<string, number>()

  for (const [plan, planMonths] of Object.entries(churnMRRData)) {
    plans.add(plan)
    for (const [month, nivelIds] of Object.entries(planMonths)) {
      if (!month.startsWith(year)) continue
      const key = `${plan}|${month}`
      let total = planMonthMap.get(key) || 0
      for (const [, data] of Object.entries(nivelIds)) {
        total += data.Chur_MRR
      }
      planMonthMap.set(key, total)
    }
  }

  // 2. Para cada plan: encontrar ultimo mes real y proyectar
  const allPlans = Array.from(plans)
  const churnARRByPlanAndMonth: ChurnARRDataPoint[] = []

  for (const plan of allPlans) {
    let lastRealMonthNum = 0
    let lastRealValue = 0
    for (const monthNum of ALL_MONTHS) {
      const key = `${plan}|${year}-${monthNum}`
      if (planMonthMap.has(key)) {
        lastRealMonthNum = parseInt(monthNum)
        lastRealValue = planMonthMap.get(key)!
      }
    }

    for (const monthNum of ALL_MONTHS) {
      const month = `${year}-${monthNum}`
      const monthInt = parseInt(monthNum)
      const key = `${plan}|${month}`

      let churnMRR: number
      let isProjected: boolean

      if (planMonthMap.has(key)) {
        churnMRR = planMonthMap.get(key)!
        isProjected = false
      } else if (monthInt > lastRealMonthNum && lastRealMonthNum > 0) {
        churnMRR = lastRealValue
        isProjected = true
      } else {
        churnMRR = 0
        isProjected = false
      }

      churnARRByPlanAndMonth.push({
        month, plan, churnMRR,
        churnARR: churnMRR * 12,
        isProjected,
      })
    }
  }

  // 3. Agregar por mes (global)
  const monthTotals = new Map<string, { arr: number; projected: boolean }>()
  for (const item of churnARRByPlanAndMonth) {
    const entry = monthTotals.get(item.month) || { arr: 0, projected: true }
    entry.arr += item.churnARR
    if (!item.isProjected) entry.projected = false
    monthTotals.set(item.month, entry)
  }

  const churnARRByMonth = ALL_MONTHS.map(m => {
    const month = `${year}-${m}`
    const entry = monthTotals.get(month) || { arr: 0, projected: false }
    return { month, churnARR: entry.arr, isProjected: entry.projected }
  })

  const lastReal = churnARRByMonth.filter(m => !m.isProjected).pop()
  const annualizedChurnARR = lastReal ? lastReal.churnARR : 0

  return {
    annualizedChurnARR,
    churnARRByMonth,
    churnARRByPlanAndMonth,
    plans: allPlans,
  }
}


// --------------------------------------------
// CAC PAYBACK
// Formula: CAC / (ARPU mensual promedio global * GROSS_MARGIN)
// Nivel: solo fecha (sin plan)
// ARPU: se promedia entre todos los planes por mes
//   (NO basarse en users, pueden ser los mismos entre meses)
// Resultado en meses
// --------------------------------------------

export function calculateCACPayback(
  cacData: CACResponse,
  arpuData: ARPUResponse
): CACPaybackResult {
  // 1. Calcular ARPU promedio global por mes
  const arpuByMonth = new Map<string, { totalArpu: number; planCount: number }>()

  for (const [, planMonths] of Object.entries(arpuData)) {
    for (const [month, data] of Object.entries(planMonths)) {
      const entry = arpuByMonth.get(month) || { totalArpu: 0, planCount: 0 }
      entry.totalArpu += data.arpu
      entry.planCount += 1
      arpuByMonth.set(month, entry)
    }
  }

  // 2. Unir todos los meses
  const allMonths = new Set<string>([
    ...arpuByMonth.keys(),
    ...Object.keys(cacData),
  ])
  const sortedMonths = Array.from(allMonths).sort()

  // 3. Calcular CAC Payback por mes
  const cacPaybackByMonth: CACPaybackDataPoint[] = sortedMonths.map(month => {
    const cac = cacData[month] || 0
    const arpuEntry = arpuByMonth.get(month)
    const avgArpu = arpuEntry && arpuEntry.planCount > 0
      ? arpuEntry.totalArpu / arpuEntry.planCount
      : 0

    let cacPayback = 0
    if (cac > 0 && avgArpu > 0) {
      cacPayback = cac / (avgArpu * GROSS_MARGIN)
    }

    return { month, cacPayback, cac, arpu: avgArpu }
  })

  const current = cacPaybackByMonth[cacPaybackByMonth.length - 1]?.cacPayback || 0
  const previous = cacPaybackByMonth[cacPaybackByMonth.length - 2]?.cacPayback || 0

  return {
    currentCACPayback: current,
    previousCACPayback: previous,
    cacPaybackByMonth,
  }
}
