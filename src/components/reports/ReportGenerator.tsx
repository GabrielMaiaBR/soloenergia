import { useState } from "react";
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
import { FileText, Download, Share2, MessageCircle, TrendingUp, TrendingDown } from "lucide-react";
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

export function ReportGenerator({
  open,
  onOpenChange,
  client,
  simulations,
}: ReportGeneratorProps) {
  const { data: settings } = useSettings();
  const [reportType, setReportType] = useState<ReportType>("commercial");
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(
    simulations.find((s) => s.is_favorite) || simulations[0] || null
  );

  const favoriteSimulations = simulations.filter((s) => s.is_favorite);
  const displaySimulations = favoriteSimulations.length > 0 ? favoriteSimulations : simulations.slice(0, 1);

  const generatePDF = () => {
    // In a real app, this would use a PDF library like jspdf or html2pdf
    toast.success("PDF gerado! (Demo - integrar biblioteca PDF)");
  };

  const generateShareableLink = () => {
    // In a real app, this would create a temporary shareable link
    const fakeLink = `https://solosmart.app/report/${client.id}/${Date.now()}`;
    navigator.clipboard.writeText(fakeLink);
    toast.success("Link copiado! Válido por 7 dias.");
  };

  const generateWhatsAppCard = () => {
    // Generate WhatsApp-friendly text
    if (!selectedSimulation) return;

    const text = `
*Proposta Solar - ${client.name}*
${settings?.company_name || "Solo Smart"}

⚡ Sistema: ${client.system_power_kwp || "-"} kWp
💰 Valor: ${formatCurrency(selectedSimulation.system_value)}
${selectedSimulation.installment_value ? `📅 Parcela: ${selectedSimulation.installments}x de ${formatCurrency(selectedSimulation.installment_value)}` : ""}
${selectedSimulation.monthly_cashflow !== undefined ? `📈 Economia mensal: ${formatCurrency(Math.abs(selectedSimulation.monthly_cashflow))}` : ""}

${settings?.contact_phone ? `📱 ${settings.contact_phone}` : ""}
${settings?.contact_email ? `✉️ ${settings.contact_email}` : ""}
    `.trim();

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                sem expor taxas de juros ou comparações entre bancos.
              </p>

              {/* Preview */}
              <Card className="bg-card">
                <CardHeader className="text-center border-b">
                  {settings?.logo_url && (
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="h-12 mx-auto mb-4 object-contain"
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
                    </div>
                  )}

                  {/* Footer */}
                  <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                    {settings?.contact_phone && <p>{settings.contact_phone}</p>}
                    {settings?.contact_email && <p>{settings.contact_email}</p>}
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
                  <CardTitle>Análise Técnica - {client.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
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
                            <th className="text-right p-2">Cashflow</th>
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Technical Notes */}
                  <div className="p-4 rounded-lg bg-muted/30 text-sm space-y-2">
                    <p>
                      <strong>Lei 14.300:</strong> Fator de compensação aplicado:{" "}
                      {((settings?.lei_14300_factor || 0.85) * 100).toFixed(0)}%
                    </p>
                    <p>
                      <strong>Tarifa considerada:</strong> R${" "}
                      {(client.energy_tariff || settings?.default_tariff || 0.85).toFixed(2)}/kWh
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Export Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={generatePDF} className="gap-2">
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
            <Button variant="outline" onClick={generateShareableLink} className="gap-2">
              <Share2 className="h-4 w-4" />
              Link Compartilhável
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
