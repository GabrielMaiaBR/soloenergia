import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Zap, TrendingUp, DollarSign, FileText, BarChart3, Edit, LineChart, History, MessageSquare, Settings2, FileSpreadsheet, Table2, Phone } from "lucide-react";
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
import { VersionHistoryModal } from "@/components/simulations/VersionHistoryModal";
import { SalesArgumentsPanel } from "@/components/sales/SalesArgumentsPanel";
import { CrocodileMouthChart } from "@/components/charts/CrocodileMouthChart";
import { LCOEIndicator } from "@/components/charts/LCOEIndicator";
import { FinancialProjectionTable } from "@/components/charts/FinancialProjectionTable";
import { TechnicalPremisesPanel } from "@/components/charts/TechnicalPremisesPanel";
import { ProposalKPIs } from "@/components/dashboard/ProposalKPIs";
import { PaybackGauge } from "@/components/charts/PaybackGauge";
import { ROIRadial } from "@/components/charts/ROIRadial";
import { formatCurrency, calculateRealEconomy, calculateLCOE, calculatePayback } from "@/lib/financial";
import { openWhatsApp, generateProposalMessage } from "@/lib/whatsapp";

export default function ClientCockpit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: client, isLoading: clientLoading } = useClient(id);
  const { data: simulations = [] } = useClientSimulations(id);
  const { data: settings } = useSettings();

  const [showEditClient, setShowEditClient] = useState(false);
  const [showComparator, setShowComparator] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSalesArguments, setShowSalesArguments] = useState(false);
  const [selectedSimulations, setSelectedSimulations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("proposal");

  // Technical premises state
  const [premises, setPremises] = useState({
    degradationRate: 0.5,
    tariffIncreaseRate: 8,
    maintenanceCostPercent: 0.5,
    inverterReplacementYear: 12,
    lei14300Factor: 0.85,
  });

  // Calculate values - using optional chaining for when client is loading
  const lei14300Factor = settings?.lei_14300_factor || premises.lei14300Factor;
  const tariff = client?.energy_tariff || settings?.default_tariff || 0.85;
  const monthlyEconomy = calculateRealEconomy(client?.monthly_generation_kwh || 0, tariff, lei14300Factor);

  // Get the favorite or first simulation for proposal display
  const primarySimulation = simulations.find(s => s.is_favorite) || simulations[0];

  // Calculate key metrics
  const systemValue = primarySimulation?.system_value || 0;
  const monthlyInstallment = primarySimulation?.installment_value || 0;
  const installments = primarySimulation?.installments || 0;
  const totalPaid = monthlyInstallment * installments;

  // Calculate LCOE
  const lcoe = calculateLCOE(
    systemValue,
    client?.monthly_generation_kwh || 0,
    25
  );

  // Calculate payback with tariff increase
  const paybackResult = calculatePayback(
    totalPaid > 0 ? totalPaid : systemValue,
    monthlyEconomy,
    premises.tariffIncreaseRate
  );

  // Calculate 25-year accumulated savings - MUST be before early return
  const accumulatedSavings25Years = useMemo(() => {
    if (!client) return 0;
    let accumulated = 0;
    let currentEconomy = monthlyEconomy * 12;
    for (let year = 0; year < 25; year++) {
      accumulated += currentEconomy;
      currentEconomy *= (1 + premises.tariffIncreaseRate / 100);
    }
    return accumulated;
  }, [client, monthlyEconomy, premises.tariffIncreaseRate]);

  // Calculate ROI Percentage (Project ROI)
  const roiPercentage = useMemo(() => {
    if (systemValue <= 0) return 0;
    return ((accumulatedSavings25Years - systemValue) / systemValue) * 100;
  }, [accumulatedSavings25Years, systemValue]);

  // Calculate crossover year (when cumulative savings > cumulative cost) - MUST be before early return
  const crossoverYear = useMemo(() => {
    if (!client) return 1;
    let accSavings = 0;
    let accCost = 0;
    let currentEconomy = monthlyEconomy * 12;
    const annualInstallment = monthlyInstallment * 12;
    const financingYears = Math.ceil(installments / 12);

    for (let year = 1; year <= 25; year++) {
      accSavings += currentEconomy;
      if (year <= financingYears) {
        accCost += annualInstallment;
      }
      if (accSavings > accCost && year >= financingYears) {
        return year;
      }
      currentEconomy *= (1 + premises.tariffIncreaseRate / 100);
    }
    return Math.ceil(installments / 12) + 1;
  }, [client, monthlyEconomy, monthlyInstallment, installments, premises.tariffIncreaseRate]);

  // Minimum bill with solar (availability cost ~R$50-100)
  const minBillWithSolar = 80;

  // Early return for loading state - AFTER all hooks
  if (clientLoading || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <p className="text-muted-foreground">Análise de Proposta Solar</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowEditClient(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {/* Project Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="transition-solo hover:shadow-lg">
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

        <Card className="transition-solo hover:shadow-lg">
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

        <Card className="transition-solo hover:shadow-lg">
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

        <Card className="transition-solo hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tarifa Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {tariff.toFixed(2)}/kWh</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="gap-2" onClick={() => setShowVersionHistory(true)} disabled={simulations.length === 0}>
          <History className="h-4 w-4" />
          Histórico
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setShowComparator(true)} disabled={simulations.length < 2}>
          <BarChart3 className="h-4 w-4" />
          Comparar ({simulations.length})
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setShowReport(true)} disabled={simulations.length === 0}>
          <FileText className="h-4 w-4" />
          Relatório
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setShowSalesArguments(true)}>
          <MessageSquare className="h-4 w-4" />
          Argumentos
        </Button>
        <Button
          variant="default"
          className="gap-2 bg-[#25D366] hover:bg-[#128C7E]"
          onClick={() => {
            const message = generateProposalMessage({
              clientName: client.name,
              systemPower: client.system_power_kwp || 0,
              monthlyGeneration: client.monthly_generation_kwh || 0,
              systemValue: systemValue,
              monthlyEconomy: monthlyEconomy,
              paybackYears: paybackResult.years === Infinity ? 0 : paybackResult.years,
              companyName: settings?.company_name,
            });
            openWhatsApp(settings?.whatsapp_number, message);
          }}
        >
          <Phone className="h-4 w-4" />
          WhatsApp
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="proposal" className="gap-1">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Proposta</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Análise</span>
          </TabsTrigger>
          <TabsTrigger value="simulate" className="gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Simular</span>
          </TabsTrigger>
          <TabsTrigger value="projection" className="gap-1">
            <Table2 className="h-4 w-4" />
            <span className="hidden sm:inline">Projeção</span>
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-1">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Gráficos</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
        </TabsList>

        {/* PROPOSTA TAB - Main Dashboard */}
        <TabsContent value="proposal" className="mt-6 space-y-6">
          {monthlyEconomy > 0 && systemValue > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 mb-2 animate-scale-in">
                <PaybackGauge
                  years={paybackResult.years === Infinity ? 0 : Math.floor(paybackResult.months / 12)}
                  months={paybackResult.years === Infinity ? 0 : paybackResult.months % 12}
                />
                <ROIRadial
                  roi={roiPercentage}
                />
              </div>

              {/* KPIs */}
              <ProposalKPIs
                paybackYears={paybackResult.years === Infinity ? 0 : Math.floor(paybackResult.months / 12)}
                paybackMonths={paybackResult.years === Infinity ? 0 : paybackResult.months % 12}
                crossoverYear={crossoverYear}
                accumulatedSavings25Years={accumulatedSavings25Years}
                monthlyEconomy={monthlyEconomy}
                lcoe={lcoe}
                currentTariff={tariff}
                systemValue={systemValue}
              />

              {/* Crocodile Mouth Chart */}
              <CrocodileMouthChart
                monthlyBillWithoutSolar={monthlyEconomy / lei14300Factor}
                monthlyBillWithSolar={minBillWithSolar}
                monthlyInstallment={monthlyInstallment}
                installments={installments}
                tariffIncreaseRate={premises.tariffIncreaseRate}
              />

              {/* LCOE + Technical Premises */}
              <div className="grid gap-6 lg:grid-cols-2">
                <LCOEIndicator
                  currentTariff={tariff}
                  solarLCOE={lcoe}
                  systemLifetimeYears={25}
                />
                <TechnicalPremisesPanel
                  {...premises}
                  onUpdate={(updates) => setPremises(prev => ({ ...prev, ...updates }))}
                />
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Proposta Incompleta</h3>
                <p className="mb-4">
                  Configure a geração mensal do cliente e crie uma simulação para visualizar a proposta completa.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setShowEditClient(true)}>
                    Editar Cliente
                  </Button>
                  <Button onClick={() => setActiveTab("simulate")}>
                    Criar Simulação
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ANALYSIS TAB - Unified Card */}
        <TabsContent value="analysis" className="mt-6">
          <UnifiedClientCard
            client={client}
            simulations={simulations}
            monthlyEconomy={monthlyEconomy}
            tariff={tariff}
            onNewSimulation={() => setActiveTab("simulate")}
          />
        </TabsContent>

        {/* SIMULATE TAB */}
        <TabsContent value="simulate" className="mt-6">
          <QuickSimulationPanel
            client={client}
            monthlyEconomy={monthlyEconomy}
            onSimulationCreated={() => setActiveTab("analysis")}
          />
        </TabsContent>

        {/* PROJECTION TAB - Financial Table */}
        <TabsContent value="projection" className="mt-6 space-y-6">
          {monthlyEconomy > 0 && primarySimulation ? (
            <>
              <FinancialProjectionTable
                systemPowerKwp={client.system_power_kwp || 0}
                monthlyGenerationKwh={client.monthly_generation_kwh || 0}
                energyTariff={tariff}
                tariffIncreaseRate={premises.tariffIncreaseRate}
                monthlyInstallment={monthlyInstallment}
                installments={installments}
                systemValue={systemValue}
                degradationRate={premises.degradationRate}
                maintenanceCostPercent={premises.maintenanceCostPercent}
              />

              <TechnicalPremisesPanel
                {...premises}
                onUpdate={(updates) => setPremises(prev => ({ ...prev, ...updates }))}
              />
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Table2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure a geração mensal e crie uma simulação para ver a projeção detalhada.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CHARTS TAB */}
        <TabsContent value="charts" className="mt-6 space-y-6">
          {monthlyEconomy > 0 && (
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
                  tariffIncreaseRate={premises.tariffIncreaseRate}
                  systemValue={systemValue}
                />
              </CardContent>
            </Card>
          )}

          <EconomyChartsTab
            simulations={simulations}
            client={client}
            monthlyEconomy={monthlyEconomy}
          />
        </TabsContent>

        {/* TIMELINE TAB */}
        <TabsContent value="timeline" className="mt-6">
          <TimelineSection clientId={client.id} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ClientFormDialog open={showEditClient} onOpenChange={setShowEditClient} client={client} />
      <ScenarioComparator open={showComparator} onOpenChange={setShowComparator} simulations={simulations} selectedIds={selectedSimulations} onSelectionChange={setSelectedSimulations} />
      <ReportGenerator open={showReport} onOpenChange={setShowReport} client={client} simulations={simulations} />
      <VersionHistoryModal open={showVersionHistory} onOpenChange={setShowVersionHistory} simulations={simulations} />
      <SalesArgumentsPanel open={showSalesArguments} onOpenChange={setShowSalesArguments} />
    </div>
  );
}
