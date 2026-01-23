import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/financial";

interface EnergyBillProjectionProps {
    currentMonthlyBill: number;
    tariffIncreaseRate?: number;
    years?: number;
}

interface ProjectionData {
    year: number;
    label: string;
    monthlyBill: number;
    annualBill: number;
    accumulated: number;
}

export function EnergyBillProjection({
    currentMonthlyBill,
    tariffIncreaseRate = 8,
    years = 25,
}: EnergyBillProjectionProps) {
    const data = useMemo(() => {
        const projection: ProjectionData[] = [];
        let accumulated = 0;
        let currentBill = currentMonthlyBill;

        for (let year = 0; year <= years; year++) {
            const annualBill = currentBill * 12;
            accumulated += year > 0 ? annualBill : 0;

            projection.push({
                year,
                label: `Ano ${year}`,
                monthlyBill: Math.round(currentBill),
                annualBill: Math.round(annualBill),
                accumulated: Math.round(accumulated),
            });

            currentBill *= (1 + tariffIncreaseRate / 100);
        }

        return projection;
    }, [currentMonthlyBill, tariffIncreaseRate, years]);

    const totalOver25Years = data[years]?.accumulated || 0;
    const finalMonthlyBill = data[years]?.monthlyBill || 0;

    return (
        <Card className="border-solo-danger/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-solo-danger" />
                    Projeção da Conta de Luz SEM Solar
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Quanto o cliente vai pagar de luz nos próximos {years} anos?
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Shocking Number */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-solo-danger/10 to-solo-danger/5 border border-solo-danger/30 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                        Total gasto com energia em {years} anos
                    </p>
                    <div className="text-4xl md:text-5xl font-bold text-solo-danger">
                        {formatCurrency(totalOver25Years)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        (considerando reajuste de {tariffIncreaseRate}% ao ano)
                    </p>
                </div>

                {/* Comparison Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <Zap className="h-5 w-5 text-solo-danger mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Conta hoje</p>
                        <p className="text-xl font-bold">{formatCurrency(currentMonthlyBill)}/mês</p>
                    </div>
                    <div className="p-4 rounded-lg bg-solo-danger/10 border border-solo-danger/20 text-center">
                        <TrendingUp className="h-5 w-5 text-solo-danger mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Conta em {years} anos</p>
                        <p className="text-xl font-bold text-solo-danger">{formatCurrency(finalMonthlyBill)}/mês</p>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAccumulated" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--solo-danger))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--solo-danger))" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                interval={4}
                            />
                            <YAxis
                                tickFormatter={(value) =>
                                    new Intl.NumberFormat("pt-BR", {
                                        notation: "compact",
                                        compactDisplay: "short",
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(value)
                                }
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                formatter={(value: number) => [formatCurrency(value), "Acumulado"]}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="accumulated"
                                stroke="hsl(var(--solo-danger))"
                                strokeWidth={2}
                                fill="url(#colorAccumulated)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Call to Action */}
                <div className="p-4 rounded-lg bg-solo-success/10 border border-solo-success/20">
                    <p className="text-sm text-center">
                        <strong className="text-solo-success">Com energia solar</strong>, você troca essa despesa crescente
                        por um investimento que se paga e gera economia por {years}+ anos.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
