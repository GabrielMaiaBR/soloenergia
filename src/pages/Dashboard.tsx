import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, FileSearch, Star, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { useState } from "react";

// Temporary mock data until database is connected
const mockClients = [
  {
    id: "1",
    name: "João Silva",
    phone: "(11) 99999-1234",
    status: "analysis" as const,
    system_power_kwp: 8.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Maria Santos",
    phone: "(11) 98888-5678",
    status: "lead" as const,
    system_power_kwp: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    cpf: "123.456.789-00",
    status: "closed" as const,
    system_power_kwp: 5.2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const kpis = [
  { label: "Total de Clientes", value: 3, icon: Users, color: "text-primary" },
  { label: "Em Análise", value: 1, icon: FileSearch, color: "text-solo-warning" },
  { label: "Favoritas", value: 2, icon: Star, color: "text-solo-success" },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = mockClients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.phone?.includes(query) ||
      client.cpf?.includes(query)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Visão estratégica do seu negócio solar</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
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
        {filteredClients.length === 0 ? (
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
    </div>
  );
}

// Helper function imported inline to avoid circular deps
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
