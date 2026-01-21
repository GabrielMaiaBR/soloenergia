import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/financial";
import { 
  Calendar, 
  TrendingUp, 
  PiggyBank, 
  Zap,
  ArrowUpRight,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProposalKPIsProps {
  paybackYears: number;
  paybackMonths: number;
  crossoverYear: number;
  accumulatedSavings25Years: number;
  monthlyEconomy: number;
  lcoe: number;
  currentTariff: number;
  systemValue: number;
}

export function ProposalKPIs({
  paybackYears,
  paybackMonths,
  crossoverYear,
  accumulatedSavings25Years,
  monthlyEconomy,
  lcoe,
  currentTariff,
  systemValue,
}: ProposalKPIsProps) {
  const paybackDisplay = paybackYears === 0 
    ? `${paybackMonths} meses`
    : paybackMonths === 0 
      ? `${paybackYears} anos`
      : `${paybackYears} anos e ${paybackMonths} meses`;

  const roi = ((accumulatedSavings25Years - systemValue) / systemValue) * 100;

  return (
    <div className="space-y-4">
      {/* Main CTA Card */}
      <Card className="border-2 border-solo-success/40 bg-gradient-to-br from-solo-success/10 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Resultado da Análise
              </p>
              <h2 className="text-2xl font-bold mt-1">
                Esta proposta se paga em{" "}
                <span className="text-solo-success">{paybackDisplay}</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                A partir do ano {crossoverYear}, o projeto gera fluxo de caixa positivo
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-solo-success/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-solo-success" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          icon={<Calendar className="h-5 w-5" />}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          label="Payback Real"
          value={paybackDisplay}
          sublabel="Com degradação e inflação"
        />
        
        <KPICard
          icon={<ArrowUpRight className="h-5 w-5" />}
          iconBg="bg-solo-success/10"
          iconColor="text-solo-success"
          label="Crossover"
          value={`Ano ${crossoverYear}`}
          sublabel="Fluxo negativo → positivo"
        />
        
        <KPICard
          icon={<PiggyBank className="h-5 w-5" />}
          iconBg="bg-solo-success/10"
          iconColor="text-solo-success"
          label="Economia em 25 anos"
          value={formatCurrency(accumulatedSavings25Years)}
          sublabel={`ROI de ${roi.toFixed(0)}%`}
        />
        
        <KPICard
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          label="Economia Mensal"
          value={formatCurrency(monthlyEconomy)}
          sublabel="Economia cresce com a inflação"
        />
      </div>

      {/* LCOE comparison strip */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-solo-danger" />
          <div>
            <p className="text-sm text-muted-foreground">Energia concessionária</p>
            <p className="font-semibold text-solo-danger">R$ {currentTariff.toFixed(2)}/kWh</p>
          </div>
        </div>
        
        <div className="h-8 w-px bg-border" />
        
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-solo-success" />
          <div>
            <p className="text-sm text-muted-foreground">Energia solar (LCOE)</p>
            <p className="font-semibold text-solo-success">R$ {lcoe.toFixed(2)}/kWh</p>
          </div>
        </div>
        
        <div className="h-8 w-px bg-border" />
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Economia por kWh</p>
          <p className="font-bold text-solo-success">
            {(((currentTariff - lcoe) / currentTariff) * 100).toFixed(0)}% mais barato
          </p>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sublabel: string;
}

function KPICard({ icon, iconBg, iconColor, label, value, sublabel }: KPICardProps) {
  return (
    <Card className="transition-solo hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", iconBg)}>
            <span className={iconColor}>{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wide truncate">
              {label}
            </p>
            <p className="text-lg font-bold mt-0.5 truncate">{value}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{sublabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}