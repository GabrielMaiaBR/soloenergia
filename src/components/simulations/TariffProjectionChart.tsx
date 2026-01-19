import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/financial";

interface TariffProjectionChartProps {
  baseMonthlyEconomy: number;
  tariffIncreaseRate: number;
  years?: number;
  systemValue?: number;
}

export function TariffProjectionChart({
  baseMonthlyEconomy,
  tariffIncreaseRate,
  years = 25,
  systemValue,
}: TariffProjectionChartProps) {
  // Generate projection data
  const data = [];
  let cumulativeWithIncrease = 0;
  let cumulativeWithoutIncrease = 0;

  for (let year = 0; year <= years; year++) {
    const adjustmentFactor = Math.pow(1 + tariffIncreaseRate / 100, year);
    const annualEconomyWithIncrease = baseMonthlyEconomy * 12 * adjustmentFactor;
    const annualEconomyWithoutIncrease = baseMonthlyEconomy * 12;

    cumulativeWithIncrease += annualEconomyWithIncrease;
    cumulativeWithoutIncrease += annualEconomyWithoutIncrease;

    data.push({
      year,
      label: `Ano ${year}`,
      comReajuste: Math.round(cumulativeWithIncrease),
      semReajuste: Math.round(cumulativeWithoutIncrease),
      economiaAnual: Math.round(annualEconomyWithIncrease),
    });
  }

  // Find payback year
  let paybackYear = null;
  if (systemValue) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].comReajuste >= systemValue) {
        paybackYear = i;
        break;
      }
    }
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value) =>
              new Intl.NumberFormat("pt-BR", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value)
            }
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === "comReajuste" ? "Com reajuste" : "Sem reajuste",
            ]}
            labelFormatter={(label) => label}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend
            formatter={(value) =>
              value === "comReajuste" ? "Com reajuste" : "Sem reajuste"
            }
          />
          {systemValue && (
            <Line
              type="monotone"
              dataKey={() => systemValue}
              stroke="hsl(var(--destructive))"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name="Investimento"
            />
          )}
          <Line
            type="monotone"
            dataKey="comReajuste"
            stroke="hsl(var(--solo-success))"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="semReajuste"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Economia em 25 anos</p>
          <p className="text-lg font-bold text-solo-success">
            {formatCurrency(data[years]?.comReajuste || 0)}
          </p>
          <p className="text-xs text-muted-foreground">Com {tariffIncreaseRate}% a.a.</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Diferença</p>
          <p className="text-lg font-bold text-primary">
            +{formatCurrency((data[years]?.comReajuste || 0) - (data[years]?.semReajuste || 0))}
          </p>
          <p className="text-xs text-muted-foreground">vs. sem reajuste</p>
        </div>
        {paybackYear !== null && (
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-muted-foreground">Payback</p>
            <p className="text-lg font-bold">
              ~{paybackYear} {paybackYear === 1 ? "ano" : "anos"}
            </p>
            <p className="text-xs text-muted-foreground">Com reajuste</p>
          </div>
        )}
      </div>
    </div>
  );
}
