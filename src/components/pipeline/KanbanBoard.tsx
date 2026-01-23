import { useMemo } from "react";
import { KanbanColumn, type PipelineStage } from "./KanbanColumn";
import type { Client } from "@/types";

interface KanbanBoardProps {
    clients: Client[];
    followUpDays?: number;
}

interface StageConfig {
    stage: PipelineStage;
    title: string;
    color: string;
}

const STAGES: StageConfig[] = [
    { stage: 'lead', title: 'Lead', color: 'from-slate-500/20 to-slate-500/5' },
    { stage: 'analise', title: 'Análise', color: 'from-blue-500/20 to-blue-500/5' },
    { stage: 'proposta', title: 'Proposta', color: 'from-purple-500/20 to-purple-500/5' },
    { stage: 'negociacao', title: 'Negociação', color: 'from-orange-500/20 to-orange-500/5' },
    { stage: 'fechado', title: 'Fechado', color: 'from-green-500/20 to-green-500/5' },
];

/**
 * Determina a etapa do pipeline com base nos dados do cliente.
 * Lógica:
 * - Lead: Sem potência definida
 * - Análise: Tem potência mas sem simulação/valor
 * - Proposta: Tem simulação mas sem contato recente
 * - Negociação: Contato recente e simulação
 * - Fechado: Status marcado como fechado (needs_attention = false + última simulação recente)
 */
function determineStage(client: Client): PipelineStage {
    // Se não tem potência, é Lead
    if (!client.system_power_kwp || client.system_power_kwp === 0) {
        return 'lead';
    }

    // Se não tem geração estimada, está em Análise
    if (!client.monthly_generation_kwh || client.monthly_generation_kwh === 0) {
        return 'analise';
    }

    // Se tem contato há menos de 3 dias, está em Negociação
    const daysSinceContact = client.last_contact_date
        ? Math.floor((Date.now() - new Date(client.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    if (daysSinceContact !== null && daysSinceContact < 3) {
        return 'negociacao';
    }

    // Default: Proposta
    return 'proposta';
}

export function KanbanBoard({ clients, followUpDays = 7 }: KanbanBoardProps) {
    // Group clients by stage
    const clientsByStage = useMemo(() => {
        const result: Record<PipelineStage, Client[]> = {
            lead: [],
            analise: [],
            proposta: [],
            negociacao: [],
            fechado: [],
        };

        clients.forEach(client => {
            const stage = determineStage(client);
            result[stage].push(client);
        });

        // Sort each column by last contact date (most recent first)
        Object.keys(result).forEach(stage => {
            result[stage as PipelineStage].sort((a, b) => {
                const dateA = a.last_contact_date ? new Date(a.last_contact_date).getTime() : 0;
                const dateB = b.last_contact_date ? new Date(b.last_contact_date).getTime() : 0;
                return dateB - dateA;
            });
        });

        return result;
    }, [clients]);

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
            {STAGES.map(({ stage, title, color }) => (
                <KanbanColumn
                    key={stage}
                    stage={stage}
                    title={title}
                    clients={clientsByStage[stage]}
                    color={color}
                    followUpDays={followUpDays}
                />
            ))}
        </div>
    );
}
