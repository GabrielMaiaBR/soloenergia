-- Migration: Add fields for new features (v2.0)
-- Date: 2026-01-22

-- Add WhatsApp number for reports
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Add follow-up days setting (default 7 days)
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS follow_up_days INTEGER DEFAULT 7;

-- Add last contact date for clients (for follow-up tracking)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add needs_attention flag for manual highlighting
ALTER TABLE clients ADD COLUMN IF NOT EXISTS needs_attention BOOLEAN DEFAULT FALSE;

-- Create index for efficient follow-up queries
CREATE INDEX IF NOT EXISTS idx_clients_last_contact_date ON clients(last_contact_date);
CREATE INDEX IF NOT EXISTS idx_clients_needs_attention ON clients(needs_attention) WHERE needs_attention = TRUE;
