import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/financial";
import { Zap, TrendingDown, Shield, ArrowRight } from "lucide-react";

interface LCOEIndicatorProps {
  currentTariff: number; // Current energy tariff R$/kWh
  solarLCOE: number; // Levelized Cost of Energy with solar
  systemLifetimeYears?: number;
}

export function LCOEIndicator({
  currentTariff,
  solarLCOE,
  systemLifetimeYears = 25,
}: LCOEIndicatorProps) {
  const savingsPercent = ((currentTariff - solarLCOE) / currentTariff) * 100;
  const isSignificantSavings = savingsPercent > 50;

  return (
    <Card className="border-2 border-solo-success/30 bg-gradient-to-br from-card to-solo-success/5">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-solo-success/10">
            <TrendingDown className="h-5 w-5 text-solo-success" />
          </div>
          <div>
            <h3 className="font-semibold">Custo Nivelado de Energia (LCOE)</h3>
            <p className="text-xs text-muted-foreground">Comparativo de custo por kWh</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Current Tariff */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Zap className="h-4 w-4 text-solo-danger" />
              <span>Sua energia hoje</span>
            </div>
            <div className="text-3xl font-bold text-solo-danger">
              R$ {currentTariff.toFixed(2)}
              <span className="text-lg font-normal text-muted-foreground">/kWh</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tarifa da concessionária (sujeita a reajustes anuais)
            </p>
          </div>

          {/* Solar LCOE */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Shield className="h-4 w-4 text-solo-success" />
              <span>Sua energia solar</span>
            </div>
            <div className="text-3xl font-bold text-solo-success">
              R$ {solarLCOE.toFixed(2)}
              <span className="text-lg font-normal text-muted-foreground">/kWh</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Custo médio em {systemLifetimeYears} anos (fixo)
            </p>
          </div>
        </div>

        {/* Savings highlight */}
        <div className="mt-6 p-4 rounded-lg bg-solo-success/10 border border-solo-success/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-solo-success/20 flex items-center justify-center">
                <span className="text-xl font-bold text-solo-success">
                  {savingsPercent.toFixed(0)}%
                </span>
              </div>
              <div>
                <p className="font-semibold">
                  {isSignificantSavings ? "Economia significativa" : "Economia"}
                </p>
                <p className="text-sm text-muted-foreground">
                  em relação à tarifa atual
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-solo-success" />
          </div>
        </div>

        {/* Key message */}
        <p className="mt-4 text-sm text-center text-muted-foreground border-t border-border pt-4">
          <strong className="text-foreground">Energia mais barata, previsível e protegida da inflação.</strong>
        </p>
      </CardContent>
    </Card>
  );
}