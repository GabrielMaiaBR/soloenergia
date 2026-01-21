import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/financial";
import { FileSpreadsheet, Download, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FinancialProjectionTableProps {
  systemPowerKwp: number;
  monthlyGenerationKwh: number;
  energyTariff: number;
  tariffIncreaseRate: number;
  monthlyInstallment: number;
  installments: number;
  systemValue: number;
  degradationRate?: number; // Panel degradation per year (default 0.5%)
  maintenanceCostPercent?: number; // Annual maintenance as % of system value
  years?: number;
}

interface YearlyData {
  year: number;
  generation: number; // kWh/year with degradation
  tariff: number; // R$/kWh with inflation
  grossSavings: number; // R$/year
  installmentCost: number; // R$/year
  maintenanceCost: number;
  netCashflow: number;
  accumulated: number;
}

export function FinancialProjectionTable({
  systemPowerKwp,
  monthlyGenerationKwh,
  energyTariff,
  tariffIncreaseRate,
  monthlyInstallment,
  installments,
  systemValue,
  degradationRate = 0.5,
  maintenanceCostPercent = 0.5,
  years = 25,
}: FinancialProjectionTableProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Generate yearly projection data
  const data: YearlyData[] = [];
  let accumulated = -systemValue; // Start with negative (investment)
  const annualMaintenanceCost = systemValue * (maintenanceCostPercent / 100);
  const financingYears = Math.ceil(installments / 12);

  for (let year = 1; year <= years; year++) {
    // Degradation: panels lose efficiency over time
    const degradationFactor = Math.pow(1 - degradationRate / 100, year - 1);
    const annualGeneration = monthlyGenerationKwh * 12 * degradationFactor;
    
    // Tariff increases compound annually
    const currentTariff = energyTariff * Math.pow(1 + tariffIncreaseRate / 100, year - 1);
    
    // Gross savings (Lei 14.300 factor applied - 85% compensation)
    const grossSavings = annualGeneration * currentTariff * 0.85;
    
    // Installment cost (only during financing period)
    let installmentCost = 0;
    if (year <= financingYears) {
      const monthsThisYear = year < financingYears 
        ? 12 
        : installments - (financingYears - 1) * 12;
      installmentCost = monthlyInstallment * monthsThisYear;
    }
    
    // Net cashflow for the year
    const netCashflow = grossSavings - installmentCost - annualMaintenanceCost;
    accumulated += netCashflow;

    data.push({
      year,
      generation: Math.round(annualGeneration),
      tariff: currentTariff,
      grossSavings: Math.round(grossSavings),
      installmentCost: Math.round(installmentCost),
      maintenanceCost: Math.round(annualMaintenanceCost),
      netCashflow: Math.round(netCashflow),
      accumulated: Math.round(accumulated),
    });
  }

  // Find payback year
  const paybackYear = data.findIndex(d => d.accumulated >= 0) + 1;
  
  // Display subset unless showing all
  const displayData = showAll ? data : data.filter(d => 
    d.year <= 5 || d.year === 10 || d.year === 15 || d.year === 20 || d.year === 25
  );

  const copyToClipboard = () => {
    const headers = "Ano\tGeração (kWh)\tTarifa (R$/kWh)\tEconomia Bruta\tParcela\tManutenção\tFluxo Líquido\tAcumulado\n";
    const rows = data.map(d => 
      `${d.year}\t${d.generation}\t${d.tariff.toFixed(2)}\t${d.grossSavings}\t${d.installmentCost}\t${d.maintenanceCost}\t${d.netCashflow}\t${d.accumulated}`
    ).join("\n");
    
    navigator.clipboard.writeText(headers + rows);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Projeção Financeira - {years} Anos
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Share2 className="h-4 w-4 mr-1" />
              Copiar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Resumir" : "Ver Todos"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Fluxo de caixa detalhado considerando degradação de {degradationRate}%/ano e reajuste tarifário de {tariffIncreaseRate}%/ano
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto scrollbar-solo">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="w-16">Ano</TableHead>
                <TableHead className="text-right">Geração</TableHead>
                <TableHead className="text-right">Tarifa</TableHead>
                <TableHead className="text-right">Economia Bruta</TableHead>
                <TableHead className="text-right">Parcela</TableHead>
                <TableHead className="text-right">Manutenção</TableHead>
                <TableHead className="text-right">Fluxo Líquido</TableHead>
                <TableHead className="text-right">Acumulado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Initial investment row */}
              <TableRow className="bg-muted/30 text-xs">
                <TableCell className="font-medium">0</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right text-solo-danger font-medium">
                  {formatCurrency(-systemValue)}
                </TableCell>
                <TableCell className="text-right text-solo-danger font-medium">
                  {formatCurrency(-systemValue)}
                </TableCell>
              </TableRow>
              
              {displayData.map((row) => (
                <TableRow 
                  key={row.year}
                  className={cn(
                    "text-xs transition-colors",
                    row.year === paybackYear && "bg-solo-success/10 border-solo-success/30",
                    row.accumulated < 0 && "text-muted-foreground"
                  )}
                >
                  <TableCell className="font-medium">
                    {row.year}
                    {row.year === paybackYear && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-solo-success text-solo-success-foreground">
                        Payback
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{row.generation.toLocaleString('pt-BR')} kWh</TableCell>
                  <TableCell className="text-right">R$ {row.tariff.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-solo-success">{formatCurrency(row.grossSavings)}</TableCell>
                  <TableCell className="text-right">
                    {row.installmentCost > 0 ? (
                      <span className="text-solo-warning">{formatCurrency(row.installmentCost)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(row.maintenanceCost)}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    row.netCashflow >= 0 ? "text-solo-success" : "text-solo-danger"
                  )}>
                    {formatCurrency(row.netCashflow)}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    row.accumulated >= 0 ? "text-solo-success" : "text-solo-danger"
                  )}>
                    {formatCurrency(row.accumulated)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Technical premises footer */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Premissas técnicas:</strong> Degradação de {degradationRate}%/ano • 
            Reajuste tarifário de {tariffIncreaseRate}%/ano • 
            Manutenção anual de {maintenanceCostPercent}% do valor do sistema • 
            Fator Lei 14.300: 85% de compensação
          </p>
        </div>
      </CardContent>
    </Card>
  );
}