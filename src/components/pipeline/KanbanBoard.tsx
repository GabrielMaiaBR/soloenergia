import { useMemo, useState, useCallback } from "react";
import { KanbanColumn, type PipelineStage } from "./KanbanColumn";
import type { Client } from "@/types";
import { toast } from "sonner";

interface KanbanBoardProps {
    clients: Client[];
    followUpDays?: number;
    onClientMove?: (clientId: string, newStage: PipelineStage) => void;
}

interface StageConfig {
    stage: PipelineStage;
    title: string;
}

const STAGES: StageConfig[] = [
    { stage: 'lead', title: 'Lead' },
    { stage: 'analysis', title: 'Análise / Negociação' },
    { stage: 'closed', title: 'Fechado' },
    { stage: 'lost', title: 'Perdido' },
];

/**
 * Determina a etapa do pipeline com base nos dados do cliente.
 */
function determineStage(client: Client): PipelineStage {
    if (client.status) return client.status;

    // Fallback logic if status is somehow empty (should not happen with types)
    if (client.status === 'closed') return 'closed';
    if (client.status === 'lost') return 'lost';
    if (!client.system_power_kwp) return 'lead';

    return 'analysis';
}

export function KanbanBoard({ clients, followUpDays = 7, onClientMove }: KanbanBoardProps) {
    // Estado local para override de estágios (quando usuário arrasta manualmente)
    const [stageOverrides, setStageOverrides] = useState<Record<string, PipelineStage>>({});

    // Estado para drag and drop
    const [draggedClientId, setDraggedClientId] = useState<string | null>(null);
    const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

    // Determinar estágio de cada cliente (com override se existir)
    const getClientStage = useCallback((client: Client): PipelineStage => {
        return stageOverrides[client.id] || determineStage(client);
    }, [stageOverrides]);

    // Agrupar clientes por estágio
    const clientsByStage = useMemo(() => {
        const result: Record<PipelineStage, Client[]> = {
            lead: [],
            analysis: [],
            closed: [],
            lost: [],
        };

        clients.forEach(client => {
            const stage = getClientStage(client);
            result[stage].push(client);
        });

        // Ordenar cada coluna
        Object.keys(result).forEach(stage => {
            result[stage as PipelineStage].sort((a, b) => {
                const dateA = a.last_contact_date ? new Date(a.last_contact_date).getTime() : 0;
                const dateB = b.last_contact_date ? new Date(b.last_contact_date).getTime() : 0;
                return dateB - dateA;
            });
        });

        return result;
    }, [clients, getClientStage]);

    // Handlers de Drag and Drop
    const handleDragStart = useCallback((clientId: string) => {
        setDraggedClientId(clientId);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedClientId(null);
        setDragOverStage(null);
    }, []);

    const handleDragOver = useCallback((stage: PipelineStage) => {
        setDragOverStage(stage);
    }, []);

    const handleDrop = useCallback((targetStage: PipelineStage) => {
        if (!draggedClientId) return;

        const client = clients.find(c => c.id === draggedClientId);
        if (!client) return;

        const currentStage = getClientStage(client);
        if (currentStage === targetStage) {
            setDraggedClientId(null);
            setDragOverStage(null);
            return;
        }

        // Atualizar override local
        setStageOverrides(prev => ({
            ...prev,
            [draggedClientId]: targetStage
        }));

        // Callback para persistir se necessário
        if (onClientMove) {
            onClientMove(draggedClientId, targetStage);
        }

        // Feedback visual
        const stageNames: Record<PipelineStage, string> = {
            lead: 'Lead',
            analise: 'Análise',
            proposta: 'Proposta',
            negociacao: 'Negociação',
            fechado: 'Fechado'
        };

        toast.success(`${client.name} movido para ${stageNames[targetStage]}`);

        setDraggedClientId(null);
        setDragOverStage(null);
    }, [draggedClientId, clients, getClientStage, onClientMove]);

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
            {STAGES.map(({ stage, title }) => (
                <KanbanColumn
                    key={stage}
                    stage={stage}
                    title={title}
                    clients={clientsByStage[stage]}
                    followUpDays={followUpDays}
                    // Drag and drop props
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={() => handleDragOver(stage)}
                    onDrop={() => handleDrop(stage)}
                    isDragOver={dragOverStage === stage}
                    draggedClientId={draggedClientId}
                />
            ))}
        </div>
    );
}
