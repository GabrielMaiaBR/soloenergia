import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Share2, 
  MessageCircle, 
  TrendingUp, 
  TrendingDown,
  Copy,
  Check,
  Printer,
} from "lucide-react";
import type { Client, Simulation } from "@/types";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, formatPercent } from "@/lib/financial";
import { toast } from "sonner";

interface ReportGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  simulations: Simulation[];
}

type ReportType = "commercial" | "technical";

const formatPayback = (months?: number) => {
  if (months === undefined || months === null) return "-";
  if (months === Infinity || isNaN(months)) return "N/A";
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${months} ${months === 1 ? "mês" : "meses"}`;
  } else if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "ano" : "anos"}`;
  } else {
    return `${years}a ${remainingMonths}m`;
  }
};

export function ReportGenerator({
  open,
  onOpenChange,
  client,
  simulations,
}: ReportGeneratorProps) {
  const { data: settings } = useSettings();
  const [reportType, setReportType] = useState<ReportType>("commercial");
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(
    simulations.find((s) => s.is_favorite) || simulations[0] || null
  );

  const favoriteSimulations = simulations.filter((s) => s.is_favorite);
  const displaySimulations = favoriteSimulations.length > 0 ? favoriteSimulations : simulations.slice(0, 3);

  const generatePDF = () => {
    // Use browser print dialog for PDF generation
    if (reportRef.current) {
      const printContent = reportRef.current.innerHTML;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Relatório - ${client.name}</title>
            <style>
              body { 
                font-family: system-ui, -apple-system, sans-serif; 
                padding: 40px; 
                color: #333;
                max-width: 800px;
                margin: 0 auto;
              }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { max-height: 60px; margin-bottom: 20px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .client-name { color: #666; font-size: 18px; }
              .section { margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }
              .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
              .metric { padding: 16px; background: white; border-radius: 8px; text-align: center; }
              .metric-label { color: #666; font-size: 14px; }
              .metric-value { font-size: 24px; font-weight: bold; margin-top: 8px; }
              .positive { color: #27AE60; }
              .negative { color: #EB5757; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
              th { background: #f5f5f5; font-weight: 600; }
              .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #666; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="header">
              ${settings?.logo_url ? `<img src="${settings.logo_url}" class="logo" alt="Logo" />` : ""}
              <div class="title">${settings?.company_name || "Proposta Solar"}</div>
              <div class="client-name">${client.name}</div>
            </div>
            
            <div class="section">
              <div class="grid">
                <div class="metric">
                  <div class="metric-label">Potência do Sistema</div>
                  <div class="metric-value">${client.system_power_kwp || "-"} kWp</div>
                </div>
                <div class="metric">
                  <div class="metric-label">Geração Mensal</div>
                  <div class="metric-value">${client.monthly_generation_kwh || "-"} kWh</div>
                </div>
              </div>
            </div>

            ${selectedSimulation ? `
              <div class="section">
                <h3>Condições de Pagamento</h3>
                <div class="grid">
                  <div class="metric">
                    <div class="metric-label">Investimento</div>
                    <div class="metric-value">${formatCurrency(selectedSimulation.system_value)}</div>
                  </div>
                  ${selectedSimulation.installment_value ? `
                    <div class="metric">
                      <div class="metric-label">Parcela</div>
                      <div class="metric-value">${selectedSimulation.installments}x de ${formatCurrency(selectedSimulation.installment_value)}</div>
                    </div>
                  ` : ""}
                  ${selectedSimulation.monthly_cashflow !== undefined ? `
                    <div class="metric">
                      <div class="metric-label">Economia Mensal</div>
                      <div class="metric-value ${selectedSimulation.monthly_cashflow >= 0 ? "positive" : "negative"}">
                        ${formatCurrency(selectedSimulation.monthly_cashflow)}
                      </div>
                    </div>
                  ` : ""}
                  ${selectedSimulation.payback_months ? `
                    <div class="metric">
                      <div class="metric-label">Retorno do Investimento</div>
                      <div class="metric-value">${formatPayback(selectedSimulation.payback_months)}</div>
                    </div>
                  ` : ""}
                </div>
              </div>
            ` : ""}

            ${reportType === "technical" && displaySimulations.length > 0 ? `
              <div class="section">
                <h3>Comparativo de Cenários</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Cenário</th>
                      <th>Valor</th>
                      <th>Parcela</th>
                      <th>Taxa</th>
                      <th>Juros</th>
                      <th>Payback</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${displaySimulations.map((sim) => `
                      <tr>
                        <td>${sim.name || `v${sim.version}`}</td>
                        <td>${formatCurrency(sim.system_value)}</td>
                        <td>${sim.installment_value ? `${sim.installments}x ${formatCurrency(sim.installment_value)}` : "-"}</td>
                        <td>${sim.detected_monthly_rate !== undefined ? formatPercent(sim.detected_monthly_rate) : "-"}</td>
                        <td class="negative">${sim.total_interest_paid !== undefined ? formatCurrency(sim.total_interest_paid) : "-"}</td>
                        <td>${formatPayback(sim.payback_months)}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            ` : ""}

            <div class="footer">
              ${settings?.contact_phone ? `<p>📱 ${settings.contact_phone}</p>` : ""}
              ${settings?.contact_email ? `<p>✉️ ${settings.contact_email}</p>` : ""}
              <p style="margin-top: 20px; font-size: 12px;">
                Proposta gerada em ${new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
    toast.success("PDF gerado! Use Ctrl+P ou Cmd+P para salvar.");
  };

  const generateShareableLink = () => {
    // Create shareable text and copy to clipboard
    const reportData = {
      client: client.name,
      system: `${client.system_power_kwp} kWp`,
      generation: `${client.monthly_generation_kwh} kWh/mês`,
      simulation: selectedSimulation ? {
        value: formatCurrency(selectedSimulation.system_value),
        installment: selectedSimulation.installment_value 
          ? `${selectedSimulation.installments}x ${formatCurrency(selectedSimulation.installment_value)}`
          : null,
        cashflow: selectedSimulation.monthly_cashflow !== undefined 
          ? formatCurrency(selectedSimulation.monthly_cashflow)
          : null,
      } : null,
      company: settings?.company_name,
      contact: settings?.contact_phone,
    };

    const shareText = `
📊 Proposta Solar - ${client.name}
${settings?.company_name || ""}

⚡ Sistema: ${client.system_power_kwp || "-"} kWp
🔌 Geração: ${client.monthly_generation_kwh || "-"} kWh/mês
${selectedSimulation ? `
💰 Investimento: ${formatCurrency(selectedSimulation.system_value)}
${selectedSimulation.installment_value ? `📅 Parcela: ${selectedSimulation.installments}x de ${formatCurrency(selectedSimulation.installment_value)}` : ""}
${selectedSimulation.monthly_cashflow !== undefined ? `📈 Economia: ${formatCurrency(selectedSimulation.monthly_cashflow)}/mês` : ""}
${selectedSimulation.payback_months ? `⏱️ Payback: ${formatPayback(selectedSimulation.payback_months)}` : ""}
` : ""}
${settings?.contact_phone ? `📱 ${settings.contact_phone}` : ""}
${settings?.contact_email ? `✉️ ${settings.contact_email}` : ""}
    `.trim();

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Proposta copiada! Cole em qualquer lugar para compartilhar.");
  };

  const generateWhatsAppCard = () => {
    if (!selectedSimulation) {
      toast.error("Selecione uma simulação primeiro.");
      return;
    }

    const text = `
*Proposta Solar - ${client.name}*
${settings?.company_name || "Solo Smart"}

⚡ Sistema: ${client.system_power_kwp || "-"} kWp
🔌 Geração: ${client.monthly_generation_kwh || "-"} kWh/mês
💰 Valor: ${formatCurrency(selectedSimulation.system_value)}
${selectedSimulation.installment_value ? `📅 Parcela: ${selectedSimulation.installments}x de ${formatCurrency(selectedSimulation.installment_value)}` : "💵 À Vista"}
${selectedSimulation.monthly_cashflow !== undefined ? `📈 Economia mensal: ${formatCurrency(selectedSimulation.monthly_cashflow)}` : ""}
${selectedSimulation.payback_months ? `⏱️ Retorno: ${formatPayback(selectedSimulation.payback_months)}` : ""}

${settings?.contact_phone ? `📱 ${settings.contact_phone}` : ""}
${settings?.contact_email ? `✉️ ${settings.contact_email}` : ""}
    `.trim();

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Relatório - {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Type */}
          <Tabs value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="commercial">Comercial</TabsTrigger>
              <TabsTrigger value="technical">Técnico</TabsTrigger>
            </TabsList>

            <TabsContent value="commercial" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Relatório simplificado para o cliente final. Foco em economia e benefícios,
                sem expor taxas de juros ou detalhes financeiros complexos.
              </p>

              {/* Simulation Selector */}
              {simulations.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground self-center">Cenário:</span>
                  {simulations.map((sim) => (
                    <Button
                      key={sim.id}
                      variant={selectedSimulation?.id === sim.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSimulation(sim)}
                    >
                      {sim.name || `v${sim.version}`}
                      {sim.is_favorite && " ⭐"}
                    </Button>
                  ))}
                </div>
              )}

              {/* Preview */}
              <Card className="bg-card" ref={reportRef}>
                <CardHeader className="text-center border-b">
                  {settings?.logo_url && (
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="h-16 mx-auto mb-4 object-contain"
                    />
                  )}
                  <CardTitle className="text-xl">
                    {settings?.company_name || "Proposta Solar"}
                  </CardTitle>
                  <p className="text-muted-foreground">{client.name}</p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* System Info */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">Potência</p>
                      <p className="text-2xl font-bold">{client.system_power_kwp || "-"} kWp</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">Geração Mensal</p>
                      <p className="text-2xl font-bold">{client.monthly_generation_kwh || "-"} kWh</p>
                    </div>
                  </div>

                  {/* Selected Simulation */}
                  {selectedSimulation && (
                    <div className="p-4 rounded-lg border space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Investimento</span>
                        <span className="text-xl font-bold">
                          {formatCurrency(selectedSimulation.system_value)}
                        </span>
                      </div>
                      {selectedSimulation.installment_value && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Parcela</span>
                          <span className="text-xl font-bold">
                            {selectedSimulation.installments}x de{" "}
                            {formatCurrency(selectedSimulation.installment_value)}
                          </span>
                        </div>
                      )}
                      {selectedSimulation.monthly_cashflow !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Economia Mensal</span>
                          <div className="flex items-center gap-2">
                            {selectedSimulation.monthly_cashflow >= 0 ? (
                              <TrendingUp className="h-5 w-5 text-solo-success" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-solo-danger" />
                            )}
                            <span
                              className={`text-xl font-bold ${
                                selectedSimulation.monthly_cashflow >= 0
                                  ? "text-solo-success"
                                  : "text-solo-danger"
                              }`}
                            >
                              {formatCurrency(selectedSimulation.monthly_cashflow)}
                            </span>
                          </div>
                        </div>
                      )}
                      {selectedSimulation.payback_months && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Retorno do Investimento</span>
                          <span className="text-xl font-bold">
                            {formatPayback(selectedSimulation.payback_months)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                    {settings?.contact_phone && <p>📱 {settings.contact_phone}</p>}
                    {settings?.contact_email && <p>✉️ {settings.contact_email}</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Relatório detalhado com análise financeira completa. Inclui taxas de juros,
                juros totais pagos e comparação entre cenários.
              </p>

              {/* Preview */}
              <Card className="bg-card">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Análise Técnica</CardTitle>
                      <p className="text-sm text-muted-foreground">{client.name}</p>
                    </div>
                    {settings?.logo_url && (
                      <img
                        src={settings.logo_url}
                        alt="Logo"
                        className="h-10 object-contain"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* System Summary */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground">Potência</p>
                      <p className="text-lg font-bold">{client.system_power_kwp || "-"} kWp</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground">Geração</p>
                      <p className="text-lg font-bold">{client.monthly_generation_kwh || "-"} kWh</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground">Tarifa</p>
                      <p className="text-lg font-bold">R$ {(client.energy_tariff || settings?.default_tariff || 0.85).toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground">Lei 14.300</p>
                      <p className="text-lg font-bold">{((settings?.lei_14300_factor || 0.85) * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Comparison Table */}
                  {displaySimulations.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Cenário</th>
                            <th className="text-right p-2">Valor</th>
                            <th className="text-right p-2">Parcela</th>
                            <th className="text-right p-2">Taxa</th>
                            <th className="text-right p-2">Juros Totais</th>
                            <th className="text-right p-2">Fluxo</th>
                            <th className="text-right p-2">Payback</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displaySimulations.map((sim) => (
                            <tr key={sim.id} className="border-b">
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  {sim.name || `v${sim.version}`}
                                  {sim.is_favorite && (
                                    <Badge variant="outline" className="text-xs">
                                      ⭐
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="text-right p-2">{formatCurrency(sim.system_value)}</td>
                              <td className="text-right p-2">
                                {sim.installment_value
                                  ? `${sim.installments}x ${formatCurrency(sim.installment_value)}`
                                  : "-"}
                              </td>
                              <td className="text-right p-2">
                                {sim.detected_monthly_rate !== undefined
                                  ? formatPercent(sim.detected_monthly_rate)
                                  : "-"}
                              </td>
                              <td className="text-right p-2 text-solo-danger">
                                {sim.total_interest_paid !== undefined
                                  ? formatCurrency(sim.total_interest_paid)
                                  : "-"}
                              </td>
                              <td
                                className={`text-right p-2 ${
                                  (sim.monthly_cashflow || 0) >= 0
                                    ? "text-solo-success"
                                    : "text-solo-danger"
                                }`}
                              >
                                {sim.monthly_cashflow !== undefined
                                  ? formatCurrency(sim.monthly_cashflow)
                                  : "-"}
                              </td>
                              <td className="text-right p-2">
                                {formatPayback(sim.payback_months)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Technical Notes */}
                  <div className="p-4 rounded-lg bg-muted/30 text-sm space-y-2">
                    <p>
                      <strong>Metodologia:</strong> Taxa mensal detectada via Newton-Raphson
                    </p>
                    <p>
                      <strong>Lei 14.300:</strong> Fator de compensação aplicado:{" "}
                      {((settings?.lei_14300_factor || 0.85) * 100).toFixed(0)}%
                    </p>
                    <p>
                      <strong>Tarifa considerada:</strong> R${" "}
                      {(client.energy_tariff || settings?.default_tariff || 0.85).toFixed(2)}/kWh
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                    <p>Relatório gerado em {new Date().toLocaleDateString("pt-BR")}</p>
                    {settings?.company_name && <p>{settings.company_name}</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Export Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={generatePDF} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir / PDF
            </Button>
            <Button variant="outline" onClick={generateShareableLink} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado!" : "Copiar Proposta"}
            </Button>
            <Button variant="outline" onClick={generateWhatsAppCard} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Enviar WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
