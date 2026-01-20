import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, TrendingDown, DollarSign, Percent, Clock, 
  Zap, Star, Edit, Trash2, CreditCard, Banknote, Wallet,
  Info, AlertCircle, CheckCircle, Calculator
} from "lucide-react";
import type { Simulation, Client } from "@/types";
import { formatCurrency, formatPercent, calculatePayback, calculateDetailedPayback, calculateRealEconomy } from "@/lib/financial";
import { cn } from "@/lib/utils";
import { useToggleFavorite, useDeleteSimulation } from "@/hooks/useSimulations";
import { SimulationEditModal } from "@/components/simulations/SimulationEditModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface UnifiedClientCardProps {
  client: Client;
  simulations: Simulation[];
  monthlyEconomy: number;
  tariff: number;
  onNewSimulation: () => void;
  onEditSimulation?: (simulation: Simulation) => void;
}

const typeConfig = {
  financing: { label: "Financiamento", icon: Banknote, color: "text-primary" },
  credit_card: { label: "Cartão de Crédito", icon: CreditCard, color: "text-solo-warning" },
  cash: { label: "À Vista", icon: Wallet, color: "text-solo-success" },
};

const semaphoreConfig = {
  excellent: { label: "Excelente", color: "bg-solo-success text-white", description: "Taxa abaixo de 1.5% a.m." },
  average: { label: "Média", color: "bg-solo-warning text-black", description: "Taxa entre 1.5% e 2.0% a.m." },
  expensive: { label: "Caro", color: "bg-solo-danger text-white", description: "Taxa acima de 2.0% a.m." },
};

