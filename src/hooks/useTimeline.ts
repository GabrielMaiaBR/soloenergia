import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TimelineNote } from "@/types";
import { toast } from "sonner";

type NoteType = "note" | "objection" | "preference" | "alert" | "simulation";

// Transform database row to TimelineNote type
function transformNote(row: any): TimelineNote {
  return {
    id: row.id,
    client_id: row.client_id,
    content: row.content,
    type: row.type as NoteType,
    created_at: row.created_at,
  };
}

// Fetch notes for a client
export function useClientNotes(clientId: string | undefined) {
  return useQuery({
    queryKey: ["timeline", clientId],
    queryFn: async () => {
      if (!clientId) throw new Error("Client ID required");

      const { data, error } = await supabase
        .from("timeline_notes")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(transformNote);
    },
    enabled: !!clientId,
  });
}

// Create note
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Omit<TimelineNote, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("timeline_notes")
        .insert({
          client_id: note.client_id,
          content: note.content,
          type: note.type,
        })
        .select()
        .single();

      if (error) throw error;
      return transformNote(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["timeline", data.client_id] });
      toast.success("Nota adicionada!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar nota: " + error.message);
    },
  });
}

// Delete note
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const { error } = await supabase.from("timeline_notes").delete().eq("id", id);
      if (error) throw error;
      return clientId;
    },
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ["timeline", clientId] });
      toast.success("Nota removida");
    },
    onError: (error) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });
}
