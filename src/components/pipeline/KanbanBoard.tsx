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
    { stage: 'analise', title: 'Análise' },
    { stage: 'proposta', title: 'Proposta' },
    { stage: 'negociacao', title: 'Negociação' },
    { stage: 'fechado', title: 'Fechado' },
];

/**
 * Determina a etapa do pipeline com base nos dados do cliente.
 */
function determineStage(client: Client): PipelineStage {
    // Se status é closed, está Fechado
    if (client.status === 'closed') {
        return 'fechado';
    }

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
            analise: [],
            proposta: [],
            negociacao: [],
            fechado: [],
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
