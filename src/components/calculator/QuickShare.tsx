import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Share2,
    Copy,
    MessageCircle,
    Check,
    Banknote
} from "lucide-react";
import { formatCurrency } from "@/lib/financial";
import type { ReverseCalcResult } from "@/lib/reverse-calculator";
import { useState } from "react";
import { toast } from "sonner";

interface QuickShareProps {
    result: ReverseCalcResult;
    clientBudget: number;
    whatsappNumber?: string;
}

export function QuickShare({ result, clientBudget, whatsappNumber }: QuickShareProps) {
    const [copied, setCopied] = useState(false);
    const { recommendation, financingOptions, longTermProjection, cashOption } = result;

    // Generate comprehensive summary text
    const generateSummary = () => {
        // Build financing options list (top 3 most viable)
        const topOptions = financingOptions
            .filter(o => o.viability === 'excellent' || o.viability === 'good')
            .slice(0, 3);

        const financingList = topOptions.length > 0
            ? topOptions.map(o =>
                `   • ${o.installments}x: ${formatCurrency(o.installmentValue)}/mês (cashflow: ${o.monthlyCashflow >= 0 ? '+' : ''}${formatCurrency(o.monthlyCashflow)})`
            ).join('\n')
            : financingOptions.slice(0, 3).map(o =>
                `   • ${o.installments}x: ${formatCurrency(o.installmentValue)}/mês`
            ).join('\n');

        return `📊 *ANÁLISE SOLAR PERSONALIZADA*

💰 *Orçamento informado:* ${formatCurrency(clientBudget)}/mês

━━━━━━━━━━━━━━━━━━━━━━

🔋 *SISTEMA RECOMENDADO*
• Potência: ${recommendation.powerKwp} kWp
• Geração estimada: ${recommendation.monthlyGenerationKwh} kWh/mês
• Economia mensal: ~${formatCurrency(recommendation.monthlyEconomy)}

━━━━━━━━━━━━━━━━━━━━━━

💵 *OPÇÃO À VISTA (${cashOption.discountPercent}% desconto)*
• De: ${formatCurrency(cashOption.originalValue)}
• Por: *${formatCurrency(cashOption.discountedValue)}*
• Economia: ${formatCurrency(cashOption.discountSavings)}
• Payback: ${cashOption.paybackYears} anos

━━━━━━━━━━━━━━━━━━━━━━

💳 *OPÇÕES DE FINANCIAMENTO*
${financingList}

━━━━━━━━━━━━━━━━━━━━━━

📈 *PROJEÇÃO 25 ANOS*
• Economia total: *${formatCurrency(longTermProjection.totalSavings25Years)}*
• ROI: ${longTermProjection.roi}%
• Média anual: ${formatCurrency(longTermProjection.averageAnnualSavings)}

━━━━━━━━━━━━━━━━━━━━━━

_Valores estimados considerando reajuste energético de 8% a.a._
_A melhor opção depende do seu perfil e disponibilidade de capital._`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateSummary());
        setCopied(true);
        toast.success("Análise copiada!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        const text = generateSummary();
        const phone = whatsappNumber?.replace(/\D/g, '') || '';
        const url = phone
            ? `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`
            : `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Share2 className="h-4 w-4 text-primary" />
                    Compartilhar Análise
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    Envie um resumo completo para seu WhatsApp pessoal ou copie para outro canal
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="gap-2"
                    >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copiado!" : "Copiar Análise"}
                    </Button>

                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleWhatsApp}
                        className="gap-2 bg-[#25D366] hover:bg-[#128C7E]"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Enviar via WhatsApp
                    </Button>
                </div>

                {/* Preview */}
                <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto scrollbar-solo border">
                    {generateSummary()}
                </div>
            </CardContent>
        </Card>
    );
}
