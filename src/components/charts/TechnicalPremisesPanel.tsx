import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Settings2, 
  Sun, 
  TrendingUp, 
  Wrench, 
  Calendar,
  Info,
  Percent
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TechnicalPremisesPanelProps {
  degradationRate: number;
  tariffIncreaseRate: number;
  maintenanceCostPercent: number;
  inverterReplacementYear: number;
  lei14300Factor: number;
  onUpdate: (premises: Partial<TechnicalPremisesPanelProps>) => void;
  readOnly?: boolean;
}

interface PremiseRowProps {
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}

function PremiseRow({ 
  icon, 
  label, 
  tooltip, 
  value, 
  unit, 
  min = 0, 
  max = 100, 
  step = 0.1,
  onChange,
  readOnly = false 
}: PremiseRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-md bg-muted">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[250px]">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {readOnly ? (
          <span className="text-sm font-mono">
            {value.toFixed(step < 1 ? 1 : 0)}{unit}
          </span>
        ) : (
          <>
            <Slider
              value={[value]}
              onValueChange={(v) => onChange?.(v[0])}
              min={min}
              max={max}
              step={step}
              className="w-24"
            />
            <span className="text-sm font-mono w-16 text-right">
              {value.toFixed(step < 1 ? 1 : 0)}{unit}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function TechnicalPremisesPanel({
  degradationRate,
  tariffIncreaseRate,
  maintenanceCostPercent,
  inverterReplacementYear,
  lei14300Factor,
  onUpdate,
  readOnly = false,
}: TechnicalPremisesPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Premissas Técnicas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Transparência como argumento de venda — todos os parâmetros são auditáveis
        </p>
      </CardHeader>
      <CardContent className="space-y-1">
        <PremiseRow
          icon={<Sun className="h-4 w-4 text-solo-warning" />}
          label="Degradação dos Painéis"
          tooltip="Perda anual de eficiência dos módulos fotovoltaicos. A média do mercado é de 0,5% ao ano, garantindo 80% de eficiência após 25 anos."
          value={degradationRate}
          unit="% a.a."
          min={0.3}
          max={1.0}
          step={0.1}
          onChange={(v) => onUpdate({ degradationRate: v })}
          readOnly={readOnly}
        />
        
        <PremiseRow
          icon={<TrendingUp className="h-4 w-4 text-solo-danger" />}
          label="Inflação Energética"
          tooltip="Projeção de reajuste anual da tarifa de energia. Historicamente, a tarifa sobe entre 7% e 12% ao ano no Brasil."
          value={tariffIncreaseRate}
          unit="% a.a."
          min={3}
          max={15}
          step={0.5}
          onChange={(v) => onUpdate({ tariffIncreaseRate: v })}
          readOnly={readOnly}
        />
        
        <PremiseRow
          icon={<Wrench className="h-4 w-4 text-muted-foreground" />}
          label="Custo de Manutenção"
          tooltip="Custo anual de manutenção preventiva, limpeza e monitoramento, como percentual do valor do sistema."
          value={maintenanceCostPercent}
          unit="% a.a."
          min={0}
          max={2}
          step={0.1}
          onChange={(v) => onUpdate({ maintenanceCostPercent: v })}
          readOnly={readOnly}
        />
        
        <PremiseRow
          icon={<Calendar className="h-4 w-4 text-primary" />}
          label="Troca do Inversor"
          tooltip="Ano estimado para substituição do inversor. A vida útil média é de 10-15 anos. O custo deve ser considerado no fluxo de caixa de longo prazo."
          value={inverterReplacementYear}
          unit="º ano"
          min={8}
          max={20}
          step={1}
          onChange={(v) => onUpdate({ inverterReplacementYear: v })}
          readOnly={readOnly}
        />
        
        <PremiseRow
          icon={<Percent className="h-4 w-4 text-solo-trust" />}
          label="Fator Lei 14.300 (Fio B)"
          tooltip="Percentual de compensação após a Lei 14.300. A partir de 2025, parte da geração não é mais 100% compensada devido à cobrança do Fio B."
          value={lei14300Factor * 100}
          unit="%"
          min={70}
          max={100}
          step={1}
          onChange={(v) => onUpdate({ lei14300Factor: v / 100 })}
          readOnly={readOnly}
        />

        {!readOnly && (
          <div className="pt-3 mt-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Ajuste os parâmetros para simular diferentes cenários.
              <br />
              Os valores padrão são conservadores e baseados em dados de mercado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}