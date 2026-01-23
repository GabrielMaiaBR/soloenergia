import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Minus,
    DollarSign,
    Zap
} from "lucide-react";
import { formatCurrency } from "@/lib/financial";
import type { FinancingOption } from "@/lib/reverse-calculator";
import { cn } from "@/lib/utils";

interface FinancingComparisonProps {
    options: FinancingOption[];
    monthlyEconomy: number;
    systemValue: number;
}

export function FinancingComparison({
    options,
    monthlyEconomy,
    systemValue
}: FinancingComparisonProps) {
    // Find extremes for scaling
    const maxTotal = Math.max(...options.map(o => o.totalPaid));
    const minTotal = Math.min(...options.map(o => o.totalPaid));

    // Calculate interest paid for each option
    const optionsWithInterest = options.map(opt => ({
        ...opt,
        interestPaid: opt.totalPaid - systemValue,
        interestPercent: ((opt.totalPaid - systemValue) / systemValue) * 100,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Comparativo Visual de Financiamentos
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Veja rapidamente qual prazo oferece melhor custo-benefício
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {optionsWithInterest.map((option) => {
                    const totalPercent = (option.totalPaid / maxTotal) * 100;
                    const principalPercent = (systemValue / maxTotal) * 100;

                    return (
                        <div key={option.installments} className="space-y-2">
                            {/* Header */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{option.installments}x</span>
                                    <span className="text-muted-foreground">
                                        {formatCurrency(option.installmentValue)}/mês
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={cn(
                                        "flex items-center gap-1 font-medium",
                                        option.monthlyCashflow >= 0 ? "text-solo-success" : "text-solo-danger"
                                    )}>
                                        {option.monthlyCashflow >= 0 ? (
                                            <TrendingUp className="h-3 w-3" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3" />
                                        )}
                                        {option.monthlyCashflow >= 0 ? '+' : ''}{formatCurrency(option.monthlyCashflow)}
                                    </span>
                                </div>
                            </div>

                            {/* Bar */}
                            <div className="relative h-8 rounded-lg overflow-hidden bg-muted">
                                {/* Principal (system value) */}
                                <div
                                    className="absolute left-0 top-0 h-full bg-primary/30"
                                    style={{ width: `${principalPercent}%` }}
                                />
                                {/* Interest */}
                                <div
                                    className="absolute top-0 h-full bg-solo-danger/40"
                                    style={{
                                        left: `${principalPercent}%`,
                                        width: `${totalPercent - principalPercent}%`
                                    }}
                                />
                                {/* Labels inside bar */}
                                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs">
                                    <span className="font-medium">
                                        Total: {formatCurrency(option.totalPaid)}
                                    </span>
                                    <span className={cn(
                                        "font-medium",
                                        option.interestPaid > systemValue * 0.3 ? "text-solo-danger" : "text-muted-foreground"
                                    )}>
                                        Juros: {formatCurrency(option.interestPaid)} ({option.interestPercent.toFixed(0)}%)
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Legend */}
                <div className="flex items-center gap-6 pt-4 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-3 rounded bg-primary/30" />
                        <span>Valor do Sistema</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-3 rounded bg-solo-danger/40" />
                        <span>Juros</span>
                    </div>
                </div>

                {/* Key insight */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                    <p>
                        <strong>💡 Insight:</strong> Prazos mais longos têm taxa menor, mas juros totais maiores.
                        O ideal é equilibrar o cashflow mensal com o custo total.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
