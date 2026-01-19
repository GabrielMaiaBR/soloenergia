import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/lib/financial";
import { Info } from "lucide-react";

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
    <div className="space-y-6">
      {/* Explanation Box */}
      <div className="p-4 rounded-lg bg-solo-trust/10 border border-solo-trust/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-solo-trust mt-0.5 shrink-0" />
          <div className="space-y-2 text-sm">
            <p className="font-medium">O que este gráfico mostra?</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <strong className="text-solo-success">Linha verde:</strong> Economia acumulada considerando que a tarifa de energia aumenta {tariffIncreaseRate}% ao ano (reajuste tarifário).
              </li>
              <li>
                <strong className="text-muted-foreground">Linha tracejada:</strong> Economia caso a tarifa nunca aumentasse (cenário conservador).
              </li>
              {systemValue && (
                <li>
                  <strong className="text-solo-danger">Linha vermelha:</strong> Valor do investimento. Quando a linha verde cruza a vermelha, você recuperou o investimento (payback).
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
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
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === "comReajuste" 
                ? `Com reajuste de ${tariffIncreaseRate}% a.a.` 
                : "Sem reajuste anual",
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
              value === "comReajuste" 
                ? `Economia com reajuste (${tariffIncreaseRate}% a.a.)` 
                : "Economia sem reajuste"
            }
          />
          {systemValue && (
            <ReferenceLine
              y={systemValue}
              stroke="hsl(var(--solo-danger))"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Investimento: ${formatCurrency(systemValue)}`,
                position: "right",
                fill: "hsl(var(--solo-danger))",
                fontSize: 11,
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="comReajuste"
            stroke="hsl(var(--solo-success))"
            strokeWidth={2}
            dot={false}
            name="comReajuste"
          />
          <Line
            type="monotone"
            dataKey="semReajuste"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            name="semReajuste"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Economia Mensal Atual</p>
          <p className="text-lg font-bold text-solo-success">
            {formatCurrency(baseMonthlyEconomy)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Economia em 25 anos</p>
          <p className="text-lg font-bold text-solo-success">
            {formatCurrency(data[years]?.comReajuste || 0)}
          </p>
          <p className="text-xs text-muted-foreground">Com reajuste de {tariffIncreaseRate}% a.a.</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Ganho pelo Reajuste</p>
          <p className="text-lg font-bold text-primary">
            +{formatCurrency((data[years]?.comReajuste || 0) - (data[years]?.semReajuste || 0))}
          </p>
          <p className="text-xs text-muted-foreground">vs. sem reajuste</p>
        </div>
        {paybackYear !== null && (
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-muted-foreground">Retorno do Investimento</p>
            <p className="text-lg font-bold">
              ~{paybackYear} {paybackYear === 1 ? "ano" : "anos"}
            </p>
            <p className="text-xs text-muted-foreground">Payback com reajuste</p>
          </div>
        )}
      </div>
    </div>
  );
}
