import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Zap,
    Sun,
    DollarSign,
    TrendingUp,
    PiggyBank,
    Target,
    Lightbulb
} from "lucide-react";
import { formatCurrency } from "@/lib/financial";
import type { ReverseCalcResult } from "@/lib/reverse-calculator";
import { cn } from "@/lib/utils";

interface SystemRecommendationProps {
    recommendation: ReverseCalcResult['recommendation'];
    scenarios: ReverseCalcResult['scenarios'];
    longTermProjection: ReverseCalcResult['longTermProjection'];
}

export function SystemRecommendation({
    recommendation,
    scenarios,
    longTermProjection,
}: SystemRecommendationProps) {
    return (
        <div className="space-y-4">
            {/* Main Recommendation */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Sistema Recomendado
                        </CardTitle>
                        <Badge variant="secondary" className="gap-1">
                            <Sun className="h-3 w-3" />
                            HSP {recommendation.hspUsed}h
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Power */}
                        <div className="p-4 rounded-lg bg-background/50 text-center">
                            <Zap className="h-6 w-6 text-solo-warning mx-auto mb-2" />
                            <div className="text-2xl font-bold">{recommendation.powerKwp}</div>
                            <div className="text-sm text-muted-foreground">kWp</div>
                        </div>

                        {/* Generation */}
                        <div className="p-4 rounded-lg bg-background/50 text-center">
                            <Sun className="h-6 w-6 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-bold">{recommendation.monthlyGenerationKwh.toLocaleString('pt-BR')}</div>
                            <div className="text-sm text-muted-foreground">kWh/mês</div>
                        </div>

                        {/* System Value */}
                        <div className="p-4 rounded-lg bg-background/50 text-center">
                            <DollarSign className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                            <div className="text-2xl font-bold">{formatCurrency(recommendation.estimatedSystemValue)}</div>
                            <div className="text-sm text-muted-foreground">Valor est.</div>
                        </div>

                        {/* Monthly Economy */}
                        <div className="p-4 rounded-lg bg-solo-success/10 border border-solo-success/30 text-center">
                            <TrendingUp className="h-6 w-6 text-solo-success mx-auto mb-2" />
                            <div className="text-2xl font-bold text-solo-success">{formatCurrency(recommendation.monthlyEconomy)}</div>
                            <div className="text-sm text-muted-foreground">Economia/mês</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Long Term Projection */}
            <Card className="bg-gradient-to-br from-solo-success/5 to-transparent border-solo-success/30">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-solo-success/10">
                            <PiggyBank className="h-8 w-8 text-solo-success" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-lg">
                                Economia em 25 anos: <span className="text-solo-success">{formatCurrency(longTermProjection.totalSavings25Years)}</span>
                            </h4>
                            <p className="text-muted-foreground">
                                Média de {formatCurrency(longTermProjection.averageAnnualSavings)}/ano •
                                <span className="text-solo-success font-medium ml-1">ROI de {longTermProjection.roi}%</span>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Scenarios Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Cashflow Zero */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            Cenário: Sistema se Paga
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Sistema</span>
                            <span className="font-medium">{scenarios.cashflowZero.powerKwp} kWp</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Valor</span>
                            <span className="font-medium">{formatCurrency(scenarios.cashflowZero.estimatedSystemValue)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Parcela máxima</span>
                            <span className="font-medium text-primary">{formatCurrency(scenarios.cashflowZero.maxInstallmentValue)}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                                <Lightbulb className="h-3 w-3 inline mr-1" />
                                Economia mensal = Parcela (cashflow zero)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Cashflow Positive */}
                <Card className="border-solo-success/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-solo-success" />
                            Cenário: Sobra Dinheiro
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Sistema</span>
                            <span className="font-medium">{scenarios.cashflowPositive.powerKwp} kWp</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Valor</span>
                            <span className="font-medium">{formatCurrency(scenarios.cashflowPositive.estimatedSystemValue)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Sobra por mês</span>
                            <span className="font-medium text-solo-success">+{formatCurrency(scenarios.cashflowPositive.targetCashflow)}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                                <Lightbulb className="h-3 w-3 inline mr-1" />
                                Sistema maior gera sobra mensal
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
