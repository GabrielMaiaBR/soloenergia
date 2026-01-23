import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ROIRadialProps {
    roi: number;
    maxROI?: number;
    label?: string;
}

export function ROIRadial({ roi, maxROI = 500, label = "Retorno sobre Investimento" }: ROIRadialProps) {
    const [animatedRoi, setAnimatedRoi] = useState(0);

    const percentage = Math.min((roi / maxROI) * 100, 100);

    // Animação do valor
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedRoi(roi);
        }, 100);
        return () => clearTimeout(timer);
    }, [roi]);

    // Calcula o stroke-dasharray para criar o efeito de preenchimento
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Determina a cor baseado no ROI
    const getColor = () => {
        if (roi >= 400) return { stroke: "hsl(var(--solo-success))", text: "text-solo-success" };
        if (roi >= 200) return { stroke: "hsl(var(--primary))", text: "text-primary" };
        if (roi >= 100) return { stroke: "hsl(var(--solo-warning))", text: "text-solo-warning" };
        return { stroke: "hsl(var(--solo-danger))", text: "text-solo-danger" };
    };

    const colors = getColor();

    return (
        <Card>
            <CardHeader className="pb-0">
                <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="relative w-full flex flex-col items-center">
                    {/* SVG Radial */}
                    <svg viewBox="0 0 200 200" className="w-full max-w-[200px]">
                        <defs>
                            <linearGradient id="roiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors.stroke} stopOpacity="1" />
                                <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.6" />
                            </linearGradient>
                        </defs>

                        {/* Background circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="12"
                        />

                        {/* Progress circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="url(#roiGradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 100 100)"
                            style={{
                                transition: "stroke-dashoffset 1.5s ease-out",
                            }}
                        />

                        {/* Center text */}
                        <text
                            x="100"
                            y="90"
                            textAnchor="middle"
                            className={cn("fill-current text-4xl font-bold", colors.text)}
                            style={{ fontSize: "32px" }}
                        >
                            {Math.round(animatedRoi)}%
                        </text>
                        <text
                            x="100"
                            y="115"
                            textAnchor="middle"
                            className="fill-muted-foreground"
                            style={{ fontSize: "12px" }}
                        >
                            ROI
                        </text>
                    </svg>

                    {/* Description */}
                    <div className="text-center mt-4">
                        <p className={cn("text-lg font-semibold", colors.text)}>
                            {roi >= 400 && "Excelente investimento!"}
                            {roi >= 200 && roi < 400 && "Ótimo retorno"}
                            {roi >= 100 && roi < 200 && "Bom retorno"}
                            {roi < 100 && "Retorno moderado"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Para cada R$ 1 investido, você ganha R$ {(roi / 100).toFixed(2)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
