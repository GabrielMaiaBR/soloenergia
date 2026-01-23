import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Clock, TrendingUp, AlertTriangle, CheckCircle2, Info, Banknote, BarChart3, Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/lib/financial";
import type { FinancingOption, CashOption } from "@/lib/reverse-calculator";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface FinancingOptionsTableProps {
    options: FinancingOption[];
    cashOption: CashOption;
    monthlyEconomy: number;
}

const viabilityConfig = {
    excellent: {
        color: "bg-solo-success text-white",
        icon: CheckCircle2,
        bgRow: "bg-solo-success/5",
    },
    good: {
        color: "bg-primary text-white",
        icon: TrendingUp,
        bgRow: "bg-primary/5",
    },
    tight: {
        color: "bg-solo-warning text-black",
        icon: AlertTriangle,
        bgRow: "bg-solo-warning/5",
    },
    negative: {
        color: "bg-solo-danger text-white",
        icon: AlertTriangle,
        bgRow: "bg-solo-danger/5",
    },
};

export function FinancingOptionsTable({ options, cashOption, monthlyEconomy }: FinancingOptionsTableProps) {
    const [showVPL, setShowVPL] = useState(false);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Comparativo de Opções de Pagamento
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Compare as opções e escolha a ideal para o perfil do cliente
                        </p>
                    </div>
                    {/* Toggle VPL */}
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="show-vpn"
                                        checked={showVPL}
                                        onCheckedChange={setShowVPL}
                                    />
                                    <Label htmlFor="show-vpn" className="text-xs cursor-pointer flex items-center gap-1">
                                        {showVPL ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                        VPL
                                    </Label>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px]">
                                <p>Mostrar Valor Presente Líquido - métrica técnica para análise financeira avançada</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <TooltipProvider>
                    {/* Opção à Vista em destaque */}
                    <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                        <div className="flex items-center gap-2 mb-3">
                            <Banknote className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-primary">À Vista com {cashOption.discountPercent}% de desconto</span>
                        </div>
                        <div className={cn(
                            "grid gap-4",
                            showVPL ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2 md:grid-cols-4"
                        )}>
                            <div>
                                <p className="text-xs text-muted-foreground">Valor Original</p>
                                <p className="text-sm line-through text-muted-foreground">
                                    {formatCurrency(cashOption.originalValue)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Valor com Desconto</p>
                                <p className="text-lg font-bold text-primary">
                                    {formatCurrency(cashOption.discountedValue)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Economia no Desconto</p>
                                <p className="text-lg font-semibold text-solo-success">
                                    -{formatCurrency(cashOption.discountSavings)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Payback</p>
                                <p className="text-lg font-semibold">
                                    {cashOption.paybackYears.toFixed(1)} anos
                                </p>
                            </div>
                            {showVPL && (
                                <div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        VPL (25 anos)
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-3 w-3" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[200px]">
                                                <p>Valor Presente Líquido: considera o valor do dinheiro no tempo.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </p>
                                    <p className={cn(
                                        "text-lg font-bold",
                                        cashOption.npv >= 0 ? "text-solo-success" : "text-solo-danger"
                                    )}>
                                        {formatCurrency(cashOption.npv)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabela de Financiamentos */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Prazo</TableHead>
                                    <TableHead className="text-right">Taxa a.m.</TableHead>
                                    <TableHead className="text-right">Parcela</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            Juros
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="h-3 w-3" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Total pago - Valor do sistema</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TableHead>
                                    {showVPL && (
                                        <TableHead className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                VPL
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <BarChart3 className="h-3 w-3" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[200px]">
                                                        <p>Valor Presente Líquido em 25 anos.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableHead>
                                    )}
                                    <TableHead className="text-right">Payback</TableHead>
                                    <TableHead className="text-center">Cashflow</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {options.map((option) => {
                                    const config = viabilityConfig[option.viability];
                                    const Icon = config.icon;

                                    return (
                                        <TableRow key={option.installments}>
                                            <TableCell className="font-medium">
                                                {option.installments}x
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {option.estimatedRate.toFixed(2)}%
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(option.installmentValue)}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {formatCurrency(option.totalPaid)}
                                            </TableCell>
                                            <TableCell className="text-right text-solo-danger">
                                                +{formatCurrency(option.totalInterest)}
                                            </TableCell>
                                            {showVPL && (
                                                <TableCell className={cn(
                                                    "text-right font-semibold",
                                                    option.npv >= 0 ? "text-solo-success" : "text-solo-danger"
                                                )}>
                                                    {formatCurrency(option.npv)}
                                                </TableCell>
                                            )}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    {option.paybackYears.toFixed(1)} a
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge className={cn("gap-1", config.color)}>
                                                            <Icon className="h-3 w-3" />
                                                            {option.monthlyCashflow >= 0 ? "+" : ""}{formatCurrency(option.monthlyCashflow)}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{option.viabilityLabel}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Economia ({formatCurrency(monthlyEconomy)}) - Parcela ({formatCurrency(option.installmentValue)})
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </TooltipProvider>

                {/* Legend */}
                <div className="pt-4 border-t flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-solo-success" />
                        <span>Excelente: Sobra &gt; R$100/mês</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-primary" />
                        <span>Bom: Se paga sozinho</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-solo-warning" />
                        <span>Apertado: Pequeno desembolso</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-solo-danger" />
                        <span>Negativo: Alto desembolso</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
