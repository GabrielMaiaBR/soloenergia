import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { Simulation } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/financial";
import { cn } from "@/lib/utils";

interface ScenarioComparatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simulations: Simulation[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

const typeLabels: Record<string, string> = {
  financing: "Financiamento",
  credit_card: "Cartão",
  cash: "À Vista",
};

// Helper function to format payback properly (months to years/months)
const formatPayback = (months?: number) => {
  if (months === undefined || months === null) return "-";
  if (months === Infinity || isNaN(months)) return "N/A";
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${months} ${months === 1 ? "mês" : "meses"}`;
  } else if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "ano" : "anos"}`;
  } else {
    return `${years} ${years === 1 ? "ano" : "anos"} e ${remainingMonths} ${remainingMonths === 1 ? "mês" : "meses"}`;
  }
};

export function ScenarioComparator({
  open,
  onOpenChange,
  simulations,
  selectedIds,
  onSelectionChange,
}: ScenarioComparatorProps) {
  const selectedSimulations = simulations.filter((s) => selectedIds.includes(s.id));

  // Find best values for each metric
  const getBest = (
    key: keyof Simulation,
    lower: boolean = true
  ): string | undefined => {
    if (selectedSimulations.length === 0) return undefined;

    const values = selectedSimulations
      .map((s) => ({ id: s.id, value: s[key] as number | undefined }))
      .filter((v) => v.value !== undefined && v.value !== null && isFinite(v.value as number));

    if (values.length === 0) return undefined;

    const sorted = [...values].sort((a, b) =>
      lower ? (a.value || 0) - (b.value || 0) : (b.value || 0) - (a.value || 0)
    );

    return sorted[0]?.id;
  };

  const bestRate = getBest("detected_monthly_rate", true);
  const bestCashflow = getBest("monthly_cashflow", false);
  const bestInterest = getBest("total_interest_paid", true);
  const bestPayback = getBest("payback_months", true);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else if (selectedIds.length < 3) {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparar Cenários</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selection */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Selecione até 3 simulações para comparar:
            </p>
            <div className="flex flex-wrap gap-2">
              {simulations.map((sim) => (
                <Button
                  key={sim.id}
                  variant={selectedIds.includes(sim.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSelection(sim.id)}
                  disabled={!selectedIds.includes(sim.id) && selectedIds.length >= 3}
                >
                  {selectedIds.includes(sim.id) && <Check className="h-3 w-3 mr-1" />}
                  {sim.name || `v${sim.version}`} ({typeLabels[sim.type]})
                </Button>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          {selectedSimulations.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-muted-foreground font-medium">Métrica</th>
                    {selectedSimulations.map((sim) => (
                      <th key={sim.id} className="text-center p-3">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="outline">{typeLabels[sim.type]}</Badge>
                          <span className="font-medium">{sim.name || `v${sim.version}`}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* System Value */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Valor do Sistema</td>
                    {selectedSimulations.map((sim) => (
                      <td key={sim.id} className="text-center p-3 font-medium">
                        {formatCurrency(sim.system_value)}
                      </td>
                    ))}
                  </tr>

                  {/* Rate */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Taxa Mensal</td>
                    {selectedSimulations.map((sim) => (
                      <td
                        key={sim.id}
                        className={cn(
                          "text-center p-3 font-medium",
                          sim.id === bestRate && "bg-solo-success/10"
                        )}
                      >
                        {sim.type === "cash" ? (
                          <span className="text-solo-success">0%</span>
                        ) : sim.detected_monthly_rate !== undefined ? (
                          <div className="flex flex-col items-center gap-1">
                            <span>{formatPercent(sim.detected_monthly_rate)}</span>
                            {sim.id === bestRate && (
                              <Badge className="bg-solo-success text-white text-xs">Melhor</Badge>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Installment */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Parcela</td>
                    {selectedSimulations.map((sim) => (
                      <td key={sim.id} className="text-center p-3 font-medium">
                        {sim.type === "cash"
                          ? "-"
                          : sim.installment_value
                          ? `${sim.installments}x ${formatCurrency(sim.installment_value)}`
                          : "-"}
                      </td>
                    ))}
                  </tr>

                  {/* Total Interest */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Juros Totais</td>
                    {selectedSimulations.map((sim) => (
                      <td
                        key={sim.id}
                        className={cn(
                          "text-center p-3 font-medium",
                          sim.id === bestInterest && "bg-solo-success/10"
                        )}
                      >
                        {sim.total_interest_paid !== undefined ? (
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={sim.total_interest_paid > 0 ? "text-solo-danger" : "text-solo-success"}
                            >
                              {formatCurrency(sim.total_interest_paid)}
                            </span>
                            {sim.id === bestInterest && (
                              <Badge className="bg-solo-success text-white text-xs">Melhor</Badge>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Cashflow */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Fluxo Mensal</td>
                    {selectedSimulations.map((sim) => (
                      <td
                        key={sim.id}
                        className={cn(
                          "text-center p-3 font-medium",
                          sim.id === bestCashflow && "bg-solo-success/10"
                        )}
                      >
                        {sim.monthly_cashflow !== undefined ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                              {sim.monthly_cashflow >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-solo-success" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-solo-danger" />
                              )}
                              <span
                                className={
                                  sim.monthly_cashflow >= 0 ? "text-solo-success" : "text-solo-danger"
                                }
                              >
                                {formatCurrency(sim.monthly_cashflow)}
                              </span>
                            </div>
                            {sim.id === bestCashflow && (
                              <Badge className="bg-solo-success text-white text-xs">Melhor</Badge>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Payback - FIXED: now using proper formatting */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Payback</td>
                    {selectedSimulations.map((sim) => (
                      <td
                        key={sim.id}
                        className={cn(
                          "text-center p-3 font-medium",
                          sim.id === bestPayback && "bg-solo-success/10"
                        )}
                      >
                        {sim.payback_months !== undefined ? (
                          <div className="flex flex-col items-center gap-1">
                            <span>{formatPayback(sim.payback_months)}</span>
                            {sim.id === bestPayback && (
                              <Badge className="bg-solo-success text-white text-xs">Melhor</Badge>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Insights */}
          {selectedSimulations.length >= 2 && (
            <div className="space-y-3 p-4 rounded-lg bg-muted/30">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-solo-warning" />
                Análise Comparativa
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {selectedSimulations.some((s) => s.type === "cash") && (
                  <p>
                    💡 O pagamento <strong>à vista</strong> elimina juros e oferece o menor custo
                    total, mas exige capital disponível.
                  </p>
                )}
                {bestCashflow &&
                  selectedSimulations.find((s) => s.id === bestCashflow)?.monthly_cashflow &&
                  selectedSimulations.find((s) => s.id === bestCashflow)!.monthly_cashflow! >= 0 && (
                    <p>
                      ✅ A opção <strong>{selectedSimulations.find((s) => s.id === bestCashflow)?.name}</strong>{" "}
                      gera fluxo de caixa positivo desde o primeiro mês.
                    </p>
                  )}
                {selectedSimulations.some(
                  (s) => s.monthly_cashflow !== undefined && s.monthly_cashflow < 0
                ) && (
                  <p>
                    ⚠️ Algumas opções exigem <strong>desembolso mensal</strong> durante o
                    financiamento, pressionando o caixa do cliente.
                  </p>
                )}
                {/* Additional insight about payback */}
                {bestPayback && selectedSimulations.find((s) => s.id === bestPayback) && (
                  <p>
                    ⏱️ O menor tempo de retorno é da opção <strong>
                      {selectedSimulations.find((s) => s.id === bestPayback)?.name}
                    </strong> com payback de {formatPayback(selectedSimulations.find((s) => s.id === bestPayback)?.payback_months)}.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
