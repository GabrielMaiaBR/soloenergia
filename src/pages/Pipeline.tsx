import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Kanban,
    Search,
    Filter,
    Users,
    AlertTriangle,
    RefreshCw
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useSettings } from "@/hooks/useSettings";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";

export default function Pipeline() {
    const { data: clients = [], isLoading, refetch } = useClients();
    const { data: settings } = useSettings();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterState, setFilterState] = useState<string>("all");
    const [showOnlyAttention, setShowOnlyAttention] = useState(false);

    const followUpDays = settings?.follow_up_days || 7;

    // Filter clients
    const filteredClients = clients.filter(client => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const nameMatch = client.name.toLowerCase().includes(query);
            const cityMatch = client.city?.toLowerCase().includes(query);
            if (!nameMatch && !cityMatch) return false;
        }

        // State filter
        if (filterState !== "all" && client.state_code !== filterState) {
            return false;
        }

        // Attention filter
        if (showOnlyAttention) {
            const daysSinceContact = client.last_contact_date
                ? Math.floor((Date.now() - new Date(client.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))
                : null;
            const needsAttention = client.needs_attention ||
                (daysSinceContact !== null && daysSinceContact >= followUpDays);
            if (!needsAttention) return false;
        }

        return true;
    });

    // Get unique states for filter
    const uniqueStates = [...new Set(clients.map(c => c.state_code).filter(Boolean))].sort();

    // Count clients needing attention
    const attentionCount = clients.filter(client => {
        const daysSinceContact = client.last_contact_date
            ? Math.floor((Date.now() - new Date(client.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))
            : null;
        return client.needs_attention || (daysSinceContact !== null && daysSinceContact >= followUpDays);
    }).length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Carregando pipeline...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <Kanban className="h-6 w-6 text-primary" />
                        Pipeline de Vendas
                    </h1>
                    <p className="text-muted-foreground">
                        Acompanhe seus clientes em cada etapa do funil
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {filteredClients.length} cliente{filteredClients.length !== 1 && 's'}
                    </Badge>
                    {attentionCount > 0 && (
                        <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {attentionCount} precisam de atenção
                        </Badge>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar cliente..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={filterState} onValueChange={setFilterState}>
                    <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {uniqueStates.map(state => (
                            <SelectItem key={state} value={state!}>{state}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant={showOnlyAttention ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOnlyAttention(!showOnlyAttention)}
                    className="gap-2"
                >
                    <AlertTriangle className="h-4 w-4" />
                    Precisam Atenção
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetch()}
                    className="gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Atualizar
                </Button>
            </div>

            {/* Kanban Board */}
            <KanbanBoard
                clients={filteredClients}
                followUpDays={followUpDays}
            />
        </div>
    );
}
