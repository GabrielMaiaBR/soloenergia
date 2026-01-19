import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Client, SimulationType, Simulation } from "@/types";
import { useCreateSimulation } from "@/hooks/useSimulations";
import { useSettings } from "@/hooks/useSettings";
import {
  detectMonthlyRate,
  calculateInstallment,
  calculateRealEconomy,
  calculateCashflow,
  calculatePayback,
  formatCurrency,
  formatPercent,
} from "@/lib/financial";

interface SimulationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
}

type CalculationMode = "find_installment" | "find_rate";

const typeLabels: Record<SimulationType, string> = {
  financing: "Financiamento",
  credit_card: "Cartão de Crédito",
  cash: "À Vista",
  consortium: "Consórcio",
};

export function SimulationModal({ open, onOpenChange, client }: SimulationModalProps) {
  const { data: settings } = useSettings();
  const createSimulation = useCreateSimulation();

  const [type, setType] = useState<SimulationType>("financing");
  const [calculationMode, setCalculationMode] = useState<CalculationMode>("find_rate");

  const [formData, setFormData] = useState({
    system_value: "",
    financed_value: "",
    entry_value: "",
    installments: "60",
    installment_value: "",
    grace_period_days: "30",
    card_machine_fee: "2.5",
    has_cashback: false,
    tariff_increase_rate: 8,
  });

  const [results, setResults] = useState<{
    monthly_rate?: number;
    annual_rate?: number;
    semaphore?: "excellent" | "average" | "expensive";
    total_interest?: number;
    monthly_economy?: number;
    monthly_cashflow?: number;
    is_positive?: boolean;
    payback?: string;
  }>({});

  // Auto-calculate when inputs change
  useEffect(() => {
    calculate();
  }, [formData, type, calculationMode, settings]);

  const calculate = () => {
    const systemValue = parseFloat(formData.system_value) || 0;
    const entryValue = parseFloat(formData.entry_value) || 0;
    const financedValue = parseFloat(formData.financed_value) || systemValue - entryValue;
    const installments = parseInt(formData.installments) || 60;
    const installmentValue = parseFloat(formData.installment_value) || 0;

    if (!systemValue) {
      setResults({});
      return;
    }

    // Calculate monthly economy
    const lei14300Factor = settings?.lei_14300_factor || 0.85;
    const monthlyEconomy = calculateRealEconomy(
      client.monthly_generation_kwh || 0,
      client.energy_tariff || settings?.default_tariff || 0.85,
      lei14300Factor
    );

    if (type === "cash") {
      // For cash payment, no interest
      const payback = calculatePayback(systemValue, monthlyEconomy);
      setResults({
        monthly_rate: 0,
        annual_rate: 0,
        semaphore: "excellent",
        total_interest: 0,
        monthly_economy: monthlyEconomy,
        monthly_cashflow: monthlyEconomy,
        is_positive: true,
        payback: payback.display,
      });
      return;
    }

    if (type === "credit_card") {
      // Credit card: add machine fee
      const machineFee = parseFloat(formData.card_machine_fee) || 0;
      const effectiveValue = systemValue * (1 + machineFee / 100);
      const calcInstallment = effectiveValue / installments;
      const rateResult = detectMonthlyRate(systemValue, installments, calcInstallment);
      const totalPaid = calcInstallment * installments;
      const cashflowResult = calculateCashflow(monthlyEconomy, calcInstallment);
      const payback = calculatePayback(totalPaid, monthlyEconomy);

      setResults({
        monthly_rate: rateResult.monthly_rate,
        annual_rate: rateResult.annual_rate,
        semaphore: rateResult.semaphore,
        total_interest: rateResult.total_interest,
        monthly_economy: monthlyEconomy,
        monthly_cashflow: cashflowResult.monthly_cashflow,
        is_positive: cashflowResult.is_positive,
        payback: payback.display,
      });
      return;
    }

    // Financing / Consortium
    if (calculationMode === "find_rate" && financedValue > 0 && installmentValue > 0) {
      // Find rate from installment value
      const rateResult = detectMonthlyRate(financedValue, installments, installmentValue);
      const totalPaid = installmentValue * installments + entryValue;
      const cashflowResult = calculateCashflow(monthlyEconomy, installmentValue);
      const payback = calculatePayback(totalPaid, monthlyEconomy);

      setResults({
        monthly_rate: rateResult.monthly_rate,
        annual_rate: rateResult.annual_rate,
        semaphore: rateResult.semaphore,
        total_interest: rateResult.total_interest,
        monthly_economy: monthlyEconomy,
        monthly_cashflow: cashflowResult.monthly_cashflow,
        is_positive: cashflowResult.is_positive,
        payback: payback.display,
      });
    } else if (calculationMode === "find_installment" && financedValue > 0) {
      // Calculate installment from rate (default 1.99%)
      const defaultRate = 1.99;
      const calculatedInstallment = calculateInstallment(financedValue, defaultRate, installments);
      const totalPaid = calculatedInstallment * installments + entryValue;
      const cashflowResult = calculateCashflow(monthlyEconomy, calculatedInstallment);
      const payback = calculatePayback(totalPaid, monthlyEconomy);

      setResults({
        monthly_rate: defaultRate,
        annual_rate: (Math.pow(1 + defaultRate / 100, 12) - 1) * 100,
        semaphore: "average",
        total_interest: totalPaid - systemValue,
        monthly_economy: monthlyEconomy,
        monthly_cashflow: cashflowResult.monthly_cashflow,
        is_positive: cashflowResult.is_positive,
        payback: payback.display,
      });

      // Update installment value in form
      if (calculatedInstallment > 0) {
        setFormData((prev) => ({
          ...prev,
          installment_value: calculatedInstallment.toFixed(2),
        }));
      }
    }
  };

  const handleSubmit = async () => {
    const systemValue = parseFloat(formData.system_value) || 0;
    const entryValue = parseFloat(formData.entry_value) || 0;
    const financedValue = parseFloat(formData.financed_value) || systemValue - entryValue;
    const installments = parseInt(formData.installments) || 60;
    const installmentValue = parseFloat(formData.installment_value) || 0;

    await createSimulation.mutateAsync({
      client_id: client.id,
      type,
      is_favorite: false,
      system_value: systemValue,
      financed_value: type === "cash" ? undefined : financedValue,
      installments: type === "cash" ? undefined : installments,
      installment_value: type === "cash" ? undefined : installmentValue,
      entry_value: entryValue || undefined,
      grace_period_days: parseInt(formData.grace_period_days) || undefined,
      card_machine_fee: type === "credit_card" ? parseFloat(formData.card_machine_fee) : undefined,
      has_cashback: type === "credit_card" ? formData.has_cashback : undefined,
      detected_monthly_rate: results.monthly_rate,
      rate_semaphore: results.semaphore,
      total_interest_paid: results.total_interest,
      monthly_cashflow: results.monthly_cashflow,
      payback_months: results.payback ? parseInt(results.payback) : undefined,
      tariff_increase_rate: formData.tariff_increase_rate,
    });

    onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Simulação - {client.name}</DialogTitle>
        </DialogHeader>

        <TooltipProvider>
          <div className="space-y-6">
            {/* Type Selection */}
            <Tabs value={type} onValueChange={(v) => setType(v as SimulationType)}>
              <TabsList className="grid grid-cols-4 w-full">
                {(Object.keys(typeLabels) as SimulationType[]).map((t) => (
                  <TabsTrigger key={t} value={t}>
                    {typeLabels[t]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* System Value */}
            <div className="space-y-2">
              <Label htmlFor="system_value">Valor do Sistema *</Label>
              <Input
                id="system_value"
                type="number"
                value={formData.system_value}
                onChange={(e) => setFormData({ ...formData, system_value: e.target.value })}
                placeholder="45000"
              />
            </div>

            {type !== "cash" && (
              <>
                {/* Entry Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entry_value">Entrada</Label>
                    <Input
                      id="entry_value"
                      type="number"
                      value={formData.entry_value}
                      onChange={(e) => setFormData({ ...formData, entry_value: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="financed_value">Valor Financiado</Label>
                    <Input
                      id="financed_value"
                      type="number"
                      value={
                        formData.financed_value ||
                        (
                          (parseFloat(formData.system_value) || 0) -
                          (parseFloat(formData.entry_value) || 0)
                        ).toString()
                      }
                      onChange={(e) => setFormData({ ...formData, financed_value: e.target.value })}
                      placeholder="45000"
                    />
                  </div>
                </div>

                {/* Installments & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="installments">Parcelas</Label>
                    <Input
                      id="installments"
                      type="number"
                      value={formData.installments}
                      onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                      placeholder="60"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="installment_value">Valor da Parcela</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Digite o valor da parcela para descobrir a taxa de juros embutida, ou
                            deixe em branco para calcular com taxa padrão.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="installment_value"
                      type="number"
                      step="0.01"
                      value={formData.installment_value}
                      onChange={(e) => {
                        setFormData({ ...formData, installment_value: e.target.value });
                        setCalculationMode("find_rate");
                      }}
                      placeholder="1.250,00"
                    />
                  </div>
                </div>

                {/* Credit Card Specific */}
                {type === "credit_card" && (
                  <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="machine_fee">Taxa da Maquininha (%)</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Taxa cobrada pela máquina de cartão para parcelamento.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="machine_fee"
                          type="number"
                          step="0.1"
                          value={formData.card_machine_fee}
                          onChange={(e) =>
                            setFormData({ ...formData, card_machine_fee: e.target.value })
                          }
                          placeholder="2.5"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                          id="cashback"
                          checked={formData.has_cashback}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, has_cashback: !!checked })
                          }
                        />
                        <Label htmlFor="cashback" className="cursor-pointer">
                          Cliente ganha cashback/milhas
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Tariff Projection */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Projeção de Reajuste de Tarifa</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        A tarifa de energia tende a aumentar anualmente. Esse reajuste acelera o
                        payback do sistema solar.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-medium">{formData.tariff_increase_rate}% ao ano</span>
              </div>
              <Slider
                value={[formData.tariff_increase_rate]}
                onValueChange={([value]) =>
                  setFormData({ ...formData, tariff_increase_rate: value })
                }
                min={0}
                max={20}
                step={1}
              />
            </div>

            {/* Results */}
            {results.monthly_rate !== undefined && (
              <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
                <h4 className="font-medium">Resultados da Simulação</h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Rate */}
                  {type !== "cash" && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Taxa Mensal</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {formatPercent(results.monthly_rate || 0)}
                        </span>
                        <Badge className={getSemaphoreColor(results.semaphore)}>
                          {getSemaphoreLabel(results.semaphore)}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Total Interest */}
                  {type !== "cash" && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Juros Totais</span>
                      <span className="text-lg font-bold text-solo-danger">
                        {formatCurrency(results.total_interest || 0)}
                      </span>
                    </div>
                  )}

                  {/* Cashflow */}
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Fluxo Mensal</span>
                    <div className="flex items-center gap-2">
                      {results.is_positive ? (
                        <TrendingUp className="h-4 w-4 text-solo-success" />
                      ) : results.monthly_cashflow === 0 ? (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-solo-danger" />
                      )}
                      <span
                        className={`text-lg font-bold ${
                          results.is_positive ? "text-solo-success" : "text-solo-danger"
                        }`}
                      >
                        {formatCurrency(results.monthly_cashflow || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Payback */}
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Payback</span>
                    <span className="text-lg font-bold">{results.payback || "-"}</span>
                  </div>
                </div>

                {/* Solo Tip */}
                <div className="p-3 rounded-lg bg-solo-trust/10 border border-solo-trust/20">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Dica do Solo:</strong>{" "}
                    {results.is_positive
                      ? "O fluxo de caixa é positivo! O cliente economiza mais do que paga."
                      : type === "cash"
                      ? "Pagamento à vista garante o menor custo total."
                      : "O cliente terá um desembolso mensal durante o financiamento."}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={createSimulation.isPending}>
                {createSimulation.isPending ? "Salvando..." : "Salvar Simulação"}
              </Button>
            </div>
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
