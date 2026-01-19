import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, User, Zap } from "lucide-react";
import type { Client, ClientStatus } from "@/types";

interface ClientCardProps {
  client: Pick<Client, "id" | "name" | "phone" | "cpf" | "status" | "system_power_kwp">;
}

const statusConfig: Record<ClientStatus, { label: string; className: string }> = {
  lead: { label: "Lead", className: "bg-status-lead/20 text-status-lead border-status-lead/30" },
  analysis: { label: "Em Análise", className: "bg-status-analysis/20 text-status-analysis border-status-analysis/30" },
  closed: { label: "Fechado", className: "bg-status-closed/20 text-status-closed border-status-closed/30" },
  lost: { label: "Perdido", className: "bg-status-lost/20 text-status-lost border-status-lost/30" },
};

export function ClientCard({ client }: ClientCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[client.status];

  return (
    <Card
      className="cursor-pointer transition-solo hover:shadow-lg hover:border-primary/50"
      onClick={() => navigate(`/client/${client.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
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
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
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
