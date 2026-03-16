/**
 * TIPOS DE RESPUESTA DE APIs Y METRICAS CALCULADAS
 * 
 * SECCION 1: Interfaces de respuesta de APIs
 *   - Representan exactamente lo que devuelve cada endpoint
 *   - Las APIs ya vienen calculadas, solo se filtran en el UI
 *   - Ante ausencia de mes o plan, se agrega con valor 0 para continuidad
 * 
 * SECCION 2: Interfaces de metricas calculadas
 *   - Se calculan en el frontend a partir de una o mas APIs
 *   - Cada metrica indica su formula, endpoints fuente y nivel de segregacion
 */

// ============================================
// SECCION 1: RESPUESTAS DE APIs
// ============================================

// --------------------------------------------
// MRR - /micro/mrr
// Niveles: plan > mes > nivel_id (ignorar nivel_id)
// Valores: mrr, subscriptions
// Puede faltar mes o plan -> 0
// --------------------------------------------
export interface MRRResponse {
  [plan: string]: {
    [month: string]: {
      [nivelId: string]: {
        mrr: number
        subscriptions: number
      }
    }
  }
}

// --------------------------------------------
// MRR NEW - /micro/mrr_new
// Niveles: plan > mes > nivel_id (ignorar nivel_id)
// Valores: new_MRR, subscriptions
// Puede faltar mes o plan -> 0
// --------------------------------------------
export interface MRRNewResponse {
  [plan: string]: {
    [month: string]: {
      [nivelId: string]: {
        new_MRR: number
        subscriptions: number
      }
    }
  }
}

// --------------------------------------------
// CHURN MRR - /micro/churn_mrr
// Niveles: plan > mes > nivel_id (ignorar nivel_id)
// Valores: Chur_MRR, subscriptions
// Puede faltar mes o plan -> 0
// --------------------------------------------
export interface ChurnMRRResponse {
  [plan: string]: {
    [month: string]: {
      [nivelId: string]: {
        Chur_MRR: number
        subscriptions: number
      }
    }
  }
}

// --------------------------------------------
// ARPU - /micro/arpu
// Niveles: plan > mes
// Valores: arpu, users
// Para global mensual: promediar arpu de todos los planes
//   (NO basarse en users, pueden ser los mismos entre meses)
// Puede faltar mes o plan -> 0
// --------------------------------------------
export interface ARPUResponse {
  [plan: string]: {
    [month: string]: {
      arpu: number
      users: number
    }
  }
}

// --------------------------------------------
// LTV - /micro/ltv
// Niveles: solo plan (sin fecha)
// Valores: total_revenue, ltv, companies
// El valor puede cambiar en el tiempo
// Siempre existiran los planes registrados
// --------------------------------------------
export interface LTVResponse {
  [plan: string]: {
    total_revenue: number
    ltv: number
    companies: number
  }
}

// --------------------------------------------
// TICKET PROMEDIO - /micro/ticket_promedio
// Niveles: solo fecha (sin plan)
// Valor clave: prom_ticket (minuscula)
// Prom_ticket (mayuscula) puede venir como 0, ignorar
// Para global: promediar todos los meses
// --------------------------------------------
export interface TicketPromedioResponse {
  [month: string]: {
    total_revenue: number
    Prom_ticket: number
    invoice_id: number
    prom_ticket: number
  }
}

// --------------------------------------------
// TASA RETENTION - /micro/tasa_retention
// Niveles: solo fecha (sin plan)
// Valor: porcentaje (100 = 100%)
// Siempre hay continuidad salvo meses futuros
// --------------------------------------------
export interface TasaRetentionResponse {
  [month: string]: number
}

// --------------------------------------------
// TASA CHURN - /micro/tasa_churn
// Niveles: solo fecha (sin plan)
// Valor: porcentaje (0 = 0%)
// Siempre hay continuidad salvo meses futuros
// --------------------------------------------
export interface TasaChurnResponse {
  [month: string]: number
}

// --------------------------------------------
// REVENUE CHURN - /micro/revenue_churn
// Niveles: solo fecha (sin plan)
// Valor: monto en dolares
// Siempre hay continuidad salvo meses futuros
// --------------------------------------------
export interface RevenueChurnResponse {
  [month: string]: number
}

// --------------------------------------------
// USUARIOS ACTIVOS - /micro/usuarios_activos
// Niveles: mes > plan
// active_users: a nivel del mes (total del mes, no por plan)
// Para activos por plan: contar companies[] de cada plan
// Si falta active_users, plan o mes -> 0
// Puede no haber continuidad
// --------------------------------------------
export interface UsuariosActivosResponse {
  [month: string]: {
    active_users?: number
    [plan: string]: {
      companies: string[]
    } | number | undefined
  }
}

