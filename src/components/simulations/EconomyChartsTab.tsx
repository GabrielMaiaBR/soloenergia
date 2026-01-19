import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/financial";
import type { Simulation, Client } from "@/types";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, DollarSign } from "lucide-react";

interface EconomyChartsTabProps {
  simulations: Simulation[];
  client: Client;
  monthlyEconomy: number;
}

const COLORS = [
  "hsl(var(--solo-success))",
  "hsl(var(--solo-warning))",
  "hsl(var(--solo-trust))",
  "hsl(var(--solo-danger))",
  "hsl(var(--primary))",
];

export function EconomyChartsTab({ simulations, client, monthlyEconomy }: EconomyChartsTabProps) {
  // Monthly economy vs installment comparison
  const economyVsInstallmentData = useMemo(() => {
    return simulations
      .filter((s) => s.installment_value && s.type !== "cash")
      .map((s) => ({
        name: s.name || `v${s.version}`,
        economy: monthlyEconomy,
        installment: s.installment_value || 0,
        difference: monthlyEconomy - (s.installment_value || 0),
      }));
  }, [simulations, monthlyEconomy]);

  // Distribution of total interest per simulation
  const interestDistributionData = useMemo(() => {
    return simulations
      .filter((s) => s.total_interest_paid !== undefined)
      .map((s) => ({
        name: s.name || `v${s.version}`,
        value: s.total_interest_paid || 0,
      }));
  }, [simulations]);

  // 12 month projection
  const monthlyProjection = useMemo(() => {
    const data = [];
    let cumulativeSavings = 0;
    
    for (let month = 1; month <= 12; month++) {
      cumulativeSavings += monthlyEconomy;
      data.push({
        month: `Mês ${month}`,
        economiaAcumulada: Math.round(cumulativeSavings),
        economiaMensal: Math.round(monthlyEconomy),
      });
    }
    return data;
  }, [monthlyEconomy]);

  // Comparison of payment types
  const paymentTypeComparison = useMemo(() => {
    const typeGroups: Record<string, { count: number; avgInterest: number; avgCashflow: number }> = {};
    
    simulations.forEach((s) => {
      if (!typeGroups[s.type]) {
        typeGroups[s.type] = { count: 0, avgInterest: 0, avgCashflow: 0 };
      }
      typeGroups[s.type].count++;
      typeGroups[s.type].avgInterest += s.total_interest_paid || 0;
      typeGroups[s.type].avgCashflow += s.monthly_cashflow || 0;
    });

    const typeLabels: Record<string, string> = {
      financing: "Financiamento",
      credit_card: "Cartão",
      cash: "À Vista",
    };

    return Object.entries(typeGroups).map(([type, data]) => ({
      type: typeLabels[type] || type,
      jurosTotal: Math.round(data.avgInterest / data.count),
      fluxoMensal: Math.round(data.avgCashflow / data.count),
    }));
  }, [simulations]);

  if (simulations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Crie simulações para visualizar os gráficos de economia.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-solo-success" />
            <p className="text-sm text-muted-foreground">Economia Mensal</p>
            <p className="text-xl font-bold text-solo-success">{formatCurrency(monthlyEconomy)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Economia Anual</p>
            <p className="text-xl font-bold">{formatCurrency(monthlyEconomy * 12)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <PieChartIcon className="h-6 w-6 mx-auto mb-2 text-solo-warning" />
            <p className="text-sm text-muted-foreground">Em 25 Anos</p>
            <p className="text-xl font-bold">{formatCurrency(monthlyEconomy * 12 * 25)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Simulações</p>
            <p className="text-xl font-bold">{simulations.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cumulative Savings Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-solo-success" />
            Economia Acumulada (12 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Projeção da economia acumulada nos próximos 12 meses baseada na geração solar e tarifa atual.
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyProjection}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Economia"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Area
                type="monotone"
                dataKey="economiaAcumulada"
                fill="hsl(var(--solo-success) / 0.2)"
                stroke="hsl(var(--solo-success))"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Economy vs Installment Comparison */}
      {economyVsInstallmentData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-primary" />
              Economia Mensal vs Valor da Parcela
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Compare sua economia mensal com o valor da parcela em cada cenário. 
              Barras verdes indicam que você economiza mais do que paga.
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={economyVsInstallmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "economy" ? "Economia" : "Parcela",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend formatter={(v) => (v === "economy" ? "Economia" : "Parcela")} />
                <Bar dataKey="economy" fill="hsl(var(--solo-success))" name="economy" />
                <Bar dataKey="installment" fill="hsl(var(--solo-warning))" name="installment" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Interest Distribution */}
      {interestDistributionData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChartIcon className="h-5 w-5 text-solo-danger" />
              Distribuição de Juros por Cenário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Visualize quanto de juros você pagaria em cada cenário de financiamento.
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={interestDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                >
                  {interestDistributionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Payment Type Comparison */}
      {paymentTypeComparison.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-solo-trust" />
              Comparativo por Tipo de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Média de juros totais e fluxo de caixa mensal por tipo de pagamento.
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={paymentTypeComparison}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "jurosTotal" ? "Juros Totais" : "Fluxo Mensal",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend formatter={(v) => (v === "jurosTotal" ? "Juros Totais" : "Fluxo Mensal")} />
                <Bar dataKey="jurosTotal" fill="hsl(var(--solo-danger))" name="jurosTotal" />
                <Bar dataKey="fluxoMensal" fill="hsl(var(--solo-success))" name="fluxoMensal" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
