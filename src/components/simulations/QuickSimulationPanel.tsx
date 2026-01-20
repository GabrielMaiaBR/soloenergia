import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Calculator, Banknote, CreditCard, Wallet, Save, 
  TrendingUp, TrendingDown, Clock, Percent, DollarSign,
  Info, Sparkles, AlertCircle, CheckCircle
} from "lucide-react";
import { detectMonthlyRate, calculatePayback, calculateCashflow, getRateSemaphore, formatCurrency, formatPercent } from "@/lib/financial";
import { useCreateSimulation } from "@/hooks/useSimulations";
import type { Client, SimulationType, RateSemaphore } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuickSimulationPanelProps {
  client: Client;
  monthlyEconomy: number;
  onSimulationCreated?: () => void;
}

const typeConfig = {
  financing: { label: "Financiamento", icon: Banknote, description: "Banco ou financeira" },
  credit_card: { label: "Cartão", icon: CreditCard, description: "Parcelamento em cartão" },
  cash: { label: "À Vista", icon: Wallet, description: "Pagamento integral" },
};

const semaphoreConfig: Record<RateSemaphore, { label: string; color: string }> = {
  excellent: { label: "Excelente", color: "bg-solo-success text-white" },
  average: { label: "Média", color: "bg-solo-warning text-black" },
  expensive: { label: "Caro", color: "bg-solo-danger text-white" },
};

