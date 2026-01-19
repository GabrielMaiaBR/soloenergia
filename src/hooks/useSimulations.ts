import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Simulation, SimulationType, RateSemaphore } from "@/types";
import { toast } from "sonner";

// Transform database row to Simulation type
function transformSimulation(row: any): Simulation {
  return {
    id: row.id,
    client_id: row.client_id,
    version: row.version,
    type: row.type as SimulationType,
    name: row.name,
    is_favorite: row.is_favorite,
    system_value: Number(row.system_value),
    financed_value: row.financed_value ? Number(row.financed_value) : undefined,
    installments: row.installments,
    installment_value: row.installment_value ? Number(row.installment_value) : undefined,
    entry_value: row.entry_value ? Number(row.entry_value) : undefined,
    grace_period_days: row.grace_period_days,
    card_machine_fee: row.card_machine_fee ? Number(row.card_machine_fee) : undefined,
    has_cashback: row.has_cashback,
    detected_monthly_rate: row.detected_monthly_rate ? Number(row.detected_monthly_rate) : undefined,
    rate_semaphore: row.rate_semaphore as RateSemaphore | undefined,
    total_interest_paid: row.total_interest_paid ? Number(row.total_interest_paid) : undefined,
    monthly_cashflow: row.monthly_cashflow ? Number(row.monthly_cashflow) : undefined,
    payback_months: row.payback_months,
    tariff_increase_rate: row.tariff_increase_rate ? Number(row.tariff_increase_rate) : undefined,
    version_note: row.version_note,
    created_at: row.created_at,
  };
}

// Fetch simulations for a client
export function useClientSimulations(clientId: string | undefined) {
  return useQuery({
    queryKey: ["simulations", clientId],
    queryFn: async () => {
      if (!clientId) throw new Error("Client ID required");

      const { data, error } = await supabase
        .from("simulations")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(transformSimulation);
    },
    enabled: !!clientId,
  });
}

// Fetch favorite simulations count
export function useFavoriteSimulationsCount() {
  return useQuery({
    queryKey: ["simulations", "favorites", "count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("simulations")
        .select("*", { count: "exact", head: true })
        .eq("is_favorite", true);

      if (error) throw error;
      return count || 0;
    },
  });
}

// Get next version number for a client
async function getNextVersion(clientId: string): Promise<number> {
  const { data, error } = await supabase
    .from("simulations")
    .select("version")
    .eq("client_id", clientId)
    .order("version", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data.length > 0 ? data[0].version + 1 : 1;
}

// Create simulation
export function useCreateSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (simulation: Omit<Simulation, "id" | "version" | "created_at">) => {
      const version = await getNextVersion(simulation.client_id);

      const { data, error } = await supabase
        .from("simulations")
        .insert({
          client_id: simulation.client_id,
          version,
          type: simulation.type,
          name: simulation.name || `Simulação v${version}`,
          is_favorite: simulation.is_favorite,
          system_value: simulation.system_value,
          financed_value: simulation.financed_value,
          installments: simulation.installments,
          installment_value: simulation.installment_value,
          entry_value: simulation.entry_value,
          grace_period_days: simulation.grace_period_days,
          card_machine_fee: simulation.card_machine_fee,
          has_cashback: simulation.has_cashback,
          detected_monthly_rate: simulation.detected_monthly_rate,
          rate_semaphore: simulation.rate_semaphore,
          total_interest_paid: simulation.total_interest_paid,
          monthly_cashflow: simulation.monthly_cashflow,
          payback_months: simulation.payback_months,
          tariff_increase_rate: simulation.tariff_increase_rate,
          version_note: simulation.version_note,
        })
        .select()
        .single();

      if (error) throw error;
      return transformSimulation(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["simulations", data.client_id] });
      queryClient.invalidateQueries({ queryKey: ["simulations", "favorites", "count"] });
      toast.success("Simulação criada!");
    },
    onError: (error) => {
      toast.error("Erro ao criar simulação: " + error.message);
    },
  });
}

// Update simulation
export function useUpdateSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Simulation> & { id: string }) => {
      const { data, error } = await supabase
        .from("simulations")
        .update({
          name: updates.name,
          is_favorite: updates.is_favorite,
          system_value: updates.system_value,
          financed_value: updates.financed_value,
          installments: updates.installments,
          installment_value: updates.installment_value,
          entry_value: updates.entry_value,
          grace_period_days: updates.grace_period_days,
          card_machine_fee: updates.card_machine_fee,
          has_cashback: updates.has_cashback,
          detected_monthly_rate: updates.detected_monthly_rate,
          rate_semaphore: updates.rate_semaphore,
          total_interest_paid: updates.total_interest_paid,
          monthly_cashflow: updates.monthly_cashflow,
          payback_months: updates.payback_months,
          tariff_increase_rate: updates.tariff_increase_rate,
          version_note: updates.version_note,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return transformSimulation(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["simulations", data.client_id] });
      queryClient.invalidateQueries({ queryKey: ["simulations", "favorites", "count"] });
      toast.success("Simulação atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}

// Toggle favorite
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { data, error } = await supabase
        .from("simulations")
        .update({ is_favorite })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return transformSimulation(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["simulations", data.client_id] });
      queryClient.invalidateQueries({ queryKey: ["simulations", "favorites", "count"] });
      toast.success(data.is_favorite ? "Marcada como favorita!" : "Removida dos favoritos");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });
}

// Delete simulation
export function useDeleteSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const { error } = await supabase.from("simulations").delete().eq("id", id);
      if (error) throw error;
      return clientId;
    },
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ["simulations", clientId] });
      queryClient.invalidateQueries({ queryKey: ["simulations", "favorites", "count"] });
      toast.success("Simulação removida");
    },
    onError: (error) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });
}
