import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    ChevronLeft,
    ChevronRight,
    X,
    Sun,
    Zap,
    TrendingUp,
    Shield,
    Award,
    Leaf,
    Clock,
    Phone,
} from "lucide-react";
import { useClient } from "@/hooks/useClients";
import { useClientSimulations } from "@/hooks/useSimulations";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, calculateRealEconomy, formatPercent } from "@/lib/financial";
import { cn } from "@/lib/utils";

interface Slide {
    id: string;
    type: "intro" | "problem" | "solution" | "numbers" | "benefits" | "cta";
}

const slides: Slide[] = [
    { id: "intro", type: "intro" },
    { id: "problem", type: "problem" },
    { id: "solution", type: "solution" },
    { id: "numbers", type: "numbers" },
    { id: "benefits", type: "benefits" },
    { id: "cta", type: "cta" },
];

export default function PresentationMode() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: client } = useClient(id);
    const { data: simulations = [] } = useClientSimulations(id);
    const { data: settings } = useSettings();

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const simulation = simulations.find((s) => s.is_favorite) || simulations[0];

    const lei14300Factor = settings?.lei_14300_factor || 0.85;
    const tariff = client?.energy_tariff || settings?.default_tariff || 0.85;
    const monthlyGeneration = client?.monthly_generation_kwh || 0;
    const monthlyEconomy = calculateRealEconomy(monthlyGeneration, tariff, lei14300Factor);
    const yearlyEconomy = monthlyEconomy * 12;
    const economy25Years = yearlyEconomy * 25;

    const companyName = settings?.company_name || "Solo Energia";
    const companyLogo = settings?.logo_url;
    const companyContact = settings?.contact_phone || "";

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                nextSlide();
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                prevSlide();
            } else if (e.key === "Escape") {
                navigate(`/client/${id}`);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentSlide, id, navigate]);

    const nextSlide = useCallback(() => {
        if (currentSlide < slides.length - 1 && !isAnimating) {
            setIsAnimating(true);
            setCurrentSlide((prev) => prev + 1);
            setTimeout(() => setIsAnimating(false), 500);
        }
    }, [currentSlide, isAnimating]);

    const prevSlide = useCallback(() => {
        if (currentSlide > 0 && !isAnimating) {
            setIsAnimating(true);
            setCurrentSlide((prev) => prev - 1);
            setTimeout(() => setIsAnimating(false), 500);
        }
    }, [currentSlide, isAnimating]);

    const goToSlide = (index: number) => {
        if (!isAnimating) {
            setIsAnimating(true);
            setCurrentSlide(index);
            setTimeout(() => setIsAnimating(false), 500);
        }
    };

    const progress = ((currentSlide + 1) / slides.length) * 100;

    const formatPayback = (months?: number) => {
        if (!months || months === Infinity) return "N/A";
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (years === 0) return `${months} meses`;
        if (remainingMonths === 0) return `${years} anos`;
        return `${years}a ${remainingMonths}m`;
    };

    if (!client) {
        return (
            <div className="h-screen flex items-center justify-center bg-black text-white">
                <p>Carregando...</p>
            </div>
        );
    }

    const firstName = client.name.split(" ")[0];

    const renderSlide = () => {
        const slide = slides[currentSlide];

        switch (slide.type) {
            case "intro":
                return (
                    <div className="flex flex-col items-center justify-center text-center animate-fade-in">
                        {companyLogo ? (
                            <img src={companyLogo} alt={companyName} className="h-20 mb-8" />
                        ) : (
                            <Sun className="h-20 w-20 text-primary mb-8 animate-pulse" />
                        )}
                        <h1 className="text-6xl font-bold mb-4">
                            Olá, <span className="text-primary">{firstName}</span>!
                        </h1>
                        <p className="text-2xl text-muted-foreground max-w-2xl">
                            Preparamos uma proposta especial de energia solar para você.
                        </p>
                        <div className="mt-12 flex items-center gap-2 text-lg text-muted-foreground">
                            <span>Pressione</span>
                            <kbd className="px-3 py-1 rounded bg-muted text-foreground">→</kbd>
                            <span>para continuar</span>
                        </div>
                    </div>
                );

            case "problem":
                return (
                    <div className="flex flex-col items-center justify-center text-center animate-fade-in">
                        <div className="text-8xl mb-8">😟</div>
                        <h2 className="text-5xl font-bold mb-6">O Problema</h2>
                        <div className="max-w-3xl space-y-6 text-xl">
                            <p className="text-muted-foreground">
                                A conta de luz <span className="text-solo-danger font-semibold">aumenta todo ano</span> (média de 8-10%)
                            </p>
                            <p className="text-muted-foreground">
                                Você está <span className="text-solo-danger font-semibold">pagando aluguel de energia</span> sem nunca ter retorno
                            </p>
                            <p className="text-muted-foreground">
                                Dinheiro que <span className="text-solo-danger font-semibold">poderia ser investido</span> vai para a concessionária
                            </p>
                        </div>
                        <div className="mt-12 p-6 rounded-xl bg-solo-danger/10 border border-solo-danger/30">
                            <p className="text-lg text-muted-foreground">Nos últimos 10 anos, você já pagou aproximadamente</p>
                            <p className="text-4xl font-bold text-solo-danger mt-2">
                                {formatCurrency(monthlyEconomy * 12 * 10)}
                            </p>
                            <p className="text-sm text-muted-foreground">em conta de luz</p>
                        </div>
                    </div>
                );

            case "solution":
                return (
                    <div className="flex flex-col items-center justify-center text-center animate-fade-in">
                        <Sun className="h-24 w-24 text-primary mb-8" />
                        <h2 className="text-5xl font-bold mb-6">A Solução</h2>
                        <p className="text-2xl text-muted-foreground max-w-3xl mb-12">
                            Com <span className="text-primary font-semibold">energia solar</span>, você transforma essa despesa em <span className="text-solo-success font-semibold">investimento</span>.
                        </p>
                        <div className="grid grid-cols-3 gap-8">
                            <div className="p-6 rounded-xl bg-primary/10 border border-primary/30">
                                <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
                                <p className="font-semibold text-xl">{client.system_power_kwp || "?"} kWp</p>
                                <p className="text-sm text-muted-foreground">Sistema Proposto</p>
                            </div>
                            <div className="p-6 rounded-xl bg-solo-success/10 border border-solo-success/30">
                                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-solo-success" />
                                <p className="font-semibold text-xl">{monthlyGeneration} kWh</p>
                                <p className="text-sm text-muted-foreground">Geração/mês</p>
                            </div>
                            <div className="p-6 rounded-xl bg-solo-warning/10 border border-solo-warning/30">
                                <Clock className="h-12 w-12 mx-auto mb-4 text-solo-warning" />
                                <p className="font-semibold text-xl">25+ anos</p>
                                <p className="text-sm text-muted-foreground">Vida Útil</p>
                            </div>
                        </div>
                    </div>
                );

            case "numbers":
                return (
                    <div className="flex flex-col items-center justify-center text-center animate-fade-in">
                        <h2 className="text-5xl font-bold mb-12">Os Números</h2>
                        <div className="grid grid-cols-2 gap-8 max-w-4xl">
                            <div className="p-8 rounded-xl bg-gradient-to-br from-solo-success/20 to-solo-success/5 border border-solo-success/30">
                                <p className="text-lg text-muted-foreground mb-2">Economia Mensal</p>
                                <p className="text-5xl font-bold text-solo-success">{formatCurrency(monthlyEconomy)}</p>
                            </div>
                            <div className="p-8 rounded-xl bg-gradient-to-br from-solo-success/20 to-solo-success/5 border border-solo-success/30">
                                <p className="text-lg text-muted-foreground mb-2">Economia Anual</p>
                                <p className="text-5xl font-bold text-solo-success">{formatCurrency(yearlyEconomy)}</p>
                            </div>
                            {simulation && (
                                <>
                                    <div className="p-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                                        <p className="text-lg text-muted-foreground mb-2">Investimento</p>
                                        <p className="text-4xl font-bold text-primary">{formatCurrency(simulation.system_value)}</p>
                                        {simulation.installments && simulation.installment_value && (
                                            <p className="text-sm text-muted-foreground mt-2">
                                                ou {simulation.installments}x de {formatCurrency(simulation.installment_value)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="p-8 rounded-xl bg-gradient-to-br from-solo-warning/20 to-solo-warning/5 border border-solo-warning/30">
                                        <p className="text-lg text-muted-foreground mb-2">Payback</p>
                                        <p className="text-4xl font-bold text-solo-warning">
                                            {formatPayback(simulation.payback_months)}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Depois, energia praticamente grátis!
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-primary/20 to-solo-success/20 border">
                            <p className="text-lg text-muted-foreground">Economia estimada em 25 anos</p>
                            <p className="text-6xl font-bold bg-gradient-to-r from-primary to-solo-success bg-clip-text text-transparent">
                                {formatCurrency(economy25Years)}
                            </p>
                        </div>
                    </div>
                );

            case "benefits":
                return (
                    <div className="flex flex-col items-center justify-center text-center animate-fade-in">
                        <h2 className="text-5xl font-bold mb-12">Por que Solar?</h2>
                        <div className="grid grid-cols-2 gap-6 max-w-4xl">
                            {[
                                { icon: TrendingUp, title: "Economia Imediata", desc: "Reduza até 95% da conta de luz", color: "text-solo-success" },
                                { icon: Leaf, title: "Sustentabilidade", desc: "Energia 100% limpa e renovável", color: "text-green-500" },
                                { icon: Shield, title: "Garantia", desc: "25 anos de vida útil dos painéis", color: "text-primary" },
                                { icon: Award, title: "Valorização", desc: "Imóvel valoriza até 8%", color: "text-solo-warning" },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-xl bg-muted/30 border flex items-center gap-4 text-left">
                                    <item.icon className={cn("h-12 w-12 shrink-0", item.color)} />
                                    <div>
                                        <p className="font-semibold text-xl">{item.title}</p>
                                        <p className="text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case "cta":
                return (
                    <div className="flex flex-col items-center justify-center text-center animate-fade-in">
                        <div className="text-8xl mb-8">🚀</div>
                        <h2 className="text-5xl font-bold mb-6">Vamos Começar?</h2>
                        <p className="text-2xl text-muted-foreground max-w-2xl mb-12">
                            Não perca mais dinheiro pagando conta de luz. Comece a economizar agora!
                        </p>
                        <div className="flex flex-col items-center gap-4">
                            {companyContact && (
                                <div className="flex items-center gap-3 text-2xl">
                                    <Phone className="h-8 w-8 text-primary" />
                                    <span className="font-semibold">{companyContact}</span>
                                </div>
                            )}
                            <p className="text-xl text-muted-foreground mt-4">{companyName}</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            {/* Progress Bar */}
            <div className="h-1">
                <Progress value={progress} className="h-full rounded-none" />
            </div>

            {/* Close Button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10"
                onClick={() => navigate(`/client/${id}`)}
            >
                <X className="h-6 w-6" />
            </Button>

            {/* Slide Content */}
            <div className="flex-1 flex items-center justify-center px-16">{renderSlide()}</div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-8 py-6">
                {/* Prev Button */}
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="gap-2"
                >
                    <ChevronLeft className="h-5 w-5" />
                    Anterior
                </Button>

                {/* Slide Indicators */}
                <div className="flex items-center gap-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goToSlide(i)}
                            className={cn(
                                "h-2 rounded-full transition-all",
                                i === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground"
                            )}
                        />
                    ))}
                </div>

                {/* Next Button */}
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="gap-2"
                >
                    Próximo
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