export function QuickSimulationPanel({ client, monthlyEconomy, onSimulationCreated }: QuickSimulationPanelProps) {
  const createSimulation = useCreateSimulation();

  const [simulationType, setSimulationType] = useState<SimulationType>("financing");
  const [systemValue, setSystemValue] = useState<string>("30000");
  const [entryValue, setEntryValue] = useState<string>("0");
  const [installments, setInstallments] = useState<string>("60");
  const [installmentValue, setInstallmentValue] = useState<string>("800");
  const [cardMachineFee, setCardMachineFee] = useState<string>("0");
  const [hasCashback, setHasCashback] = useState(false);
  const [tariffIncreaseRate, setTariffIncreaseRate] = useState(8);
  const [simulationName, setSimulationName] = useState("");

  // Calculate results in real-time
  const results = useMemo(() => {
    const sysValue = parseFloat(systemValue) || 0;
    const entry = parseFloat(entryValue) || 0;
    const numInstallments = parseInt(installments) || 0;
    const instValue = parseFloat(installmentValue) || 0;
    const machineFee = parseFloat(cardMachineFee) || 0;

    if (simulationType === "cash") {
      const payback = calculatePayback(sysValue, monthlyEconomy, tariffIncreaseRate);
      return {
        monthlyRate: 0,
        annualRate: 0,
        semaphore: "excellent" as RateSemaphore,
        totalPaid: sysValue,
        totalInterest: 0,
        monthlyCashflow: monthlyEconomy,
        isPositiveCashflow: monthlyEconomy >= 0,
        paybackMonths: payback.months,
        paybackDisplay: payback.display,
      };
    }

    const financedValue = sysValue - entry;
    
    if (financedValue <= 0 || numInstallments <= 0 || instValue <= 0) {
      return null;
    }

    // For credit card, consider machine fee
    const effectiveInstallment = simulationType === "credit_card" 
      ? instValue * (1 + machineFee / 100)
      : instValue;

    const rateResult = detectMonthlyRate(financedValue, numInstallments, effectiveInstallment);
    const totalPaid = effectiveInstallment * numInstallments + entry;
    const cashflowResult = calculateCashflow(monthlyEconomy, effectiveInstallment);
    const payback = calculatePayback(totalPaid, monthlyEconomy, tariffIncreaseRate);

    return {
      monthlyRate: rateResult.monthly_rate,
      annualRate: rateResult.annual_rate,
      semaphore: rateResult.semaphore,
      totalPaid,
      totalInterest: rateResult.total_interest,
      monthlyCashflow: cashflowResult.monthly_cashflow,
      isPositiveCashflow: cashflowResult.is_positive,
      paybackMonths: payback.months,
      paybackDisplay: payback.display,
    };
  }, [simulationType, systemValue, entryValue, installments, installmentValue, cardMachineFee, monthlyEconomy, tariffIncreaseRate]);

  const handleSave = async () => {
    if (!results) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const sysValue = parseFloat(systemValue) || 0;
    const entry = parseFloat(entryValue) || 0;
    const numInstallments = parseInt(installments) || 0;
    const instValue = parseFloat(installmentValue) || 0;

    try {
      await createSimulation.mutateAsync({
        client_id: client.id,
        type: simulationType,
        name: simulationName || undefined,
        is_favorite: false,
        system_value: sysValue,
        financed_value: simulationType !== "cash" ? sysValue - entry : undefined,
        entry_value: entry > 0 ? entry : undefined,
        installments: simulationType !== "cash" ? numInstallments : undefined,
        installment_value: simulationType !== "cash" ? instValue : undefined,
        card_machine_fee: simulationType === "credit_card" ? parseFloat(cardMachineFee) || undefined : undefined,
        has_cashback: simulationType === "credit_card" ? hasCashback : undefined,
        detected_monthly_rate: results.monthlyRate,
        rate_semaphore: results.semaphore,
        total_interest_paid: results.totalInterest,
        monthly_cashflow: results.monthlyCashflow,
        payback_months: results.paybackMonths === Infinity ? undefined : results.paybackMonths,
        tariff_increase_rate: tariffIncreaseRate,
      });

      onSimulationCreated?.();
      
      // Reset form
      setSimulationName("");
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulação Rápida
          </CardTitle>
          <CardDescription>
            Crie e compare diferentes cenários de pagamento
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Simulation Type Tabs */}
          <Tabs value={simulationType} onValueChange={(v) => setSimulationType(v as SimulationType)}>
            <TabsList className="grid grid-cols-3 w-full">
              {(Object.keys(typeConfig) as SimulationType[]).map((type) => {
                const config = typeConfig[type];
                const Icon = config.icon;
                return (
                  <TabsTrigger key={type} value={type} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Common Fields */}
            <div className="mt-6 space-y-4">
              {/* System Value */}
              <div className="space-y-2">
                <Label htmlFor="systemValue">Valor do Sistema</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="systemValue"
                    type="number"
                    value={systemValue}
                    onChange={(e) => setSystemValue(e.target.value)}
                    className="pl-9"
                    placeholder="30000"
                  />
                </div>
              </div>

              {/* Financing/Credit Card specific fields */}
              {simulationType !== "cash" && (
                <>
                  {/* Entry Value */}
                  <div className="space-y-2">
                    <Label htmlFor="entryValue">Entrada (opcional)</Label>
                    <Input
                      id="entryValue"
                      type="number"
                      value={entryValue}
                      onChange={(e) => setEntryValue(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Installments */}
                    <div className="space-y-2">
                      <Label htmlFor="installments">Parcelas</Label>
                      <Input
                        id="installments"
                        type="number"
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        placeholder="60"
                      />
                    </div>

                    {/* Installment Value */}
                    <div className="space-y-2">
                      <Label htmlFor="installmentValue">Valor da Parcela</Label>
                      <Input
                        id="installmentValue"
                        type="number"
                        value={installmentValue}
                        onChange={(e) => setInstallmentValue(e.target.value)}
                        placeholder="800"
                      />
                    </div>
                  </div>

                  {/* Credit Card specific */}
                  {simulationType === "credit_card" && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="cardMachineFee">Taxa da Maquininha (%)</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Taxa cobrada pela maquininha de cartão</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="cardMachineFee"
                          type="number"
                          value={cardMachineFee}
                          onChange={(e) => setCardMachineFee(e.target.value)}
                          placeholder="0"
                          step="0.1"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="hasCashback">Cashback ativo?</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Se o cliente recebe cashback no cartão</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Switch
                          id="hasCashback"
                          checked={hasCashback}
                          onCheckedChange={setHasCashback}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Tariff Increase Rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Reajuste Anual de Tarifa</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          A tarifa de energia sobe em média 8-10% ao ano no Brasil.
                          Isso acelera o payback do sistema solar.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Badge variant="outline">{tariffIncreaseRate}% a.a.</Badge>
                </div>
                <Slider
                  value={[tariffIncreaseRate]}
                  onValueChange={([v]) => setTariffIncreaseRate(v)}
                  min={0}
                  max={15}
                  step={0.5}
                />
              </div>

              {/* Simulation Name */}
              <div className="space-y-2">
                <Label htmlFor="simName">Nome da Simulação (opcional)</Label>
                <Input
                  id="simName"
                  value={simulationName}
                  onChange={(e) => setSimulationName(e.target.value)}
                  placeholder={`${typeConfig[simulationType].label} - ${installments}x`}
                />
              </div>
            </div>
          </Tabs>

          <Separator />

          {/* Results Preview */}
          {results && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                Resultado da Simulação
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Monthly Rate */}
                {simulationType !== "cash" && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <Percent className="h-3.5 w-3.5" />
                      Taxa Mensal
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {formatPercent(results.monthlyRate)}
                      </span>
                      <Badge className={semaphoreConfig[results.semaphore].color}>
                        {semaphoreConfig[results.semaphore].label}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatPercent(results.annualRate)} a.a.
                    </div>
                  </div>
                )}

                {/* Total Interest */}
                {results.totalInterest > 0 && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Juros Totais</div>
                    <div className="text-lg font-semibold text-solo-danger">
                      {formatCurrency(results.totalInterest)}
                    </div>
                  </div>
                )}

                {/* Monthly Cashflow */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    {results.isPositiveCashflow ? (
                      <TrendingUp className="h-3.5 w-3.5 text-solo-success" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-solo-danger" />
                    )}
                    Fluxo Mensal
                  </div>
                  <div className={cn(
                    "text-lg font-semibold",
                    results.isPositiveCashflow ? "text-solo-success" : "text-solo-danger"
                  )}>
                    {formatCurrency(results.monthlyCashflow)}
                  </div>
                  <div className="flex items-center gap-1 text-xs mt-1">
                    {results.isPositiveCashflow ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-solo-success" />
                        <span className="text-solo-success">Positivo!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-solo-danger" />
                        <span className="text-solo-danger">Desembolso</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Payback */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    Payback
                  </div>
                  <div className="text-lg font-semibold text-primary">
                    {results.paybackDisplay}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button 
                className="w-full gap-2" 
                onClick={handleSave}
                disabled={createSimulation.isPending}
              >
                <Save className="h-4 w-4" />
                Salvar Simulação
              </Button>
            </div>
          )}

          {!results && simulationType !== "cash" && (
            <div className="text-center py-4 text-muted-foreground">
              <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Preencha os campos para ver o resultado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
