import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Zap, TrendingUp, DollarSign, FileText, BarChart3, Edit, LineChart, PieChart } from "lucide-react";
import { useClient } from "@/hooks/useClients";
import { useClientSimulations } from "@/hooks/useSimulations";
import { useSettings } from "@/hooks/useSettings";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { UnifiedClientCard } from "@/components/clients/UnifiedClientCard";
import { QuickSimulationPanel } from "@/components/simulations/QuickSimulationPanel";
import { ScenarioComparator } from "@/components/simulations/ScenarioComparator";
import { TariffProjectionChart } from "@/components/simulations/TariffProjectionChart";
import { EconomyChartsTab } from "@/components/simulations/EconomyChartsTab";
import { TimelineSection } from "@/components/timeline/TimelineSection";
import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { formatCurrency, calculateRealEconomy } from "@/lib/financial";

export default function ClientCockpit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: client, isLoading: clientLoading } = useClient(id);
  const { data: simulations = [] } = useClientSimulations(id);
  const { data: settings } = useSettings();

  const [showEditClient, setShowEditClient] = useState(false);
  const [showComparator, setShowComparator] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedSimulations, setSelectedSimulations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("analysis");

  if (clientLoading || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const lei14300Factor = settings?.lei_14300_factor || 0.85;
  const tariff = client.energy_tariff || settings?.default_tariff || 0.85;
  const monthlyEconomy = calculateRealEconomy(client.monthly_generation_kwh || 0, tariff, lei14300Factor);
  const averageTariffIncrease = simulations.length > 0 
    ? simulations.reduce((acc, s) => acc + (s.tariff_increase_rate || 8), 0) / simulations.length 
    : 8;

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
            <div className="text-2xl font-bold">R$ {tariff.toFixed(2)}/kWh</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="gap-2" onClick={() => setShowComparator(true)} disabled={simulations.length < 2}>
          <BarChart3 className="h-4 w-4" />
          Comparar ({simulations.length})
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setShowReport(true)} disabled={simulations.length === 0}>
          <FileText className="h-4 w-4" />
          Relatório
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="simulate">Simular</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="projection">Projeção</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-6">
          <UnifiedClientCard
            client={client}
            simulations={simulations}
            monthlyEconomy={monthlyEconomy}
            tariff={tariff}
            onNewSimulation={() => setActiveTab("simulate")}
          />
        </TabsContent>

        <TabsContent value="simulate" className="mt-6">
          <QuickSimulationPanel
            client={client}
            monthlyEconomy={monthlyEconomy}
            onSimulationCreated={() => setActiveTab("analysis")}
          />
        </TabsContent>

        <TabsContent value="charts" className="mt-6">
          <EconomyChartsTab 
            simulations={simulations} 
            client={client} 
            monthlyEconomy={monthlyEconomy} 
          />
        </TabsContent>

        <TabsContent value="projection" className="mt-6">
          {monthlyEconomy > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  Projeção de Economia (25 anos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TariffProjectionChart
                  baseMonthlyEconomy={monthlyEconomy}
                  tariffIncreaseRate={averageTariffIncrease}
                  systemValue={simulations[0]?.system_value}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure a geração mensal do cliente para ver a projeção.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <TimelineSection clientId={client.id} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ClientFormDialog open={showEditClient} onOpenChange={setShowEditClient} client={client} />
      <ScenarioComparator open={showComparator} onOpenChange={setShowComparator} simulations={simulations} selectedIds={selectedSimulations} onSelectionChange={setSelectedSimulations} />
      <ReportGenerator open={showReport} onOpenChange={setShowReport} client={client} simulations={simulations} />
    </div>
  );
}
