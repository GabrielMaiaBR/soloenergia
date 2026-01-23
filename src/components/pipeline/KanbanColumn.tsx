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
    color: string;
    followUpDays?: number;
}

const stageIcons: Record<PipelineStage, string> = {
    lead: "👋",
    analise: "🔍",
    proposta: "📋",
    negociacao: "💬",
    fechado: "🎉",
};

export function KanbanColumn({ stage, title, clients, color, followUpDays = 7 }: KanbanColumnProps) {
    // Calculate total value of clients in this column
    const totalValue = useMemo(() => {
        return clients.reduce((sum, client) => {
            // Rough estimate based on system power
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

    return (
        <div className="flex flex-col bg-muted/30 rounded-lg border min-w-[280px] max-w-[320px] h-full">
            {/* Header */}
            <div className={cn(
                "p-3 rounded-t-lg border-b",
                `bg-gradient-to-r ${color}`
            )}>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{stageIcons[stage]}</span>
                        <h3 className="font-semibold text-sm">{title}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {clients.length}
                    </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {totalValue > 0 && (
                        <span>
                            R$ {(totalValue / 1000).toFixed(0)}k potencial
                        </span>
                    )}
                    {attentionCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                            {attentionCount} atenção
                        </Badge>
                    )}
                </div>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-solo">
                {clientsWithAttention.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8 px-4">
                        Nenhum cliente nesta etapa
                    </div>
                ) : (
                    clientsWithAttention.map(({ client, needsAttention }) => (
                        <KanbanCard
                            key={client.id}
                            client={client}
                            needsAttention={needsAttention}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
