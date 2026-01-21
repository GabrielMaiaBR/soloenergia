import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/financial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertTriangle } from "lucide-react";

interface CrocodileMouthChartProps {
  monthlyBillWithoutSolar: number; // Current energy bill
  monthlyBillWithSolar: number; // Minimum bill with solar (availability cost)
  monthlyInstallment: number; // Monthly financing installment
  installments: number; // Number of months financing
  tariffIncreaseRate: number; // Annual tariff increase %
  years?: number;
}

interface ChartDataPoint {
  year: number;
  label: string;
  semSolar: number;
  comSolar: number;
  acumuladoSemSolar: number;
  acumuladoComSolar: number;
}

export function CrocodileMouthChart({
  monthlyBillWithoutSolar,
  monthlyBillWithSolar,
  monthlyInstallment,
  installments,
  tariffIncreaseRate,
  years = 25,
}: CrocodileMouthChartProps) {
  // Generate projection data
  const data: ChartDataPoint[] = [];
  let cumulativeWithoutSolar = 0;
  let cumulativeWithSolar = 0;
  let crossoverYear: number | null = null;

  for (let year = 0; year <= years; year++) {
    // Tariff increases compound annually
    const tariffMultiplier = Math.pow(1 + tariffIncreaseRate / 100, year);
    
    // Annual cost without solar (exponential growth due to tariff inflation)
    const annualCostWithoutSolar = monthlyBillWithoutSolar * 12 * tariffMultiplier;
    
    // Annual cost with solar: minimum bill + installment (if still financing)
    const yearsOfInstallments = Math.ceil(installments / 12);
    const annualInstallment = year < yearsOfInstallments 
      ? monthlyInstallment * Math.min(12, installments - year * 12)
      : 0;
    const annualMinBill = monthlyBillWithSolar * 12 * tariffMultiplier;
    const annualCostWithSolar = annualMinBill + annualInstallment;

    cumulativeWithoutSolar += annualCostWithoutSolar;
    cumulativeWithSolar += annualCostWithSolar;

    // Find crossover point (when cumulative savings become significant)
    if (crossoverYear === null && year > 0 && cumulativeWithoutSolar > cumulativeWithSolar * 1.1) {
      crossoverYear = year;
    }

    data.push({
      year,
      label: `Ano ${year}`,
      semSolar: Math.round(annualCostWithoutSolar),
      comSolar: Math.round(annualCostWithSolar),
      acumuladoSemSolar: Math.round(cumulativeWithoutSolar),
      acumuladoComSolar: Math.round(cumulativeWithSolar),
    });
  }

  const totalSavings = cumulativeWithoutSolar - cumulativeWithSolar;
  const financingEndsYear = Math.ceil(installments / 12);

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-solo-success" />
            Comparativo: Sem Solar vs Com Solar
          </CardTitle>
          {crossoverYear && (
            <span className="text-sm font-medium text-solo-success bg-solo-success/10 px-3 py-1 rounded-full">
              Vantagem clara a partir do ano {crossoverYear}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          A área entre as curvas representa seu ganho financeiro acumulado
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorWithoutSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--solo-danger))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--solo-danger))" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorWithSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--solo-success))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--solo-success))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                interval={4}
              />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    notation: "compact",
                    compactDisplay: "short",
                    style: "currency",
                    currency: "BRL",
                  }).format(value)
                }
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "acumuladoSemSolar" 
                    ? "Custo acumulado SEM solar" 
                    : "Custo acumulado COM solar",
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              />
              <Legend 
                formatter={(value) =>
                  value === "acumuladoSemSolar" 
                    ? "Custo SEM solar (cresce com inflação energética)" 
                    : "Custo COM solar (parcela fixa + mínimo)"
                }
              />
              {financingEndsYear > 0 && (
                <ReferenceLine
                  x={`Ano ${financingEndsYear}`}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="5 5"
                  label={{
                    value: "Fim do financiamento",
                    position: "top",
                    fill: "hsl(var(--primary))",
                    fontSize: 10,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="acumuladoSemSolar"
                stroke="hsl(var(--solo-danger))"
                strokeWidth={2}
                fill="url(#colorWithoutSolar)"
                name="acumuladoSemSolar"
              />
              <Area
                type="monotone"
                dataKey="acumuladoComSolar"
                stroke="hsl(var(--solo-success))"
                strokeWidth={2}
                fill="url(#colorWithSolar)"
                name="acumuladoComSolar"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Key insight */}
        <div className="p-4 rounded-lg bg-solo-success/10 border border-solo-success/20">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-solo-success mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-solo-success">
                Economia total em {years} anos: {formatCurrency(totalSavings)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Enquanto a conta de energia cresce {tariffIncreaseRate}% ao ano, seu investimento em solar 
                permanece fixo. Após o financiamento, você paga apenas a taxa mínima.
              </p>
            </div>
          </div>
        </div>

        {/* Annual costs comparison */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-solo-danger/10 border border-solo-danger/20">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Gasto anual SEM solar (hoje)</p>
            <p className="text-xl font-bold text-solo-danger mt-1">
              {formatCurrency(monthlyBillWithoutSolar * 12)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-solo-danger/10 border border-solo-danger/20">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Gasto anual SEM solar (ano 25)</p>
            <p className="text-xl font-bold text-solo-danger mt-1">
              {formatCurrency(data[years]?.semSolar || 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              Com inflação de {tariffIncreaseRate}% a.a.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-solo-success/10 border border-solo-success/20">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Gasto anual COM solar (após financ.)</p>
            <p className="text-xl font-bold text-solo-success mt-1">
              {formatCurrency(monthlyBillWithSolar * 12 * Math.pow(1 + tariffIncreaseRate / 100, financingEndsYear))}
            </p>
            <p className="text-xs text-muted-foreground">Apenas taxa mínima</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Economia em 25 anos</p>
            <p className="text-xl font-bold text-primary mt-1">
              {formatCurrency(totalSavings)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}