// --------------------------------------------
// USUARIOS NUEVOS - /micro/usuarios_nuevos
// Niveles: mes > plan
// Valores: companies[] (ignorar), new_users
// Si falta new_users, plan o mes -> 0
// Puede no haber continuidad
// --------------------------------------------
export interface UsuariosNuevosResponse {
  [month: string]: {
    [plan: string]: {
      companies: string[]
      new_users: number
    }
  }
}

// --------------------------------------------
// USUARIOS CHURNED - /micro/usuarios_churned
// Niveles: mes > plan
// Valores: companies[] (ignorar), churned_users
// Si falta churned_users, plan o mes -> 0
// Puede no haber continuidad
// --------------------------------------------
export interface UsuariosChurnedResponse {
  [month: string]: {
    [plan: string]: {
      companies: string[]
      churned_users: number
    }
  }
}

// --------------------------------------------
// CAC - /costs/cac
// Params: start_date (obligatorio: 2025-12-31T23:59:59.999), acumulado=true
// Niveles: solo fecha
// Valor: monto acumulado en dolares
// Puede no haber continuidad
// --------------------------------------------
export interface CACResponse {
  [month: string]: number
}

// --------------------------------------------
// UNIT ECONOMICS / DCPA - /costs/ue
// Params: start_date (obligatorio: 2025-12-31T23:59:59.999), acumulado=true
// Niveles: solo fecha
// Valor: monto acumulado en dolares
// Puede no haber continuidad
// --------------------------------------------
export interface UnitEconomicsResponse {
  [month: string]: number
}


// ============================================
// SECCION 2: METRICAS CALCULADAS
// ============================================

// --------------------------------------------
// CAC RATIO
// Formula: (New MRR global mes * GROSS_MARGIN) / CAC mes
// Endpoints: /micro/mrr_new + /costs/cac
// Nivel: solo fecha (sin plan, porque CAC es mensual)
// Reglas:
//   - Si New MRR del mes = 0 -> CAC Ratio = 0
//   - Si CAC del mes = 0 -> usar 1 como divisor (rendimiento completo)
// --------------------------------------------
export interface CACRatioDataPoint {
  month: string
  cacRatio: number
  newMRR: number
  cac: number
}

export interface CACRatioResult {
  currentCACRatio: number
  previousCACRatio: number
  cacRatioByMonth: CACRatioDataPoint[]
}

// --------------------------------------------
// NEW ARR
// Formula: New MRR * 12
// Endpoint: /micro/mrr_new
// Nivel: plan y fecha
// Proyeccion: ultimo mes real -> se repite para meses restantes del anio
//   (incluso si el ultimo mes es 0, la proyeccion es 0)
// --------------------------------------------
export interface NewARRDataPoint {
  month: string
  plan: string
  newMRR: number
  newARR: number     // newMRR * 12
  isProjected: boolean
}

export interface NewARRResult {
  annualizedNewARR: number
  newARRByMonth: { month: string; newARR: number; isProjected: boolean }[]
  newARRByPlanAndMonth: NewARRDataPoint[]
  plans: string[]
}

// --------------------------------------------
// CHURN ARR
// Formula: Churn MRR * 12
// Endpoint: /micro/churn_mrr
// Nivel: plan y fecha
// Proyeccion: ultimo mes real -> se repite para meses restantes del anio
//   (incluso si el ultimo mes es 0, la proyeccion es 0)
// --------------------------------------------
export interface ChurnARRDataPoint {
  month: string
  plan: string
  churnMRR: number
  churnARR: number   // churnMRR * 12
  isProjected: boolean
}

export interface ChurnARRResult {
  annualizedChurnARR: number
  churnARRByMonth: { month: string; churnARR: number; isProjected: boolean }[]
  churnARRByPlanAndMonth: ChurnARRDataPoint[]
  plans: string[]
}

// --------------------------------------------
// CAC PAYBACK
// Formula: CAC / (ARPU mensual promedio global * GROSS_MARGIN)
// Endpoints: /costs/cac + /micro/arpu
// Nivel: solo fecha (sin plan, porque CAC es mensual y ARPU se promedia)
// Resultado en meses
// --------------------------------------------
export interface CACPaybackDataPoint {
  month: string
  cacPayback: number  // en meses
  cac: number
  arpu: number
}

export interface CACPaybackResult {
  currentCACPayback: number
  previousCACPayback: number
  cacPaybackByMonth: CACPaybackDataPoint[]
}
