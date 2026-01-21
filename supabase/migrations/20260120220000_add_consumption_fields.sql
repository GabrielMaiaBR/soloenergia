-- Adiciona campo de consumo mensal e cidade/estado para HSP
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS monthly_consumption_kwh DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state_code TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.clients.monthly_consumption_kwh IS 'Consumo mensal de energia do cliente em kWh';
COMMENT ON COLUMN public.clients.city IS 'Cidade do cliente para cálculo de HSP';
COMMENT ON COLUMN public.clients.state_code IS 'Código do estado (UF) para cálculo de HSP';