export function UnifiedClientCard({
  client,
  simulations,
  monthlyEconomy,
  tariff,
  onNewSimulation,
}: UnifiedClientCardProps) {
  const [selectedSimId, setSelectedSimId] = useState<string | undefined>(
    simulations.find(s => s.is_favorite)?.id || simulations[0]?.id
  );
  const [editingSimulation, setEditingSimulation] = useState<Simulation | null>(null);

  const toggleFavorite = useToggleFavorite();
  const deleteSimulation = useDeleteSimulation();

  const selectedSim = useMemo(() => 
    simulations.find(s => s.id === selectedSimId),
    [simulations, selectedSimId]
  );

  // Calculate detailed metrics for selected simulation
  const metrics = useMemo(() => {
    if (!selectedSim) return null;

    const isFinanced = selectedSim.type !== "cash";
    const totalPaid = isFinanced && selectedSim.installment_value && selectedSim.installments
      ? selectedSim.installment_value * selectedSim.installments
      : selectedSim.system_value;

    const monthlyInstallment = selectedSim.installment_value || 0;
    const monthlyCashflow = monthlyEconomy - monthlyInstallment;
    const tariffIncrease = selectedSim.tariff_increase_rate || 8;

    // Calculate proper payback
    const paybackResult = isFinanced && selectedSim.installment_value && selectedSim.installments
      ? calculateDetailedPayback(
          selectedSim.system_value,
          selectedSim.installment_value,
          selectedSim.installments,
          monthlyEconomy,
          tariffIncrease
        )
      : calculatePayback(selectedSim.system_value, monthlyEconomy, tariffIncrease);

    // 25-year projection
    const monthlyIncreaseRate = Math.pow(1 + tariffIncrease / 100, 1/12) - 1;
    let total25YearSavings = 0;
    let currentMonthlyEconomy = monthlyEconomy;
    for (let month = 1; month <= 300; month++) {
      total25YearSavings += currentMonthlyEconomy;
      currentMonthlyEconomy *= (1 + monthlyIncreaseRate);
    }

    const roi = ((total25YearSavings - totalPaid) / totalPaid) * 100;

    return {
      totalPaid,
      monthlyInstallment,
      monthlyCashflow,
      isPositiveCashflow: monthlyCashflow >= 0,
      payback: paybackResult,
      total25YearSavings,
      roi,
      totalInterest: isFinanced ? totalPaid - selectedSim.system_value : 0,
    };
  }, [selectedSim, monthlyEconomy]);

  if (simulations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma simulação criada</h3>
          <p className="text-muted-foreground mb-4">
            Crie sua primeira simulação para visualizar análises financeiras detalhadas.
          </p>
          <Button onClick={onNewSimulation}>
            <Zap className="h-4 w-4 mr-2" />
            Nova Simulação
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleFavorite = () => {
    if (!selectedSim) return;
    toggleFavorite.mutate({ id: selectedSim.id, is_favorite: !selectedSim.is_favorite });
  };

  const handleDelete = () => {
    if (!selectedSim) return;
    if (confirm("Remover esta simulação?")) {
      deleteSimulation.mutate({ id: selectedSim.id, clientId: selectedSim.client_id });
      // Select another simulation after deletion
      const remaining = simulations.filter(s => s.id !== selectedSim.id);
      if (remaining.length > 0) {
        setSelectedSimId(remaining[0].id);
      }
    }
  };

  const config = selectedSim ? typeConfig[selectedSim.type] : null;
  const Icon = config?.icon || Zap;

  return (
    <TooltipProvider>
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Análise Financeira
              </CardTitle>
              <CardDescription>
                Selecione uma opção de parcelamento para ver os detalhes
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onNewSimulation}>
              <Zap className="h-4 w-4 mr-1" />
              Nova
            </Button>
          </div>

          {/* Simulation Selector */}
          <div className="mt-4">
            <Select value={selectedSimId} onValueChange={setSelectedSimId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma simulação" />
              </SelectTrigger>
              <SelectContent>
                {simulations.map((sim) => {
                  const simConfig = typeConfig[sim.type];
                  const SimIcon = simConfig.icon;
                  return (
                    <SelectItem key={sim.id} value={sim.id}>
                      <div className="flex items-center gap-2">
                        <SimIcon className={cn("h-4 w-4", simConfig.color)} />
                        <span>{sim.name || `${simConfig.label} v${sim.version}`}</span>
                        {sim.installments && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {sim.installments}x
                          </Badge>
                        )}
                        {sim.is_favorite && (
                          <Star className="h-3 w-3 fill-solo-warning text-solo-warning" />
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {selectedSim && metrics && (
          <CardContent className="space-y-6">
            {/* Quick Actions */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-5 w-5", config?.color)} />
                <span className="font-medium">{config?.label}</span>
                <Badge variant="outline">v{selectedSim.version}</Badge>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingSimulation(selectedSim)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFavorite}>
                  <Star className={cn("h-4 w-4", selectedSim.is_favorite ? "fill-solo-warning text-solo-warning" : "text-muted-foreground")} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* System Value */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  Valor do Sistema
                </div>
                <div className="text-xl font-semibold">
                  {formatCurrency(selectedSim.system_value)}
                </div>
              </div>

              {/* Monthly Rate (for financing) */}
              {selectedSim.type !== "cash" && selectedSim.detected_monthly_rate !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Percent className="h-3.5 w-3.5" />
                    Taxa Mensal
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Taxa de juros mensal detectada automaticamente</p>
                        <p className="text-xs mt-1">
                          {semaphoreConfig[selectedSim.rate_semaphore || "average"]?.description}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">
                      {formatPercent(selectedSim.detected_monthly_rate)} a.m.
                    </span>
                    {selectedSim.rate_semaphore && (
                      <Badge className={semaphoreConfig[selectedSim.rate_semaphore].color}>
                        {semaphoreConfig[selectedSim.rate_semaphore].label}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Installment */}
              {selectedSim.installment_value && selectedSim.installments && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                    Parcela
                  </div>
                  <div className="text-xl font-semibold">
                    {selectedSim.installments}x {formatCurrency(selectedSim.installment_value)}
                  </div>
                  {selectedSim.entry_value && selectedSim.entry_value > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Entrada: {formatCurrency(selectedSim.entry_value)}
                    </div>
                  )}
                </div>
              )}

              {/* Monthly Cashflow */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {metrics.isPositiveCashflow ? (
                    <TrendingUp className="h-3.5 w-3.5 text-solo-success" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-solo-danger" />
                  )}
                  Fluxo de Caixa Mensal
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Economia mensal - Valor da parcela</p>
                      <p className="text-xs mt-1">
                        {formatCurrency(monthlyEconomy)} - {formatCurrency(metrics.monthlyInstallment)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className={cn(
                  "text-xl font-semibold",
                  metrics.isPositiveCashflow ? "text-solo-success" : "text-solo-danger"
                )}>
                  {formatCurrency(metrics.monthlyCashflow)}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {metrics.isPositiveCashflow ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-solo-success" />
                      <span className="text-solo-success">Sistema se paga sozinho</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-solo-danger" />
                      <span className="text-solo-danger">Desembolso mensal de {formatCurrency(Math.abs(metrics.monthlyCashflow))}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Payback Section */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Tempo de Retorno (Payback)</span>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">Como é calculado?</p>
                    <p className="text-xs">
                      O payback indica quanto tempo leva para a economia acumulada 
                      igualar o investimento total (incluindo juros no financiamento).
                    </p>
                    {selectedSim.tariff_increase_rate && selectedSim.tariff_increase_rate > 0 && (
                      <p className="text-xs mt-1">
                        Considera reajuste de tarifa de {selectedSim.tariff_increase_rate}% ao ano.
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="text-3xl font-bold text-primary">
                {metrics.payback.display}
              </div>

              {/* Progress bar showing payback relative to 25 years */}
              <div className="space-y-1">
                <Progress 
                  value={Math.min((metrics.payback.months / 300) * 100, 100)} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>Vida útil: 25 anos</span>
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <div className="text-sm text-muted-foreground">Total Investido</div>
                  <div className="font-semibold">{formatCurrency(metrics.totalPaid)}</div>
                  {metrics.totalInterest > 0 && (
                    <div className="text-xs text-solo-danger">
                      Juros: {formatCurrency(metrics.totalInterest)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Economia em 25 anos</div>
                  <div className="font-semibold text-solo-success">
                    {formatCurrency(metrics.total25YearSavings)}
                  </div>
                  <div className="text-xs text-solo-success">
                    ROI: {metrics.roi.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Version Note */}
            {selectedSim.version_note && (
              <div className="p-3 rounded-lg bg-muted/30 text-sm">
                <div className="text-xs text-muted-foreground mb-1">Observações</div>
                {selectedSim.version_note}
              </div>
            )}
          </CardContent>
        )}

        {/* Edit Modal */}
        {editingSimulation && (
          <SimulationEditModal
            open={!!editingSimulation}
            onOpenChange={(open) => !open && setEditingSimulation(null)}
            simulation={editingSimulation}
            client={client}
          />
        )}
      </Card>
    </TooltipProvider>
  );
}
