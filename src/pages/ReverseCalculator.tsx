import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calculator,
    Zap,
    TrendingUp,
    DollarSign,
    Sun,
    PiggyBank,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { calculateReverse, ReverseCalcResult, AVAILABLE_TERMS } from "@/lib/reverse-calculator";
import { getAllStates, getHSPByState, DEFAULT_HSP } from "@/lib/solar-sizing";
import { formatCurrency } from "@/lib/financial";
import { FinancingOptionsTable } from "@/components/calculator/FinancingOptionsTable";
import { SystemRecommendation } from "@/components/calculator/SystemRecommendation";
import { EnergyBillProjection } from "@/components/calculator/EnergyBillProjection";
import { SalesInsights } from "@/components/calculator/SalesInsights";
import { QuickShare } from "@/components/calculator/QuickShare";
import { FinancingComparison } from "@/components/calculator/FinancingComparison";
import { cn } from "@/lib/utils";

const states = getAllStates();

export default function ReverseCalculator() {
    const { data: settings } = useSettings();

    // Form state
    const [budget, setBudget] = useState(500);
    const [stateCode, setStateCode] = useState("CE");
    const [tariff, setTariff] = useState(settings?.default_tariff || 0.85);

    // Update tariff when settings load
    useMemo(() => {
        if (settings?.default_tariff && tariff === 0.85) {
            setTariff(settings.default_tariff);
        }
    }, [settings?.default_tariff]);

    // Calculate result
    const result: ReverseCalcResult | null = useMemo(() => {
        if (budget <= 0 || tariff <= 0) return null;

        return calculateReverse({
            monthlyBudget: budget,
            energyTariff: tariff,
            hspOrStateCode: stateCode,
            lei14300Factor: settings?.lei_14300_factor || 0.85,
        });
    }, [budget, tariff, stateCode, settings?.lei_14300_factor]);

    const hsp = getHSPByState(stateCode) || DEFAULT_HSP;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Calculator className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold">Calculadora Reversa</h1>
                        <p className="text-muted-foreground">
                            Qual sistema solar cabe no bolso do cliente?
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Input Form */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            Orçamento do Cliente
                        </CardTitle>
                        <CardDescription>
                            Quanto o cliente pode pagar por mês?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Budget Slider */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="budget">Parcela Máxima</Label>
                                <div className="text-2xl font-bold text-primary">
                                    {formatCurrency(budget)}
                                </div>
                            </div>
                            <Slider
                                id="budget"
                                value={[budget]}
                                onValueChange={([value]) => setBudget(value)}
                                min={100}
                                max={3000}
                                step={50}
                                className="py-4 transition-all hover:scale-[1.01]"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>R$ 100</span>
                                <span>R$ 3.000</span>
                            </div>
                            {/* Quick buttons */}
                            <div className="flex gap-2 flex-wrap">
                                {[300, 500, 700, 1000, 1500].map((value) => (
                                    <Button
                                        key={value}
                                        variant={budget === value ? "default" : "outline"}
                                        size="sm"
                                        className="transition-all hover:scale-105 active:scale-95"
                                        onClick={() => setBudget(value)}
                                    >
                                        R$ {value}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* State Select */}
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select value={stateCode} onValueChange={setStateCode}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {states.map((state) => (
                                        <SelectItem key={state.code} value={state.code}>
                                            {state.code} - HSP {state.hsp}h
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                HSP: {hsp} horas de sol pico/dia
                            </p>
                        </div>

                        {/* Tariff Input */}
                        <div className="space-y-2">
                            <Label htmlFor="tariff">Tarifa (R$/kWh)</Label>
                            <Input
                                id="tariff"
                                type="number"
                                step="0.01"
                                value={tariff}
                                onChange={(e) => setTariff(parseFloat(e.target.value) || 0)}
                                placeholder="0.85"
                            />
                        </div>

                        {/* Info Card - Animated */}
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 animate-pulse-gentle">
                            <div className="flex items-start gap-3">
                                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-primary">Dica de Vendas</p>
                                    <p className="text-muted-foreground mt-1">
                                        "Quanto você paga de luz hoje? Com esse valor, você pode ter um
                                        sistema solar que se paga sozinho!"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="lg:col-span-2 space-y-6">
                    {result ? (
                        <>
                            {/* System Recommendation */}
                            <SystemRecommendation
                                recommendation={result.recommendation}
                                scenarios={result.scenarios}
                                longTermProjection={result.longTermProjection}
                            />

                            {/* Financing Options */}
                            <FinancingOptionsTable
                                options={result.financingOptions}
                                cashOption={result.cashOption}
                                monthlyEconomy={result.recommendation.monthlyEconomy}
                            />

                            {/* Financing Comparison Visual */}
                            <FinancingComparison
                                options={result.financingOptions}
                                monthlyEconomy={result.recommendation.monthlyEconomy}
                                systemValue={result.recommendation.estimatedSystemValue}
                            />

                            {/* Energy Bill Projection */}
                            <EnergyBillProjection
                                currentMonthlyBill={result.recommendation.monthlyEconomy / 0.85}
                                tariffIncreaseRate={8}
                            />

                            {/* Quick Share - antes do SalesInsights */}
                            <QuickShare
                                result={result}
                                clientBudget={budget}
                                whatsappNumber={settings?.whatsapp_number}
                            />

                            {/* Sales Insights - por último */}
                            <SalesInsights
                                result={result}
                                clientBudget={budget}
                            />
                        </>
                    ) : (
                        <Card className="p-12 text-center">
                            <Calculator className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">Defina o orçamento</h3>
                            <p className="text-muted-foreground">
                                Ajuste o valor da parcela máxima para ver as recomendações
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
