import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, FileSearch, Star, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { useState } from "react";
import { useClients } from "@/hooks/useClients";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showClientForm, setShowClientForm] = useState(false);

  const { data: clients = [], isLoading } = useClients();
  const { data: kpis } = useDashboardKPIs();

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.phone?.includes(query) ||
      client.cpf?.includes(query)
    );
  });

  const kpiData = [
    { label: "Total de Clientes", value: kpis?.total_clients || 0, icon: Users, color: "text-primary" },
    { label: "Em Análise", value: kpis?.proposals_in_analysis || 0, icon: FileSearch, color: "text-solo-warning" },
    { label: "Favoritas", value: kpis?.favorite_simulations || 0, icon: Star, color: "text-solo-success" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
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

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpiData.map((kpi) => (
          <Card key={kpi.label} className="transition-solo hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <kpi.icon className={cn("h-5 w-5", kpi.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
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
        <h2 className="text-lg font-medium">Clientes</h2>
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </Card>
        ) : filteredClients.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
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
