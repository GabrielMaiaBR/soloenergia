import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Trash2, TrendingUp, TrendingDown, Edit } from "lucide-react";
import type { Simulation, Client } from "@/types";
import { useToggleFavorite, useDeleteSimulation } from "@/hooks/useSimulations";
import { formatCurrency, formatPercent } from "@/lib/financial";
import { cn } from "@/lib/utils";
import { SimulationEditModal } from "./SimulationEditModal";

interface SimulationCardProps {
  simulation: Simulation;
  client?: Client;
  isSelected?: boolean;
  onSelect?: () => void;
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

const getSemaphoreLabel = (semaphore?: string) => {
  switch (semaphore) {
    case "excellent":
      return "Excelente";
    case "average":
      return "Médio";
    case "expensive":
      return "Caro";
    default:
      return "-";
  }
};

export function SimulationCard({ simulation, client, isSelected, onSelect }: SimulationCardProps) {
  const toggleFavorite = useToggleFavorite();
  const deleteSimulation = useDeleteSimulation();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite.mutate({ id: simulation.id, is_favorite: !simulation.is_favorite });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Remover esta simulação?")) {
      deleteSimulation.mutate({ id: simulation.id, clientId: simulation.client_id });
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const isPositiveCashflow = (simulation.monthly_cashflow || 0) >= 0;

  // Format payback properly
  const formatPayback = (months?: number) => {
    if (months === undefined || months === null) return "-";
    if (months === Infinity) return "N/A";
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${months} ${months === 1 ? "mês" : "meses"}`;
    } else if (remainingMonths === 0) {
      return `${years} ${years === 1 ? "ano" : "anos"}`;
    } else {
      return `${years}a ${remainingMonths}m`;
    }
  };

  return (
    <>
      <Card
        className={cn(
          "transition-solo cursor-pointer hover:shadow-lg",
          isSelected && "ring-2 ring-primary"
        )}
        onClick={onSelect}
      >
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{typeLabels[simulation.type] || simulation.type}</Badge>
              <span className="text-xs text-muted-foreground">v{simulation.version}</span>
            </div>
            <h4 className="font-medium mt-1">{simulation.name || `Simulação v${simulation.version}`}</h4>
          </div>
          <div className="flex gap-1">
            {client && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleFavorite}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  simulation.is_favorite ? "fill-solo-warning text-solo-warning" : "text-muted-foreground"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* System Value */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Valor do Sistema</span>
            <span className="font-medium">{formatCurrency(simulation.system_value)}</span>
          </div>

          {/* Rate & Semaphore */}
          {simulation.type !== "cash" && simulation.detected_monthly_rate !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Taxa Mensal</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatPercent(simulation.detected_monthly_rate)}</span>
                <Badge className={getSemaphoreColor(simulation.rate_semaphore)}>
                  {getSemaphoreLabel(simulation.rate_semaphore)}
                </Badge>
              </div>
            </div>
          )}

          {/* Installment */}
          {simulation.installment_value && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Parcela</span>
              <span className="font-medium">
                {simulation.installments}x de {formatCurrency(simulation.installment_value)}
              </span>
            </div>
          )}

          {/* Cashflow */}
          {simulation.monthly_cashflow !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fluxo Mensal</span>
              <div className="flex items-center gap-1">
                {isPositiveCashflow ? (
                  <TrendingUp className="h-4 w-4 text-solo-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-solo-danger" />
                )}
                <span className={cn("font-medium", isPositiveCashflow ? "text-solo-success" : "text-solo-danger")}>
                  {formatCurrency(simulation.monthly_cashflow)}
                </span>
              </div>
            </div>
          )}

          {/* Payback */}
          {simulation.payback_months !== undefined && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Payback</span>
              <span className="font-medium">{formatPayback(simulation.payback_months)}</span>
            </div>
          )}

          {/* Total Interest */}
          {simulation.total_interest_paid !== undefined && simulation.total_interest_paid > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Juros Totais</span>
              <span className="text-solo-danger">{formatCurrency(simulation.total_interest_paid)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {client && (
        <SimulationEditModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          simulation={simulation}
          client={client}
        />
      )}
    </>
  );
}
