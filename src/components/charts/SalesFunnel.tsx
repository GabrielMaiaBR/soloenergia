import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import CountUp from "react-countup";

interface SalesFunnelProps {
    data: {
        leads: number;
        analysis: number;
        proposal: number;
        negotiation: number;
        closed: number;
    };
}

interface FunnelStage {
    label: string;
    key: keyof SalesFunnelProps['data'];
    color: string;
    bgColor: string;
}

const stages: FunnelStage[] = [
    { label: "Leads", key: "leads", color: "text-slate-400", bgColor: "bg-slate-500" },
    { label: "Análise", key: "analysis", color: "text-blue-400", bgColor: "bg-blue-500" },
    { label: "Proposta", key: "proposal", color: "text-purple-400", bgColor: "bg-purple-500" },
    { label: "Negociação", key: "negotiation", color: "text-orange-400", bgColor: "bg-orange-500" },
    { label: "Fechados", key: "closed", color: "text-green-400", bgColor: "bg-green-500" },
];

export function SalesFunnel({ data }: SalesFunnelProps) {
    const total = data.leads || 1;

    // Calcula taxa de conversão entre etapas
    const getConversionRate = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return Math.round((current / previous) * 100);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-primary" />
                    Funil de Vendas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {stages.map((stage, index) => {
                    const value = data[stage.key];
                    const percentage = (value / total) * 100;
                    const previousValue = index > 0 ? data[stages[index - 1].key] : value;
                    const conversionRate = index > 0 ? getConversionRate(value, previousValue) : 100;

                    return (
                        <div key={stage.key} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-3 h-3 rounded-full", stage.bgColor)} />
                                    <span className="font-medium">{stage.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn("font-bold", stage.color)}>
                                        <CountUp end={value} duration={1} preserveValue />
                                    </span>
                                    {index > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            ({conversionRate}%)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Funnel bar */}
                            <div className="relative h-8 flex justify-center">
                                <div
                                    className={cn(
                                        "h-full rounded-md transition-all duration-500",
                                        stage.bgColor
                                    )}
                                    style={{
                                        width: `${Math.max(percentage, 10)}%`,
                                        opacity: 0.7 + (0.3 * (1 - index / stages.length))
                                    }}
                                />
                            </div>

                            {/* Conversion arrow */}
                            {index < stages.length - 1 && (
                                <div className="flex justify-center py-1">
                                    <svg
                                        width="20"
                                        height="12"
                                        viewBox="0 0 20 12"
                                        className="text-muted-foreground/50"
                                    >
                                        <path
                                            d="M10 12L0 0H20L10 12Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Conversion summary */}
                <div className="pt-3 border-t mt-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxa de conversão total</span>
                        <span className="font-bold text-solo-success">
                            {getConversionRate(data.closed, data.leads)}%
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
