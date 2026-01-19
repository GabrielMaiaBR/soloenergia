import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Star, 
  FileText, 
  Plus,
  BarChart3
} from "lucide-react";

// Temporary mock data
const mockClient = {
  id: "1",
  name: "João Silva",
  phone: "(11) 99999-1234",
  status: "analysis" as const,
  system_power_kwp: 8.5,
  monthly_generation_kwh: 1100,
  energy_tariff: 0.85,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function ClientCockpit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // TODO: Fetch client from database
  const client = mockClient;

  // Calculate economy with Lei 14.300 (85% factor)
  const lei14300Factor = 0.85;
  const monthlyEconomy = (client.monthly_generation_kwh || 0) * lei14300Factor * (client.energy_tariff || 0);

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
            <div className="text-2xl font-bold">{client.system_power_kwp} kWp</div>
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
            <div className="text-2xl font-bold">{client.monthly_generation_kwh} kWh</div>
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
              R$ {monthlyEconomy.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Com Lei 14.300 ({(lei14300Factor * 100).toFixed(0)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="transition-solo">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tarifa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {client.energy_tariff?.toFixed(2)}/kWh
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
        <Button className="gap-2 h-auto py-4 flex-col">
          <Plus className="h-5 w-5" />
          Nova Simulação
        </Button>
        <Button variant="outline" className="gap-2 h-auto py-4 flex-col">
          <BarChart3 className="h-5 w-5" />
          Comparar
        </Button>
        <Button variant="outline" className="gap-2 h-auto py-4 flex-col">
          <Star className="h-5 w-5" />
          Favoritas
        </Button>
        <Button variant="outline" className="gap-2 h-auto py-4 flex-col">
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
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma simulação criada ainda.</p>
            <p className="text-sm mt-2">Clique em "Nova Simulação" para começar.</p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline / Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma nota registrada.</p>
            <p className="text-sm mt-2">Registre objeções, preferências e alertas importantes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
