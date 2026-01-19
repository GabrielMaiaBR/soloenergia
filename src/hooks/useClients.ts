import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Client, ClientStatus } from "@/types";
import { toast } from "sonner";

// Transform database row to Client type
function transformClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    cpf: row.cpf,
    phone: row.phone,
    email: row.email,
    status: row.status as ClientStatus,
    system_power_kwp: row.system_power_kwp ? Number(row.system_power_kwp) : undefined,
    monthly_generation_kwh: row.monthly_generation_kwh ? Number(row.monthly_generation_kwh) : undefined,
    energy_tariff: row.energy_tariff ? Number(row.energy_tariff) : undefined,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// Fetch all clients
export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(transformClient);
    },
  });
}

// Fetch single client
export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: async () => {
      if (!id) throw new Error("Client ID required");
      
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return transformClient(data);
    },
    enabled: !!id,
  });
}

// Create client
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: Omit<Client, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          name: client.name,
          cpf: client.cpf,
          phone: client.phone,
          email: client.email,
          status: client.status,
          system_power_kwp: client.system_power_kwp,
          monthly_generation_kwh: client.monthly_generation_kwh,
          energy_tariff: client.energy_tariff,
          notes: client.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return transformClient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar cliente: " + error.message);
    },
  });
}

// Update client
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .update({
          name: updates.name,
          cpf: updates.cpf,
          phone: updates.phone,
          email: updates.email,
          status: updates.status,
          system_power_kwp: updates.system_power_kwp,
          monthly_generation_kwh: updates.monthly_generation_kwh,
          energy_tariff: updates.energy_tariff,
          notes: updates.notes,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return transformClient(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", data.id] });
      toast.success("Cliente atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar cliente: " + error.message);
    },
  });
}

// Delete client
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente removido");
    },
    onError: (error) => {
      toast.error("Erro ao remover cliente: " + error.message);
    },
  });
}
