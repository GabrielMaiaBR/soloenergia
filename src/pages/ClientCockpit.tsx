import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, TrendingUp, DollarSign, Star, FileText, Plus, BarChart3, Edit } from "lucide-react";
import { useClient } from "@/hooks/useClients";
import { useClientSimulations } from "@/hooks/useSimulations";
import { useSettings } from "@/hooks/useSettings";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { SimulationModal } from "@/components/simulations/SimulationModal";
import { SimulationCard } from "@/components/simulations/SimulationCard";
import { ScenarioComparator } from "@/components/simulations/ScenarioComparator";
import { TimelineSection } from "@/components/timeline/TimelineSection";
import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { formatCurrency } from "@/lib/financial";

export default function ClientCockpit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: client, isLoading: clientLoading } = useClient(id);
  const { data: simulations = [] } = useClientSimulations(id);
  const { data: settings } = useSettings();

  const [showEditClient, setShowEditClient] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [showComparator, setShowComparator] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedSimulations, setSelectedSimulations] = useState<string[]>([]);

  if (clientLoading || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const lei14300Factor = settings?.lei_14300_factor || 0.85;
  const monthlyEconomy = (client.monthly_generation_kwh || 0) * lei14300Factor * (client.energy_tariff || settings?.default_tariff || 0.85);
  const favoriteSimulations = simulations.filter((s) => s.is_favorite);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <p className="text-muted-foreground">Cockpit do Cliente</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowEditClient(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {/* Project Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="transition-solo">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-solo-warning" />
              Potência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.system_power_kwp || "-"} kWp</div>
          </CardContent>
        </Card>

        <Card className="transition-solo">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Geração Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.monthly_generation_kwh || "-"} kWh</div>
          </CardContent>
        </Card>

        <Card className="transition-solo">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-solo-success" />
              Economia Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-solo-success">
              {formatCurrency(monthlyEconomy)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Com Lei 14.300 ({(lei14300Factor * 100).toFixed(0)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="transition-solo">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tarifa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(client.energy_tariff || settings?.default_tariff || 0.85).toFixed(2)}/kWh
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Benchmark */}
      <Card className="border-dashed border-solo-trust/30 bg-solo-trust/5">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Benchmark:</strong> Se o cliente pagasse à vista, não pagaria juros e o payback seria mais rápido.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button className="gap-2 h-auto py-4 flex-col" onClick={() => setShowSimulationModal(true)}>
          <Plus className="h-5 w-5" />
          Nova Simulação
        </Button>
        <Button variant="outline" className="gap-2 h-auto py-4 flex-col" onClick={() => setShowComparator(true)} disabled={simulations.length < 2}>
          <BarChart3 className="h-5 w-5" />
          Comparar
        </Button>
        <Button variant="outline" className="gap-2 h-auto py-4 flex-col" disabled>
          <Star className="h-5 w-5" />
          Favoritas ({favoriteSimulations.length})
        </Button>
        <Button variant="outline" className="gap-2 h-auto py-4 flex-col" onClick={() => setShowReport(true)} disabled={simulations.length === 0}>
          <FileText className="h-5 w-5" />
          Relatório
        </Button>
      </div>

      {/* Simulations List */}
      <Card>
        <CardHeader>
          <CardTitle>Simulações</CardTitle>
        </CardHeader>
        <CardContent>
          {simulations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma simulação criada ainda.</p>
              <p className="text-sm mt-2">Clique em "Nova Simulação" para começar.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {simulations.map((sim) => (
                <SimulationCard key={sim.id} simulation={sim} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <TimelineSection clientId={client.id} />

      {/* Modals */}
      <ClientFormDialog open={showEditClient} onOpenChange={setShowEditClient} client={client} />
      <SimulationModal open={showSimulationModal} onOpenChange={setShowSimulationModal} client={client} />
      <ScenarioComparator open={showComparator} onOpenChange={setShowComparator} simulations={simulations} selectedIds={selectedSimulations} onSelectionChange={setSelectedSimulations} />
      <ReportGenerator open={showReport} onOpenChange={setShowReport} client={client} simulations={simulations} />
    </div>
  );
}
