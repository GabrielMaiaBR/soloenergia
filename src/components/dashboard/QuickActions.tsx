import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Calculator,
    UserPlus,
    Kanban,
    MessageSquare,
    Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickAction {
    icon: React.ReactNode;
    label: string;
    description: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "primary" | "success" | "warning";
}

interface QuickActionsProps {
    onNewClient?: () => void;
}

export function QuickActions({ onNewClient }: QuickActionsProps) {
    const navigate = useNavigate();

    const actions: QuickAction[] = [
        {
            icon: <Calculator className="h-6 w-6" />,
            label: "Calculadora Reversa",
            description: "Cliente quer pagar X/mês",
            href: "/calculator",
            variant: "primary",
        },
        {
            icon: <UserPlus className="h-6 w-6" />,
            label: "Novo Cliente",
            description: "Cadastro rápido",
            onClick: onNewClient,
            variant: "default",
        },
        {
            icon: <Kanban className="h-6 w-6" />,
            label: "Ver Pipeline",
            description: "Funil de vendas",
            href: "/pipeline",
            variant: "default",
        },
    ];

    const getVariantClasses = (variant: QuickAction['variant']) => {
        switch (variant) {
            case "primary":
                return "bg-primary/10 hover:bg-primary/20 text-primary border-primary/30";
            case "success":
                return "bg-solo-success/10 hover:bg-solo-success/20 text-solo-success border-solo-success/30";
            case "warning":
                return "bg-solo-warning/10 hover:bg-solo-warning/20 text-solo-warning border-solo-warning/30";
            default:
                return "bg-muted/50 hover:bg-muted text-foreground border-border";
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Ações Rápidas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (action.href) {
                                    navigate(action.href);
                                } else if (action.onClick) {
                                    action.onClick();
                                }
                            }}
                            className={cn(
                                "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-200",
                                "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                                getVariantClasses(action.variant)
                            )}
                        >
                            {action.icon}
                            <div className="text-center">
                                <p className="font-medium text-sm">{action.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {action.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
