import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  AlertTriangle,
  Heart,
  Bell,
  BarChart2,
  Plus,
  Trash2,
} from "lucide-react";
import { useClientNotes, useCreateNote, useDeleteNote } from "@/hooks/useTimeline";
import type { TimelineNote } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

interface TimelineSectionProps {
  clientId: string;
}

type NoteType = TimelineNote["type"];

const noteTypeConfig: Record<NoteType, { label: string; icon: React.ReactNode; color: string }> = {
  note: {
    label: "Nota",
    icon: <MessageSquare className="h-4 w-4" />,
    color: "bg-primary/10 text-primary",
  },
  objection: {
    label: "Objeção",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "bg-solo-danger/10 text-solo-danger",
  },
  preference: {
    label: "Preferência",
    icon: <Heart className="h-4 w-4" />,
    color: "bg-solo-success/10 text-solo-success",
  },
  alert: {
    label: "Alerta",
    icon: <Bell className="h-4 w-4" />,
    color: "bg-solo-warning/10 text-solo-warning",
  },
  simulation: {
    label: "Simulação",
    icon: <BarChart2 className="h-4 w-4" />,
    color: "bg-solo-trust/10 text-solo-trust",
  },
};

export function TimelineSection({ clientId }: TimelineSectionProps) {
  const { data: notes = [], isLoading } = useClientNotes(clientId);
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("note");
  const [isAdding, setIsAdding] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<TimelineNote | null>(null);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    await createNote.mutateAsync({
      client_id: clientId,
      content: newNote.trim(),
      type: noteType,
    });

    setNewNote("");
    setIsAdding(false);
    setNoteType("note");
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    await deleteNote.mutateAsync({ id: noteToDelete.id, clientId });
    setNoteToDelete(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Timeline / Notas</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Note Form */}
        {isAdding && (
          <div className="space-y-3 p-4 rounded-lg border border-dashed">
            <div className="flex gap-2">
              <Select value={noteType} onValueChange={(v) => setNoteType(v as NoteType)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(noteTypeConfig) as NoteType[])
                    .filter((t) => t !== "simulation")
                    .map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {noteTypeConfig[type].icon}
                          {noteTypeConfig[type].label}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Escreva sua nota..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
              <Button onClick={handleAddNote} disabled={createNote.isPending || !newNote.trim()}>
                Salvar
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma nota registrada.</p>
            <p className="text-sm mt-2">Registre objeções, preferências e alertas importantes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => {
              const config = noteTypeConfig[note.type];
              return (
                <div
                  key={note.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 group"
                >
                  <div className={`p-2 rounded-full ${config.color}`}>{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(note.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => setNoteToDelete(note)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={!!noteToDelete}
        onOpenChange={(open) => !open && setNoteToDelete(null)}
        onConfirm={handleDeleteNote}
        title="Excluir Nota"
        description={`Tem certeza que deseja excluir esta ${noteToDelete ? noteTypeConfig[noteToDelete.type].label.toLowerCase() : 'nota'}?`}
        isLoading={deleteNote.isPending}
      />
    </Card>
  );
}
