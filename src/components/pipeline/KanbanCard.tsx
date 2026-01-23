import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User,
    Zap,
    DollarSign,
    Calendar,
    Phone,
    AlertTriangle,
    Eye
} from "lucide-react";
import { formatCurrency } from "@/lib/financial";
import { cn } from "@/lib/utils";
import type { Client } from "@/types";
import { useNavigate } from "react-router-dom";

interface KanbanCardProps {
    client: Client;
    isDragging?: boolean;
    needsAttention?: boolean;
}

export function KanbanCard({ client, isDragging, needsAttention }: KanbanCardProps) {
    const navigate = useNavigate();

    // Calculate days since last contact
    const daysSinceContact = client.last_contact_date
        ? Math.floor((Date.now() - new Date(client.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    // Calculate rough monthly economy
    const roughEconomy = (client.monthly_generation_kwh || 0) * (client.energy_tariff || 0.85) * 0.85;

    return (
        <Card
            className={cn(
                "cursor-grab active:cursor-grabbing transition-all",
                isDragging && "shadow-lg ring-2 ring-primary rotate-2 opacity-90",
                needsAttention && "ring-2 ring-solo-danger"
            )}
        >
            <CardContent className="p-3 space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{client.name}</p>
                            {client.city && (
                                <p className="text-xs text-muted-foreground truncate">
                                    {client.city}{client.state_code && `, ${client.state_code}`}
                                </p>
                            )}
                        </div>
                    </div>
                    {needsAttention && (
                        <AlertTriangle className="h-4 w-4 text-solo-danger shrink-0" />
                    )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {client.system_power_kwp && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Zap className="h-3 w-3 text-solo-warning" />
                            <span>{client.system_power_kwp} kWp</span>
                        </div>
                    )}
                    {roughEconomy > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-3 w-3 text-solo-success" />
                            <span>{formatCurrency(roughEconomy)}/mês</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                        {daysSinceContact !== null && (
                            <Badge
                                variant={daysSinceContact > 7 ? "destructive" : "secondary"}
                                className="text-xs"
                            >
                                <Calendar className="h-3 w-3 mr-1" />
                                {daysSinceContact === 0 ? "Hoje" : `${daysSinceContact}d`}
                            </Badge>
                        )}
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/client/${client.id}`);
                        }}
                    >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
