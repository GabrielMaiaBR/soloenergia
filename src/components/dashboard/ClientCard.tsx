import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, User, Zap, AlertTriangle, Calendar } from "lucide-react";
import type { Client, ClientStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";
import { useMemo } from "react";

interface ClientCardProps {
  client: Client;
}

const statusConfig: Record<ClientStatus, { label: string; className: string }> = {
  lead: { label: "Lead", className: "bg-status-lead/20 text-status-lead border-status-lead/30" },
  analysis: { label: "Em Análise", className: "bg-status-analysis/20 text-status-analysis border-status-analysis/30" },
  closed: { label: "Fechado", className: "bg-status-closed/20 text-status-closed border-status-closed/30" },
  lost: { label: "Perdido", className: "bg-status-lost/20 text-status-lost border-status-lost/30" },
};

export function ClientCard({ client }: ClientCardProps) {
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const status = statusConfig[client.status];

  const followUpDays = settings?.follow_up_days || 7;

  // Calculate if client needs attention
  const { needsAttention, daysSinceContact } = useMemo(() => {
    const days = client.last_contact_date
      ? Math.floor((Date.now() - new Date(client.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const attention = client.needs_attention || (days !== null && days >= followUpDays);

    return { needsAttention: attention, daysSinceContact: days };
  }, [client.last_contact_date, client.needs_attention, followUpDays]);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-solo hover:shadow-lg hover:border-primary/50",
        needsAttention && "ring-2 ring-solo-danger border-solo-danger/50"
      )}
      onClick={() => navigate(`/client/${client.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              needsAttention ? "bg-solo-danger/10" : "bg-primary/10"
            )}>
              {needsAttention ? (
                <AlertTriangle className="h-5 w-5 text-solo-danger" />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{client.name}</h3>
              {client.phone && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {client.phone}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
            {daysSinceContact !== null && (
              <Badge
                variant={needsAttention ? "destructive" : "secondary"}
                className="text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                {daysSinceContact === 0 ? "Hoje" : `${daysSinceContact}d atrás`}
              </Badge>
            )}
          </div>
        </div>

        {client.system_power_kwp && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-solo-warning" />
            <span className="text-muted-foreground">Sistema:</span>
            <span className="font-medium">{client.system_power_kwp} kWp</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
