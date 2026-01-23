import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    Lightbulb,
    MessageSquare,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { formatCurrency } from "@/lib/financial";
import type { ReverseCalcResult } from "@/lib/reverse-calculator";
import { cn } from "@/lib/utils";

interface SalesInsightsProps {
    result: ReverseCalcResult;
    clientBudget: number;
}

interface InsightItem {
    title: string;
    script: string;
    context: string;
}

export function SalesInsights({ result, clientBudget }: SalesInsightsProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { recommendation, longTermProjection, financingOptions } = result;

    // Calculate relevant values
    const paybackYears = financingOptions[Math.floor(financingOptions.length / 2)]?.paybackYears || 5;

    const insights: InsightItem[] = [
        {
            title: "Início da Conversa",
            context: "Quando ainda está entendendo o cliente",
            script: `"Você já pensou em quanto da sua renda vai para energia elétrica ao longo dos anos? Muita gente não para pra calcular, mas é um valor significativo."`,
        },
        {
            title: "Apresentando a Solução",
            context: "Ao mostrar os números",
            script: `"Com um sistema de ${recommendation.powerKwp} kWp, você geraria em média ${recommendation.monthlyGenerationKwh} kWh por mês. Isso representa uma economia real que você pode usar como preferir."`,
        },
        {
            title: "Sobre o Investimento",
            context: "Quando falar de valores",
            script: `"O investimento inicial é de aproximadamente ${formatCurrency(recommendation.estimatedSystemValue)}. O retorno vem ao longo do tempo - em média, sistemas assim se pagam em ${paybackYears.toFixed(1)} anos e continuam gerando por mais 20+."`,
        },
        {
            title: "Comparativo Natural",
            context: "Para contextualizar o valor",
            script: `"Pense assim: ${formatCurrency(clientBudget)} por mês é menos do que muitas famílias gastam com outros serviços. A diferença é que aqui você está construindo um patrimônio."`,
        },
        {
            title: "Respondendo Dúvidas",
            context: "Quando o cliente hesitar",
            script: `"É natural querer pensar bem. Posso te mandar um resumo por WhatsApp pra você analisar com calma? Assim você tem todos os números em mãos."`,
        },
        {
            title: "Próximo Passo",
            context: "Para avançar a conversa",
            script: `"O próximo passo seria uma visita técnica pra confirmar as condições do telhado e fechar o dimensionamento. Sem compromisso - é só pra ter os dados precisos."`,
        },
    ];

    return (
        <Card>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="pb-3">
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-between p-0 h-auto hover:bg-transparent"
                        >
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Lightbulb className="h-4 w-4 text-solo-warning" />
                                Sugestões de Abordagem
                            </CardTitle>
                            {isOpen ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Button>
                    </CollapsibleTrigger>
                    <p className="text-xs text-muted-foreground mt-1">
                        Clique para ver sugestões de como abordar o cliente
                    </p>
                </CardHeader>

                <CollapsibleContent>
                    <CardContent className="space-y-3 pt-0">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className="p-3 rounded-lg bg-muted/50 border border-border/50"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium text-sm">{insight.title}</span>
                                    <Badge variant="outline" className="text-xs ml-auto">
                                        {insight.context}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground italic">
                                    {insight.script}
                                </p>
                            </div>
                        ))}

                        {/* Quick Stats */}
                        <div className="mt-4 pt-3 border-t">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                📊 Dados úteis para a conversa:
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <Badge variant="secondary">{recommendation.powerKwp} kWp</Badge>
                                <Badge variant="secondary">{recommendation.monthlyGenerationKwh} kWh/mês</Badge>
                                <Badge variant="secondary">~{paybackYears.toFixed(1)} anos payback</Badge>
                                <Badge variant="secondary">{longTermProjection.roi}% ROI 25 anos</Badge>
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
