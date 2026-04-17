export interface JobbiPeriod {
  date_from: string;
  date_to: string;
  days: number;
}

export interface JobbiMRR {
  total: number;
  subscription: number;
  payroll: number;
  previous: number;
  change: number;
  change_percent: number;
}

export interface JobbiMRRMovements {
  new_mrr: number;
  expansion_mrr: number;
  contraction_mrr: number;
  churn_mrr: number;
  net_mrr: number;
}

export interface JobbiAccounts {
  active: number;
  new: number;
  churned: number;
  retained: number;
  start_period: number;
  end_period: number;
}

export interface JobbiRates {
  arpa: number;
  churn_rate: number;
  retention_rate: number;
  gross_churn_rate: number;
  net_revenue_churn: number;
  revenue_expansion_rate: number;
  grr: number;
  nrr: number;
}

export interface JobbiOther {
  ticket_promedio: number;
  total_revenue: number;
  total_transactions: number;
}

export interface JobbiExternal {
  cac?: number;
  ltv?: number;
  [key: string]: any; // Para campos adicionales que puedan venir
}

// La interfaz maestra de un objeto de métrica
export interface JobbiMetricItem {
  period: JobbiPeriod;
  filters_applied: any;
  mrr: JobbiMRR;
  mrr_movements: JobbiMRRMovements;
  accounts: JobbiAccounts;
  rates: JobbiRates;
  other: JobbiOther;
  external_required: JobbiExternal;
}

// Respuesta de la API de History
export interface JobbiHistoryResponse {
  success: boolean;
  data: JobbiMetricItem[];
  group_by: string;
  periods_count: number;
}

// Respuesta de la API Single (KPIs)
export interface JobbiSingleResponse {
  success: boolean;
  data: JobbiMetricItem;
}