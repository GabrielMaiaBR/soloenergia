-- Solo Smart Database Schema

-- Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'analysis', 'closed', 'lost')),
  system_power_kwp DECIMAL(10,2),
  monthly_generation_kwh DECIMAL(10,2),
  energy_tariff DECIMAL(10,4),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Simulations table
CREATE TABLE public.simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('financing', 'credit_card', 'cash', 'consortium')),
  name TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  system_value DECIMAL(12,2) NOT NULL,
  financed_value DECIMAL(12,2),
  installments INTEGER,
  installment_value DECIMAL(12,2),
  entry_value DECIMAL(12,2),
  grace_period_days INTEGER,
  card_machine_fee DECIMAL(5,2),
  has_cashback BOOLEAN DEFAULT false,
  detected_monthly_rate DECIMAL(6,4),
  rate_semaphore TEXT CHECK (rate_semaphore IN ('excellent', 'average', 'expensive')),
  total_interest_paid DECIMAL(12,2),
  monthly_cashflow DECIMAL(12,2),
  payback_months INTEGER,
  tariff_increase_rate DECIMAL(5,2),
  version_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Timeline notes table
CREATE TABLE public.timeline_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('note', 'objection', 'preference', 'alert', 'simulation')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- App settings table (single row for single user)
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lei_14300_factor DECIMAL(5,4) NOT NULL DEFAULT 0.85,
  default_tariff DECIMAL(10,4) NOT NULL DEFAULT 0.85,
  logo_url TEXT,
  company_name TEXT,
  primary_color TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  pin_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Public access policies (single user app, no auth required for MVP)
CREATE POLICY "Allow all access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to simulations" ON public.simulations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to timeline_notes" ON public.timeline_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.app_settings (lei_14300_factor, default_tariff) VALUES (0.85, 0.85);