import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import CountUp from "react-countup";

interface SparklineData {
    value: number;
}

interface KPICardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    iconColor?: string;
    prefix?: string;
    suffix?: string;
    sparklineData?: SparklineData[];
    trend?: {
        value: number;
        isPositive: boolean;
    };
    onClick?: () => void;
}

function MiniSparkline({ data }: { data: SparklineData[] }) {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min || 1;

    const height = 40;
    const width = 100;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-10"
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Area fill */}
            <polygon
                points={`0,${height} ${points} ${width},${height}`}
                fill="url(#sparklineGradient)"
            />
            {/* Line */}
            <polyline
                points={points}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function KPICard({
    label,
    value,
    icon: Icon,
    iconColor = "text-primary",
    prefix = "",
    suffix = "",
    sparklineData,
    trend,
    onClick,
}: KPICardProps) {
    return (
        <Card
            className={cn(
                "transition-all duration-300 hover:shadow-lg",
                onClick && "cursor-pointer hover:border-primary/50"
            )}
            onClick={onClick}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                </CardTitle>
                <Icon className={cn("h-5 w-5", iconColor)} />
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                        {prefix}
                        <CountUp
                            end={value}
                            duration={1.5}
                            separator="."
                            decimal=","
                            preserveValue
                        />
                        {suffix}
                    </span>
                    {trend && (
                        <span className={cn(
                            "text-xs font-medium flex items-center",
                            trend.isPositive ? "text-solo-success" : "text-solo-danger"
                        )}>
                            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                        </span>
                    )}
                </div>

                {sparklineData && sparklineData.length > 0 && (
                    <MiniSparkline data={sparklineData} />
                )}
            </CardContent>
        </Card>
    );
}
