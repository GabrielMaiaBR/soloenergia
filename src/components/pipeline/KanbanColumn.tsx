import { useMemo } from "react";
import { KanbanCard } from "./KanbanCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Client } from "@/types";

export type PipelineStage = 'lead' | 'analise' | 'proposta' | 'negociacao' | 'fechado';

interface KanbanColumnProps {
    stage: PipelineStage;
    title: string;
    clients: Client[];
    followUpDays?: number;
    // Drag and drop
    onDragStart?: (clientId: string) => void;
    onDragEnd?: () => void;
    onDragOver?: () => void;
    onDrop?: () => void;
    isDragOver?: boolean;
    draggedClientId?: string | null;
}

const stageIcons: Record<PipelineStage, string> = {
    lead: "👋",
    analise: "🔍",
    proposta: "📋",
    negociacao: "💬",
    fechado: "🎉",
};

// Cores vibrantes para cada etapa
const stageColors: Record<PipelineStage, {
    header: string;
    badge: string;
    border: string;
    dropzone: string;
}> = {
    lead: {
        header: "bg-gradient-to-r from-slate-600 to-slate-500",
        badge: "bg-slate-500 text-white",
        border: "border-slate-500/30",
        dropzone: "bg-slate-500/20 border-slate-500"
    },
    analise: {
        header: "bg-gradient-to-r from-blue-600 to-blue-500",
        badge: "bg-blue-500 text-white",
        border: "border-blue-500/30",
        dropzone: "bg-blue-500/20 border-blue-500"
    },
    proposta: {
        header: "bg-gradient-to-r from-purple-600 to-purple-500",
        badge: "bg-purple-500 text-white",
        border: "border-purple-500/30",
        dropzone: "bg-purple-500/20 border-purple-500"
    },
    negociacao: {
        header: "bg-gradient-to-r from-orange-600 to-orange-500",
        badge: "bg-orange-500 text-white",
        border: "border-orange-500/30",
        dropzone: "bg-orange-500/20 border-orange-500"
    },
    fechado: {
        header: "bg-gradient-to-r from-green-600 to-green-500",
        badge: "bg-green-500 text-white",
        border: "border-green-500/30",
        dropzone: "bg-green-500/20 border-green-500"
    },
};

export function KanbanColumn({
    stage,
    title,
    clients,
    followUpDays = 7,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    isDragOver,
    draggedClientId
}: KanbanColumnProps) {
    const colors = stageColors[stage];

    // Calculate total value of clients in this column
    const totalValue = useMemo(() => {
        return clients.reduce((sum, client) => {
            const systemValue = (client.system_power_kwp || 0) * 4500;
            return sum + systemValue;
        }, 0);
    }, [clients]);

    // Check which clients need attention
    const clientsWithAttention = useMemo(() => {
        const now = Date.now();
        return clients.map(client => {
            const daysSinceContact = client.last_contact_date
                ? Math.floor((now - new Date(client.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))
                : null;
            const needsAttention = client.needs_attention ||
                (daysSinceContact !== null && daysSinceContact >= followUpDays);
            return { client, needsAttention };
        });
    }, [clients, followUpDays]);

    const attentionCount = clientsWithAttention.filter(c => c.needsAttention).length;

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        onDragOver?.();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        onDrop?.();
    };

    return (
        <div
            className={cn(
                "flex flex-col rounded-xl border-2 min-w-[300px] max-w-[320px] h-full bg-card/50 backdrop-blur-sm transition-all duration-200",
                colors.border,
                isDragOver && `${colors.dropzone} border-dashed scale-[1.02] shadow-lg`
            )}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Header com cor vibrante */}
            <div className={cn("p-4 rounded-t-lg", colors.header)}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{stageIcons[stage]}</span>
                        <h3 className="font-bold text-white">{title}</h3>
                    </div>
                    <Badge className={cn("text-xs font-bold", colors.badge)}>
                        {clients.length}
                    </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-white/80">
                    {totalValue > 0 ? (
                        <span className="font-medium">
                            R$ {(totalValue / 1000).toFixed(0)}k potencial
                        </span>
                    ) : (
                        <span>Nenhum valor</span>
                    )}
                    {attentionCount > 0 && (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                            ⚠️ {attentionCount}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Cards area - Dropzone */}
            <div className={cn(
                "flex-1 p-3 space-y-3 overflow-y-auto scrollbar-solo transition-all",
                isDragOver && "ring-2 ring-inset ring-primary/50"
            )}>
                {clientsWithAttention.length === 0 ? (
                    <div className={cn(
                        "text-center text-sm text-muted-foreground py-12 px-4 border-2 border-dashed rounded-lg transition-all",
                        isDragOver && "border-primary bg-primary/10 text-primary"
                    )}>
                        <span className="text-2xl block mb-2">{isDragOver ? "📥" : "📭"}</span>
                        {isDragOver ? "Solte aqui!" : "Nenhum cliente nesta etapa"}
                    </div>
                ) : (
                    clientsWithAttention.map(({ client, needsAttention }) => (
                        <KanbanCard
                            key={client.id}
                            client={client}
                            needsAttention={needsAttention}
                            isDragging={draggedClientId === client.id}
                            onDragStart={() => onDragStart?.(client.id)}
                            onDragEnd={onDragEnd}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
