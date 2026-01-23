import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppSettings } from "@/types";
import { toast } from "sonner";

// Transform database row to AppSettings type
function transformSettings(row: any): AppSettings {
  return {
    id: row.id,
    lei_14300_factor: Number(row.lei_14300_factor),
    default_tariff: Number(row.default_tariff),
    logo_url: row.logo_url,
    company_name: row.company_name,
    primary_color: row.primary_color,
    contact_phone: row.contact_phone,
    contact_email: row.contact_email,
    whatsapp_number: row.whatsapp_number,
    follow_up_days: Number(row.follow_up_days),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// Fetch settings (creates default if none exist)
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // If no settings exist, create default
        const { data: newData, error: insertError } = await supabase
          .from("app_settings")
          .insert({})
          .select()
          .single();

        if (insertError) throw insertError;
        return transformSettings(newData);
      }

      return transformSettings(data);
    },
  });
}

// Update settings
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<AppSettings, "id" | "created_at" | "updated_at">>) => {
      // Get current settings first
      const { data: current } = await supabase
        .from("app_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (!current) throw new Error("Settings not found");

      const { data, error } = await supabase
        .from("app_settings")
        .update({
          lei_14300_factor: updates.lei_14300_factor,
          default_tariff: updates.default_tariff,
          logo_url: updates.logo_url,
          company_name: updates.company_name,
          primary_color: updates.primary_color,
          contact_phone: updates.contact_phone,
          contact_email: updates.contact_email,
          // whatsapp_number: updates.whatsapp_number,
          pin_hash: updates.pin_hash,
        })
        .eq("id", current.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return transformSettings(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Configurações salvas!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });
}
