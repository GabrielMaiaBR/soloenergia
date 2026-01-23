// Solo Smart Types
// Tipagem centralizada para todo o app

// ============ Enums / Status ============

export type ClientStatus = "lead" | "analysis" | "closed" | "lost";

export type SimulationType = "financing" | "credit_card" | "cash";

export type RateSemaphore = "excellent" | "average" | "expensive";

// ============ Client ============

export interface Client {
  id: string;
  name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  status: ClientStatus;
  // Location (for HSP calculation)
  city?: string;
  state_code?: string;
  // Project data
  monthly_consumption_kwh?: number;  // Consumo mensal (input)
  system_power_kwp?: number;
  monthly_generation_kwh?: number;
  energy_tariff?: number;
  notes?: string;
  // Follow-up tracking
  last_contact_date?: string;
  needs_attention?: boolean;
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============ Simulation ============

export interface Simulation {
  id: string;
  client_id: string;
  version: number;
  type: SimulationType;
  name?: string;
  is_favorite: boolean;
  // Financial inputs
  system_value: number;
  financed_value?: number;
  installments?: number;
  installment_value?: number;
  entry_value?: number;
  grace_period_days?: number;
  // Credit card specific
  card_machine_fee?: number;
  has_cashback?: boolean;
  // Calculated outputs
  detected_monthly_rate?: number;
  rate_semaphore?: RateSemaphore;
  total_interest_paid?: number;
  monthly_cashflow?: number;
  payback_months?: number;
  // Tariff projection
  tariff_increase_rate?: number;
  // Metadata
  version_note?: string;
  created_at: string;
}

// ============ Timeline / Notes ============

export interface TimelineNote {
  id: string;
  client_id: string;
  content: string;
  type: "note" | "objection" | "preference" | "alert" | "simulation";
  created_at: string;
}

// ============ Settings ============

export interface AppSettings {
  id: string;
  // Lei 14.300
  lei_14300_factor: number;
  default_tariff: number;
  // Branding
  logo_url?: string;
  company_name?: string;
  primary_color?: string;
  contact_phone?: string;
  contact_email?: string;
  // WhatsApp for reports
  whatsapp_number?: string;
  // Follow-up settings
  follow_up_days?: number;
  // Auth
  pin_hash?: string;
  created_at: string;
  updated_at: string;
}

// ============ Dashboard KPIs ============

export interface DashboardKPIs {
  total_clients: number;
  proposals_in_analysis: number;
  favorite_simulations: number;
}

// ============ Financial Calculations ============

export interface CashflowResult {
  monthly_economy: number;
  monthly_cashflow: number;
  is_positive: boolean;
}

export interface PaybackResult {
  months: number;
  years: number;
  display: string;
}

export interface RateDetectionResult {
  monthly_rate: number;
  annual_rate: number;
  semaphore: RateSemaphore;
  total_interest: number;
}
