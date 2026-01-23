import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface PaybackGaugeProps {
    years: number;
    months?: number;
    maxYears?: number;
}

export function PaybackGauge({ years, months = 0, maxYears = 10 }: PaybackGaugeProps) {
    const [animatedAngle, setAnimatedAngle] = useState(0);

    const totalMonths = years * 12 + months;
    const maxMonths = maxYears * 12;
    const percentage = Math.min(totalMonths / maxMonths, 1);

    // Ângulo vai de -90 (esquerda) a 90 (direita)
    const targetAngle = -90 + (percentage * 180);

    // Determina a cor baseado no payback
    const getColor = () => {
        if (years <= 4) return "text-solo-success";
        if (years <= 6) return "text-solo-warning";
        return "text-solo-danger";
    };

    const getBgColor = () => {
        if (years <= 4) return "from-solo-success/20 to-transparent";
        if (years <= 6) return "from-solo-warning/20 to-transparent";
        return "from-solo-danger/20 to-transparent";
    };

    const getIcon = () => {
        if (years <= 4) return <CheckCircle2 className="h-5 w-5 text-solo-success" />;
        if (years <= 6) return <Clock className="h-5 w-5 text-solo-warning" />;
        return <AlertTriangle className="h-5 w-5 text-solo-danger" />;
    };

    const getMessage = () => {
        if (years <= 4) return "Excelente retorno!";
        if (years <= 6) return "Bom retorno";
        return "Retorno longo";
    };

    // Animação do ponteiro
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedAngle(targetAngle);
        }, 100);
        return () => clearTimeout(timer);
    }, [targetAngle]);

    const displayText = months > 0
        ? `${years}a ${months}m`
        : `${years} anos`;

    return (
        <Card className={cn("overflow-hidden bg-gradient-to-br", getBgColor())}>
            <CardHeader className="pb-0">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Tempo de Retorno (Payback)
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="relative w-full h-[160px] flex flex-col items-center">
                    {/* Gauge SVG */}
                    <svg viewBox="0 0 200 120" className="w-full max-w-[280px]">
                        {/* Background arc */}
                        <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--solo-success))" />
                                <stop offset="50%" stopColor="hsl(var(--solo-warning))" />
                                <stop offset="100%" stopColor="hsl(var(--solo-danger))" />
                            </linearGradient>
                        </defs>

                        {/* Track background */}
                        <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="12"
                            strokeLinecap="round"
                        />

                        {/* Colored arc */}
                        <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeOpacity="0.8"
                        />

                        {/* Tick marks */}
                        {[0, 2, 4, 6, 8, 10].map((year, i) => {
                            const angle = -90 + (year / maxYears) * 180;
                            const radian = (angle * Math.PI) / 180;
                            const x1 = 100 + 70 * Math.cos(radian);
                            const y1 = 100 + 70 * Math.sin(radian);
                            const x2 = 100 + 80 * Math.cos(radian);
                            const y2 = 100 + 80 * Math.sin(radian);
                            const labelX = 100 + 58 * Math.cos(radian);
                            const labelY = 100 + 58 * Math.sin(radian);

                            return (
                                <g key={year}>
                                    <line
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke="hsl(var(--muted-foreground))"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x={labelX}
                                        y={labelY}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="10"
                                        fill="hsl(var(--muted-foreground))"
                                    >
                                        {year}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Needle */}
                        <g
                            style={{
                                transform: `rotate(${animatedAngle}deg)`,
                                transformOrigin: "100px 100px",
                                transition: "transform 1s ease-out",
                            }}
                        >
                            <line
                                x1="100"
                                y1="100"
                                x2="100"
                                y2="35"
                                stroke="hsl(var(--foreground))"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            <circle cx="100" cy="100" r="8" fill="hsl(var(--foreground))" />
                            <circle cx="100" cy="100" r="4" fill="hsl(var(--primary))" />
                        </g>
                    </svg>

                    {/* Center value */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
                        <div className={cn("text-3xl font-bold", getColor())}>
                            {displayText}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                            {getIcon()}
                            <span>{getMessage()}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
