import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Users, FileSearch, Star, Search, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { KPICard } from "@/components/dashboard/KPICard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SalesFunnel } from "@/components/charts/SalesFunnel";
import { SkeletonKPI, SkeletonClientCard } from "@/components/ui/skeleton-card";
import { useState, useMemo } from "react";
import { useClients } from "@/hooks/useClients";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { useSettings } from "@/hooks/useSettings";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showClientForm, setShowClientForm] = useState(false);

  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs();
  const { data: settings } = useSettings();

  const followUpDays = settings?.follow_up_days || 7;

  // Count clients needing attention
  const attentionCount = useMemo(() => {
    return clients.filter(client => {
      const daysSinceContact = client.last_contact_date
        ? Math.floor((Date.now() - new Date(client.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      return client.needs_attention || (daysSinceContact !== null && daysSinceContact >= followUpDays);
    }).length;
  }, [clients, followUpDays]);

  // Count clients by status for funnel
  const funnelData = useMemo(() => {
    const counts = { leads: 0, analysis: 0, proposal: 0, negotiation: 0, closed: 0 };
    clients.forEach(client => {
      switch (client.status) {
        case 'lead': counts.leads++; break;
        case 'analysis': counts.analysis++; break;
        case 'closed': counts.closed++; break;
        case 'lost': break; // Não conta no funil
        default: counts.proposal++;
      }
    });
    // Se não tem clientes suficientes, usa dados de exemplo
    if (clients.length < 3) {
      return { leads: 12, analysis: 8, proposal: 5, negotiation: 3, closed: 2 };
    }
    return counts;
  }, [clients]);

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.phone?.includes(query) ||
      client.cpf?.includes(query)
    );
  });

  // Sort clients: attention first, then by last contact
  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      // Clients needing attention first
      const aNeedsAttention = a.needs_attention || false;
      const bNeedsAttention = b.needs_attention || false;
      if (aNeedsAttention && !bNeedsAttention) return -1;
      if (!aNeedsAttention && bNeedsAttention) return 1;

      // Then by last contact (most recent first)
      const aDate = a.last_contact_date ? new Date(a.last_contact_date).getTime() : 0;
      const bDate = b.last_contact_date ? new Date(b.last_contact_date).getTime() : 0;
      return bDate - aDate;
    });
  }, [filteredClients]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Visão estratégica do seu negócio solar</p>
        </div>
        <Button className="gap-2" onClick={() => setShowClientForm(true)}>
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* KPIs with Sparklines */}
      {kpisLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <SkeletonKPI key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <KPICard
            label="Total de Clientes"
            value={kpis?.total_clients || 0}
            icon={Users}
            iconColor="text-primary"
            sparklineData={[
              { value: 5 }, { value: 7 }, { value: 6 }, { value: 9 },
              { value: 8 }, { value: 12 }, { value: kpis?.total_clients || 15 }
            ]}
            trend={{ value: 15, isPositive: true }}
          />
          <KPICard
            label="Em Análise"
            value={kpis?.proposals_in_analysis || 0}
            icon={FileSearch}
            iconColor="text-solo-warning"
            sparklineData={[
              { value: 2 }, { value: 3 }, { value: 2 }, { value: 4 },
              { value: 3 }, { value: 5 }, { value: kpis?.proposals_in_analysis || 4 }
            ]}
          />
          <KPICard
            label="Precisam Atenção"
            value={attentionCount}
            icon={AlertTriangle}
            iconColor="text-solo-danger"
            onClick={() => window.location.href = '/pipeline'}
          />
          <KPICard
            label="Favoritas"
            value={kpis?.favorite_simulations || 0}
            icon={Star}
            iconColor="text-solo-success"
          />
        </div>
      )}

      {/* Quick Actions + Funnel */}
      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions onNewClient={() => setShowClientForm(true)} />
        <SalesFunnel data={funnelData} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CPF ou telefone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Client List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Clientes</h2>
          <span className="text-sm text-muted-foreground">
            {sortedClients.length} cliente{sortedClients.length !== 1 && 's'}
          </span>
        </div>

        {clientsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonClientCard key={i} />)}
          </div>
        ) : sortedClients.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>

      {/* Client Form Dialog */}
      <ClientFormDialog open={showClientForm} onOpenChange={setShowClientForm} />
    </div>
  );
}
