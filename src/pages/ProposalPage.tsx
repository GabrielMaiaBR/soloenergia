import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Sun,
    Leaf,
    TrendingUp,
    Shield,
    Zap,
    Award,
    Phone,
    Mail,
    Building,
    Download,
    Share2,
    Presentation,
    Calendar,
} from "lucide-react";
import { useClient } from "@/hooks/useClients";
import { useClientSimulations } from "@/hooks/useSimulations";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, calculateRealEconomy, formatPercent } from "@/lib/financial";
import { downloadProposalPDF } from "@/lib/pdf-generator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ProposalPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: client, isLoading: clientLoading } = useClient(id);
    const { data: simulations = [] } = useClientSimulations(id);
    const { data: settings } = useSettings();

    const [selectedSimId, setSelectedSimId] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        if (!client) return;
        setIsDownloading(true);
        try {
            await downloadProposalPDF({
                client,
                simulation,
                settings: settings || undefined,
            });
            toast.success("PDF gerado com sucesso!");
        } catch (error) {
            toast.error("Erro ao gerar PDF");
            console.error(error);
        } finally {
            setIsDownloading(false);
        }
    };

    // Get the selected simulation or the favorite one
    const simulation = selectedSimId
        ? simulations.find((s) => s.id === selectedSimId)
        : simulations.find((s) => s.is_favorite) || simulations[0];

    if (clientLoading || !client) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary/5 to-background">
                <p className="text-muted-foreground">Carregando proposta...</p>
            </div>
        );
    }

    const lei14300Factor = settings?.lei_14300_factor || 0.85;
    const tariff = client.energy_tariff || settings?.default_tariff || 0.85;
    const monthlyGeneration = client.monthly_generation_kwh || 0;
    const monthlyEconomy = calculateRealEconomy(monthlyGeneration, tariff, lei14300Factor);
    const yearlyEconomy = monthlyEconomy * 12;
    const economy25Years = yearlyEconomy * 25;

    const companyName = settings?.company_name || "Solo Energia";
    const companyContact = settings?.contact_phone || "";
    const companyLogo = settings?.logo_url;

    const typeLabels: Record<string, string> = {
        financing: "Financiamento",
        credit_card: "Cartão de Crédito",
        cash: "À Vista",
    };

    // Format payback
    const formatPayback = (months?: number) => {
        if (!months || months === Infinity) return "N/A";
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (years === 0) return `${months} meses`;
        if (remainingMonths === 0) return `${years} anos`;
        return `${years} anos e ${remainingMonths} meses`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-solo-success/5">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/client/${id}`)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>

                    <div className="flex items-center gap-4">
                        {companyLogo ? (
                            <img src={companyLogo} alt={companyName} className="h-8" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Sun className="h-6 w-6 text-primary" />
                                <span className="font-bold text-lg">{companyName}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={isDownloading}>
                            <Download className="h-4 w-4 mr-2" />
                            {isDownloading ? "Gerando..." : "PDF"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/presentation/${id}`)}>
                            <Presentation className="h-4 w-4 mr-2" />
                            Apresentar
                        </Button>
                        <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Compartilhar
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Hero Section */}
                {/* Hero Section */}
                <section className="grid lg:grid-cols-2 gap-12 items-center mb-16 animate-fade-in">
                    <div className="text-left space-y-6">
                        <Badge className="bg-primary/10 text-primary border-none text-base py-1 px-4">
                            Proposta Exclusiva
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                            Olá, <span className="text-primary">{client.name.split(" ")[0]}</span>!
                            <br />
                            <span className="text-foreground/80 text-3xl md:text-5xl">Sua economia começa agora.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                            Analisamos seu consumo e projetamos o sistema ideal para zerar sua conta de luz com o melhor retorno financeiro.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Button size="lg" className="rounded-full px-8 text-lg h-12 shadow-lg shadow-primary/25">
                                Ver Detalhes
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full px-8 text-lg h-12">
                                Falar com Consultor
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-center lg:justify-end relative">
                        {/* Background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 blur-[80px] rounded-full -z-10" />

                        <div className="relative transform hover:scale-105 transition-transform duration-500 w-full max-w-md">
                            <div className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-3xl shadow-2xl text-center">
                                <h3 className="text-lg text-muted-foreground mb-4">Retorno sobre Investimento</h3>
                                <p className="text-lg text-muted-foreground">
                                    Para cada <strong>R$ 1,00</strong> investido, você recebe de volta aproximadamente <strong className="text-solo-success">R$ {((economy25Years / simulation.system_value) || 0).toFixed(2).replace('.', ',')}</strong> ao longo de 25 anos.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Metrics */}
                <section className="grid md:grid-cols-3 gap-6 mb-12">
                    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                        <CardContent className="pt-6 text-center">
                            <Zap className="h-10 w-10 mx-auto mb-3 text-primary" />
                            <p className="text-sm text-muted-foreground mb-1">Sistema Proposto</p>
                            <p className="text-3xl font-bold text-primary">
                                {client.system_power_kwp || "?"} kWp
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                ~{monthlyGeneration} kWh/mês de geração
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-solo-success/10 to-solo-success/5 border-solo-success/20">
                        <CardContent className="pt-6 text-center">
                            <TrendingUp className="h-10 w-10 mx-auto mb-3 text-solo-success" />
                            <p className="text-sm text-muted-foreground mb-1">Economia Mensal</p>
                            <p className="text-3xl font-bold text-solo-success">
                                {formatCurrency(monthlyEconomy)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                {formatCurrency(yearlyEconomy)}/ano
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-solo-warning/10 to-solo-warning/5 border-solo-warning/20">
                        <CardContent className="pt-6 text-center">
                            <Award className="h-10 w-10 mx-auto mb-3 text-solo-warning" />
                            <p className="text-sm text-muted-foreground mb-1">Economia em 25 Anos</p>
                            <p className="text-3xl font-bold text-solo-warning">
                                {formatCurrency(economy25Years)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Sem contar reajuste tarifário
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Simulation Details */}
                {simulation && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-primary" />
                            Condição de Pagamento
                        </h2>

                        {/* Simulation Selector if multiple */}
                        {simulations.length > 1 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {simulations.map((sim) => (
                                    <Button
                                        key={sim.id}
                                        variant={simulation.id === sim.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedSimId(sim.id)}
                                    >
                                        {typeLabels[sim.type]} - {formatCurrency(sim.system_value)}
                                    </Button>
                                ))}
                            </div>
                        )}

                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-muted-foreground">Modalidade</span>
                                            <Badge>{typeLabels[simulation.type]}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-muted-foreground">Valor do Sistema</span>
                                            <span className="font-semibold">{formatCurrency(simulation.system_value)}</span>
                                        </div>
                                        {simulation.entry_value && simulation.entry_value > 0 && (
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="text-muted-foreground">Entrada</span>
                                                <span className="font-semibold">{formatCurrency(simulation.entry_value)}</span>
                                            </div>
                                        )}
                                        {simulation.installments && simulation.installment_value && (
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="text-muted-foreground">Parcelas</span>
                                                <span className="font-semibold">
                                                    {simulation.installments}x de {formatCurrency(simulation.installment_value)}
                                                </span>
                                            </div>
                                        )}
                                        {simulation.detected_monthly_rate !== undefined && simulation.type !== "cash" && (
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="text-muted-foreground">Taxa Mensal</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">
                                                        {formatPercent(simulation.detected_monthly_rate)}
                                                    </span>
                                                    <Badge
                                                        className={cn(
                                                            simulation.rate_semaphore === "excellent" && "bg-solo-success",
                                                            simulation.rate_semaphore === "average" && "bg-solo-warning text-black",
                                                            simulation.rate_semaphore === "expensive" && "bg-solo-danger"
                                                        )}
                                                    >
                                                        {simulation.rate_semaphore === "excellent" && "Excelente"}
                                                        {simulation.rate_semaphore === "average" && "Média"}
                                                        {simulation.rate_semaphore === "expensive" && "Alta"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column - Cashflow Highlight */}
                                    <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-solo-success/10 to-transparent">
                                        <p className="text-sm text-muted-foreground mb-2">Fluxo de Caixa Mensal</p>
                                        <p
                                            className={cn(
                                                "text-4xl font-bold",
                                                (simulation.monthly_cashflow || 0) >= 0 ? "text-solo-success" : "text-solo-danger"
                                            )}
                                        >
                                            {formatCurrency(simulation.monthly_cashflow || 0)}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2 text-center">
                                            {(simulation.monthly_cashflow || 0) >= 0
                                                ? "Você economiza desde o primeiro mês!"
                                                : "Pequeno investimento mensal"}
                                        </p>

                                        <Separator className="my-4 w-full" />

                                        <p className="text-sm text-muted-foreground mb-2">Payback</p>
                                        <p className="text-2xl font-semibold">{formatPayback(simulation.payback_months)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                )}

                {/* Benefits */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        Por que Energia Solar?
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                icon: TrendingUp,
                                title: "Economia",
                                description: "Reduza até 95% da conta de luz",
                            },
                            {
                                icon: Leaf,
                                title: "Sustentável",
                                description: "Energia limpa e renovável",
                            },
                            {
                                icon: Shield,
                                title: "Garantia",
                                description: "25 anos de vida útil",
                            },
                            {
                                icon: Award,
                                title: "Valorização",
                                description: "Imóvel valoriza até 8%",
                            },
                        ].map((benefit, i) => (
                            <Card key={i} className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/10 bg-card/50 backdrop-blur-sm group">
                                <CardContent className="pt-8 pb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                                        <benefit.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="text-center p-8 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                    <h2 className="text-2xl font-bold mb-4">Vamos começar?</h2>
                    <p className="mb-6 opacity-90">
                        Entre em contato para tirar suas dúvidas e fechar o melhor negócio!
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        {companyContact && (
                            <Button variant="secondary" size="lg" className="gap-2">
                                <Phone className="h-4 w-4" />
                                {companyContact}
                            </Button>
                        )}
                        <Button variant="secondary" size="lg" className="gap-2">
                            <Mail className="h-4 w-4" />
                            Solicitar Proposta
                        </Button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 opacity-75">
                        <Building className="h-4 w-4" />
                        <span className="text-sm">{companyName}</span>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t mt-12 py-6">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>
                        Proposta gerada por {companyName} •{" "}
                        {new Date().toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                    <p className="mt-1">
                        Válida por 15 dias • Valores sujeitos a confirmação técnica
                    </p>
                </div>
            </footer>
        </div>
    );
}
