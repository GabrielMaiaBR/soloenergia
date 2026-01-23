import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Zap,
    DollarSign,
    Calendar,
    Phone,
    AlertTriangle,
    Eye,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    GripVertical
} from "lucide-react";
import { formatCurrency } from "@/lib/financial";
import { cn } from "@/lib/utils";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import type { Client } from "@/types";
import { useNavigate } from "react-router-dom";
import { openWhatsApp, generateFollowUpMessage } from "@/lib/whatsapp";

interface KanbanCardProps {
    client: Client;
    isDragging?: boolean;
    needsAttention?: boolean;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

export function KanbanCard({
    client,
    isDragging,
    needsAttention,
    onDragStart,
    onDragEnd
}: KanbanCardProps) {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate days since last contact
    const daysSinceContact = client.last_contact_date
        ? Math.floor((Date.now() - new Date(client.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    // Calculate rough monthly economy
    const roughEconomy = (client.monthly_generation_kwh || 0) * (client.energy_tariff || 0.85) * 0.85;
    const systemValue = (client.system_power_kwp || 0) * 4500;

    // Drag handlers
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', client.id);
        onDragStart?.();
    };

    const handleDragEnd = () => {
        onDragEnd?.();
    };

    return (
        <Card
            className={cn(
                "transition-all duration-200 cursor-grab active:cursor-grabbing",
                isDragging && "opacity-50 rotate-2 scale-95 shadow-2xl ring-2 ring-primary",
                needsAttention && !isDragging && "ring-2 ring-solo-danger border-solo-danger/50 bg-solo-danger/5",
                !isDragging && "hover:shadow-lg hover:-translate-y-0.5"
            )}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <CardContent className="p-3 space-y-2">
                {/* Header com Avatar e Grip */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0 cursor-grab" />
                        <AvatarInitials name={client.name} size="md" />
                        <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{client.name}</p>
                            {client.city && (
                                <p className="text-xs text-muted-foreground truncate">
                                    📍 {client.city}{client.state_code && `, ${client.state_code}`}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {needsAttention && (
                            <AlertTriangle className="h-4 w-4 text-solo-danger animate-pulse" />
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Metrics (sempre visíveis) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {client.system_power_kwp && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Zap className="h-3 w-3 text-solo-warning" />
                            <span className="font-medium">{client.system_power_kwp} kWp</span>
                        </div>
                    )}
                    {roughEconomy > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-3 w-3 text-solo-success" />
                            <span className="font-medium">{formatCurrency(roughEconomy)}/mês</span>
                        </div>
                    )}
                </div>

                {/* Área expandida */}
                {isExpanded && (
                    <div className="pt-2 border-t space-y-3 animate-in slide-in-from-top-2 duration-200">
                        {/* Detalhes adicionais */}
                        <div className="space-y-1 text-xs">
                            {client.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    <span>{client.phone}</span>
                                </div>
                            )}
                            {systemValue > 0 && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <DollarSign className="h-3 w-3" />
                                    <span>Valor estimado: {formatCurrency(systemValue)}</span>
                                </div>
                            )}
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-7 text-xs"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/client/${client.id}`);
                                }}
                            >
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                            </Button>
                            {client.phone && (
                                <Button
                                    size="sm"
                                    variant="default"
                                    className="flex-1 h-7 text-xs bg-[#25D366] hover:bg-[#128C7E]"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const message = generateFollowUpMessage({
                                            clientName: client.name,
                                            daysSinceContact: daysSinceContact || 0,
                                        });
                                        openWhatsApp(client.phone, message);
                                    }}
                                >
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    WhatsApp
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer com badge de dias */}
                <div className="flex items-center justify-between pt-1">
                    {daysSinceContact !== null && (
                        <Badge
                            variant={daysSinceContact > 7 ? "destructive" : daysSinceContact > 3 ? "outline" : "secondary"}
                            className="text-xs"
                        >
                            <Calendar className="h-3 w-3 mr-1" />
                            {daysSinceContact === 0 ? "Hoje" : `${daysSinceContact}d atrás`}
                        </Badge>
                    )}
                    {!isExpanded && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs ml-auto"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/client/${client.id}`);
                            }}
                        >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
