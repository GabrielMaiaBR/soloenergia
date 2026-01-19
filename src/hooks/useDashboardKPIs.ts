import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DashboardKPIs } from "@/types";

export function useDashboardKPIs() {
  return useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: async (): Promise<DashboardKPIs> => {
      // Get total clients
      const { count: totalClients, error: clientsError } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });

      if (clientsError) throw clientsError;

      // Get proposals in analysis
      const { count: inAnalysis, error: analysisError } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("status", "analysis");

      if (analysisError) throw analysisError;

      // Get favorite simulations count
      const { count: favorites, error: favoritesError } = await supabase
        .from("simulations")
        .select("*", { count: "exact", head: true })
        .eq("is_favorite", true);

      if (favoritesError) throw favoritesError;

      return {
        total_clients: totalClients || 0,
        proposals_in_analysis: inAnalysis || 0,
        favorite_simulations: favorites || 0,
      };
    },
  });
}
