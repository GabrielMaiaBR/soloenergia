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
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { Simulation, Client } from "@/types";
import { useUpdateSimulation } from "@/hooks/useSimulations";
import { useSettings } from "@/hooks/useSettings";
import {
  detectMonthlyRate,
  calculateRealEconomy,
  calculateCashflow,
  calculatePayback,
  formatCurrency,
  formatPercent,
} from "@/lib/financial";

interface SimulationEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simulation: Simulation;
  client: Client;
}

export function SimulationEditModal({
  open,
  onOpenChange,
  simulation,
  client,
}: SimulationEditModalProps) {
  const { data: settings } = useSettings();
  const updateSimulation = useUpdateSimulation();

  const [formData, setFormData] = useState({
    name: simulation.name || "",
    system_value: simulation.system_value.toString(),
    entry_value: (simulation.entry_value || 0).toString(),
    financed_value: (simulation.financed_value || 0).toString(),
    installments: (simulation.installments || 60).toString(),
    installment_value: (simulation.installment_value || 0).toString(),
    card_machine_fee: (simulation.card_machine_fee || 2.5).toString(),
    has_cashback: simulation.has_cashback || false,
    tariff_increase_rate: simulation.tariff_increase_rate || 8,
    version_note: simulation.version_note || "",
  });

  useEffect(() => {
    setFormData({
      name: simulation.name || "",
      system_value: simulation.system_value.toString(),
      entry_value: (simulation.entry_value || 0).toString(),
      financed_value: (simulation.financed_value || 0).toString(),
      installments: (simulation.installments || 60).toString(),
      installment_value: (simulation.installment_value || 0).toString(),
      card_machine_fee: (simulation.card_machine_fee || 2.5).toString(),
      has_cashback: simulation.has_cashback || false,
      tariff_increase_rate: simulation.tariff_increase_rate || 8,
      version_note: simulation.version_note || "",
    });
  }, [simulation]);

  const handleSubmit = async () => {
    const systemValue = parseFloat(formData.system_value) || 0;
    const entryValue = parseFloat(formData.entry_value) || 0;
    const financedValue = parseFloat(formData.financed_value) || systemValue - entryValue;
    const installments = parseInt(formData.installments) || 60;
    const installmentValue = parseFloat(formData.installment_value) || 0;

    // Recalculate financial metrics
    const lei14300Factor = settings?.lei_14300_factor || 0.85;
    const monthlyEconomy = calculateRealEconomy(
      client.monthly_generation_kwh || 0,
      client.energy_tariff || settings?.default_tariff || 0.85,
      lei14300Factor
    );

    let detected_monthly_rate: number | undefined;
    let rate_semaphore: "excellent" | "average" | "expensive" | undefined;
    let total_interest_paid: number | undefined;
    let monthly_cashflow: number | undefined;
    let payback_months: number | undefined;

    if (simulation.type === "cash") {
      detected_monthly_rate = 0;
      rate_semaphore = "excellent";
      total_interest_paid = 0;
      monthly_cashflow = monthlyEconomy;
      const payback = calculatePayback(systemValue, monthlyEconomy);
      payback_months = payback.months;
    } else if (simulation.type === "credit_card") {
      const machineFee = parseFloat(formData.card_machine_fee) || 0;
      const effectiveValue = systemValue * (1 + machineFee / 100);
      const calcInstallment = effectiveValue / installments;
      const rateResult = detectMonthlyRate(systemValue, installments, calcInstallment);
      detected_monthly_rate = rateResult.monthly_rate;
      rate_semaphore = rateResult.semaphore;
      total_interest_paid = rateResult.total_interest;
      const cashflowResult = calculateCashflow(monthlyEconomy, calcInstallment);
      monthly_cashflow = cashflowResult.monthly_cashflow;
      const totalPaid = calcInstallment * installments;
      const payback = calculatePayback(totalPaid, monthlyEconomy);
      payback_months = payback.months;
    } else if (financedValue > 0 && installmentValue > 0) {
      const rateResult = detectMonthlyRate(financedValue, installments, installmentValue);
      detected_monthly_rate = rateResult.monthly_rate;
      rate_semaphore = rateResult.semaphore;
      total_interest_paid = rateResult.total_interest;
      const cashflowResult = calculateCashflow(monthlyEconomy, installmentValue);
      monthly_cashflow = cashflowResult.monthly_cashflow;
      const totalPaid = installmentValue * installments + entryValue;
      const payback = calculatePayback(totalPaid, monthlyEconomy);
      payback_months = payback.months;
    }

    await updateSimulation.mutateAsync({
      id: simulation.id,
      name: formData.name || `Simulação v${simulation.version}`,
      system_value: systemValue,
      entry_value: entryValue || undefined,
      financed_value: simulation.type === "cash" ? undefined : financedValue,
      installments: simulation.type === "cash" ? undefined : installments,
      installment_value: simulation.type === "cash" ? undefined : installmentValue,
      card_machine_fee: simulation.type === "credit_card" ? parseFloat(formData.card_machine_fee) : undefined,
      has_cashback: simulation.type === "credit_card" ? formData.has_cashback : undefined,
      detected_monthly_rate,
      rate_semaphore,
      total_interest_paid,
      monthly_cashflow,
      payback_months,
      tariff_increase_rate: formData.tariff_increase_rate,
      version_note: formData.version_note || undefined,
    });

    onOpenChange(false);
  };

  const typeLabels: Record<string, string> = {
    financing: "Financiamento",
    credit_card: "Cartão de Crédito",
    cash: "À Vista",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Simulação - {typeLabels[simulation.type] || simulation.type}
          </DialogTitle>
        </DialogHeader>

        <TooltipProvider>
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Simulação</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`Simulação v${simulation.version}`}
              />
            </div>

            {/* System Value */}
            <div className="space-y-2">
              <Label htmlFor="system_value">Valor do Sistema</Label>
              <Input
                id="system_value"
                type="number"
                value={formData.system_value}
                onChange={(e) => setFormData({ ...formData, system_value: e.target.value })}
              />
            </div>

            {simulation.type !== "cash" && (
              <>
                {/* Entry & Financed */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entry_value">Entrada</Label>
                    <Input
                      id="entry_value"
                      type="number"
                      value={formData.entry_value}
                      onChange={(e) => setFormData({ ...formData, entry_value: e.target.value })}
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
                    />
                  </div>
                </div>

                {/* Installments */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="installments">Parcelas</Label>
                    <Input
                      id="installments"
                      type="number"
                      value={formData.installments}
                      onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installment_value">Valor da Parcela</Label>
                    <Input
                      id="installment_value"
                      type="number"
                      step="0.01"
                      value={formData.installment_value}
                      onChange={(e) => setFormData({ ...formData, installment_value: e.target.value })}
                    />
                  </div>
                </div>

                {/* Credit Card Specific */}
                {simulation.type === "credit_card" && (
                  <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="machine_fee">Taxa da Maquininha (%)</Label>
                        <Input
                          id="machine_fee"
                          type="number"
                          step="0.1"
                          value={formData.card_machine_fee}
                          onChange={(e) => setFormData({ ...formData, card_machine_fee: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                          id="cashback"
                          checked={formData.has_cashback}
                          onCheckedChange={(checked) => setFormData({ ...formData, has_cashback: !!checked })}
                        />
                        <Label htmlFor="cashback" className="cursor-pointer">
                          Cashback/Milhas
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Tariff Increase Rate */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Reajuste Anual de Tarifa</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Projeção do aumento anual da tarifa de energia.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-medium">{formData.tariff_increase_rate}% a.a.</span>
              </div>
              <Slider
                value={[formData.tariff_increase_rate]}
                onValueChange={([value]) => setFormData({ ...formData, tariff_increase_rate: value })}
                min={0}
                max={20}
                step={1}
              />
            </div>

            {/* Version Note */}
            <div className="space-y-2">
              <Label htmlFor="version_note">Nota de Alteração (opcional)</Label>
              <Textarea
                id="version_note"
                value={formData.version_note}
                onChange={(e) => setFormData({ ...formData, version_note: e.target.value })}
                placeholder="Ex: Ajustado após contraproposta do banco"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={updateSimulation.isPending}>
                {updateSimulation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
