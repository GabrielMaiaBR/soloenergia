import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { History, Star, ArrowRight, Clock, TrendingUp, TrendingDown } from "lucide-react";
import type { Simulation } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/financial";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface VersionHistoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    simulations: Simulation[];
    currentSimulation?: Simulation;
}

const typeLabels: Record<string, string> = {
    financing: "Financiamento",
    credit_card: "Cartão",
    cash: "À Vista",
};

const getSemaphoreColor = (semaphore?: string) => {
    switch (semaphore) {
        case "excellent":
            return "bg-solo-success text-white";
        case "average":
            return "bg-solo-warning text-black";
        case "expensive":
            return "bg-solo-danger text-white";
        default:
            return "bg-muted";
    }
};

export function VersionHistoryModal({
    open,
    onOpenChange,
    simulations,
    currentSimulation,
}: VersionHistoryModalProps) {
    const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

    // Sort by version descending
    const sortedSimulations = [...simulations].sort((a, b) => b.version - a.version);

    const toggleVersion = (id: string) => {
        setSelectedVersions((prev) =>
            prev.includes(id)
                ? prev.filter((v) => v !== id)
                : prev.length < 2
                    ? [...prev, id]
                    : [prev[1], id]
        );
    };

    const compareVersions = () => {
        if (selectedVersions.length !== 2) return null;
        const v1 = simulations.find((s) => s.id === selectedVersions[0]);
        const v2 = simulations.find((s) => s.id === selectedVersions[1]);
        if (!v1 || !v2) return null;

        const newer = v1.version > v2.version ? v1 : v2;
        const older = v1.version > v2.version ? v2 : v1;

        return { older, newer };
    };

    const comparison = compareVersions();

    const renderDiff = (label: string, oldVal?: number, newVal?: number, format: 'currency' | 'percent' | 'number' = 'currency') => {
        if (oldVal === undefined && newVal === undefined) return null;

        const formatValue = (val?: number) => {
            if (val === undefined) return '-';
            switch (format) {
                case 'currency': return formatCurrency(val);
                case 'percent': return formatPercent(val);
                default: return val.toString();
            }
        };

        const diff = (newVal || 0) - (oldVal || 0);
        const isIncrease = diff > 0;
        const isDecrease = diff < 0;

        return (
            <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm">{formatValue(oldVal)}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className={cn(
                        "text-sm font-medium",
                        isIncrease && "text-solo-success",
                        isDecrease && "text-solo-danger"
                    )}>
                        {formatValue(newVal)}
                    </span>
                    {diff !== 0 && (
                        <span className={cn(
                            "text-xs",
                            isIncrease && "text-solo-success",
                            isDecrease && "text-solo-danger"
                        )}>
                            ({isIncrease ? '+' : ''}{format === 'currency' ? formatCurrency(diff) : diff.toFixed(2)})
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Histórico de Versões
                    </DialogTitle>
                    <DialogDescription>
                        Selecione até 2 versões para comparar
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    {/* Version List */}
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-2">
                            {sortedSimulations.map((sim) => {
                                const isSelected = selectedVersions.includes(sim.id);
                                const isCurrent = currentSimulation?.id === sim.id;

                                return (
                                    <div
                                        key={sim.id}
                                        onClick={() => toggleVersion(sim.id)}
                                        className={cn(
                                            "p-3 rounded-lg border cursor-pointer transition-all",
                                            isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                                            isCurrent && "ring-2 ring-primary/20"
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">v{sim.version}</Badge>
                                                <span className="font-medium">
                                                    {sim.name || `${typeLabels[sim.type]} v${sim.version}`}
                                                </span>
                                                {sim.is_favorite && (
                                                    <Star className="h-4 w-4 fill-solo-warning text-solo-warning" />
                                                )}
                                                {isCurrent && (
                                                    <Badge variant="secondary" className="text-xs">Atual</Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(sim.created_at), {
                                                    addSuffix: true,
                                                    locale: ptBR,
                                                })}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                                            <span>{formatCurrency(sim.system_value)}</span>
                                            {sim.installments && sim.installment_value && (
                                                <span className="text-muted-foreground">
                                                    {sim.installments}x de {formatCurrency(sim.installment_value)}
                                                </span>
                                            )}
                                            {sim.detected_monthly_rate !== undefined && sim.type !== 'cash' && (
                                                <Badge className={getSemaphoreColor(sim.rate_semaphore)}>
                                                    {formatPercent(sim.detected_monthly_rate)} a.m.
                                                </Badge>
                                            )}
                                            {sim.monthly_cashflow !== undefined && (
                                                <span className={cn(
                                                    "flex items-center gap-1",
                                                    sim.monthly_cashflow >= 0 ? "text-solo-success" : "text-solo-danger"
                                                )}>
                                                    {sim.monthly_cashflow >= 0 ? (
                                                        <TrendingUp className="h-3 w-3" />
                                                    ) : (
                                                        <TrendingDown className="h-3 w-3" />
                                                    )}
                                                    {formatCurrency(sim.monthly_cashflow)}
                                                </span>
                                            )}
                                        </div>

                                        {sim.version_note && (
                                            <p className="mt-2 text-xs text-muted-foreground italic">
                                                "{sim.version_note}"
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>

                    {/* Comparison */}
                    {comparison && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    Comparando v{comparison.older.version} → v{comparison.newer.version}
                                </h4>
                                <div className="p-3 rounded-lg bg-muted/30">
                                    {renderDiff("Valor do Sistema", comparison.older.system_value, comparison.newer.system_value)}
                                    {renderDiff("Parcela", comparison.older.installment_value, comparison.newer.installment_value)}
                                    {renderDiff("Taxa Mensal", comparison.older.detected_monthly_rate, comparison.newer.detected_monthly_rate, 'percent')}
                                    {renderDiff("Fluxo Mensal", comparison.older.monthly_cashflow, comparison.newer.monthly_cashflow)}
                                    {renderDiff("Juros Totais", comparison.older.total_interest_paid, comparison.newer.total_interest_paid)}
                                    {renderDiff("Payback (meses)", comparison.older.payback_months, comparison.newer.payback_months, 'number')}
                                </div>
                            </div>
                        </>
                    )}

                    {selectedVersions.length === 1 && (
                        <p className="text-sm text-muted-foreground text-center">
                            Selecione mais uma versão para comparar
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
