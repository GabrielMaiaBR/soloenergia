import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calculator, MapPin, Sun, Zap, Info, RefreshCw } from "lucide-react";
import {
    calculateRequiredPower,
    calculateExpectedGeneration,
    getAllStates,
    getHSPByState,
    DEFAULT_HSP,
} from "@/lib/solar-sizing";
import { cn } from "@/lib/utils";

interface SolarSizingPanelProps {
    // Input values
    monthlyConsumption?: number;
    stateCode?: string;
    // Current system values
    currentPowerKwp?: number;
    currentGenerationKwh?: number;
    // Callbacks
    onCalculate?: (result: SizingResult) => void;
    onApply?: (result: SizingResult) => void;
    // Mode
    compact?: boolean;
}

export interface SizingResult {
    recommendedPowerKwp: number;
    expectedGenerationKwh: number;
    hspUsed: number;
    stateCode?: string;
}

const states = getAllStates();

export function SolarSizingPanel({
    monthlyConsumption: initialConsumption,
    stateCode: initialState,
    currentPowerKwp,
    currentGenerationKwh,
    onCalculate,
    onApply,
    compact = false,
}: SolarSizingPanelProps) {
    const [consumption, setConsumption] = useState(initialConsumption?.toString() || "");
    const [selectedState, setSelectedState] = useState(initialState || "");
    const [customHSP, setCustomHSP] = useState<string>("");
    const [useCustomHSP, setUseCustomHSP] = useState(false);

    // Get HSP based on selection
    const hsp = useMemo(() => {
        if (useCustomHSP && customHSP) {
            return parseFloat(customHSP) || DEFAULT_HSP;
        }
        if (selectedState) {
            return getHSPByState(selectedState);
        }
        return DEFAULT_HSP;
    }, [selectedState, customHSP, useCustomHSP]);

    // Calculate result
    const result = useMemo((): SizingResult | null => {
        const consumptionValue = parseFloat(consumption);
        if (!consumptionValue || consumptionValue <= 0) return null;

        const recommendedPowerKwp = calculateRequiredPower(consumptionValue, hsp);
        const expectedGenerationKwh = calculateExpectedGeneration(recommendedPowerKwp, hsp);

        return {
            recommendedPowerKwp,
            expectedGenerationKwh,
            hspUsed: hsp,
            stateCode: selectedState || undefined,
        };
    }, [consumption, hsp, selectedState]);

    // Notify parent of calculation
    useEffect(() => {
        if (result && onCalculate) {
            onCalculate(result);
        }
    }, [result, onCalculate]);

    const handleApply = () => {
        if (result && onApply) {
            onApply(result);
        }
    };

    // Sync with initial values when they change
    useEffect(() => {
        if (initialConsumption !== undefined) {
            setConsumption(initialConsumption.toString());
        }
    }, [initialConsumption]);

    useEffect(() => {
        if (initialState) {
            setSelectedState(initialState);
        }
    }, [initialState]);

    if (compact) {
        return (
            <TooltipProvider>
                <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Calculator className="h-4 w-4 text-primary" />
                        Dimensionamento Rápido
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Consumo (kWh/mês)</Label>
                            <Input
                                type="number"
                                value={consumption}
                                onChange={(e) => setConsumption(e.target.value)}
                                placeholder="500"
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Estado</Label>
                            <Select value={selectedState} onValueChange={setSelectedState}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="UF" />
                                </SelectTrigger>
                                <SelectContent>
                                    {states.map((state) => (
                                        <SelectItem key={state.code} value={state.code}>
                                            {state.code} ({state.hsp}h)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {result && (
                        <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-sm">
                                <span className="text-muted-foreground">Potência: </span>
                                <span className="font-semibold text-primary">{result.recommendedPowerKwp} kWp</span>
                            </div>
                            {onApply && (
                                <Button size="sm" variant="outline" onClick={handleApply}>
                                    Aplicar
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </TooltipProvider>
        );
    }

    return (
        <TooltipProvider>
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Dimensionamento Solar
                    </CardTitle>
                    <CardDescription>
                        Calcule a potência ideal baseado no consumo do cliente
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Input Section */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Consumption */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="consumption">Consumo Mensal (kWh)</Label>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p>Média de consumo mensal do cliente, obtida na conta de luz.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="relative">
                                <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="consumption"
                                    type="number"
                                    value={consumption}
                                    onChange={(e) => setConsumption(e.target.value)}
                                    placeholder="Ex: 500"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* State Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>Localização</Label>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p>Selecione o estado para usar o HSP (Horas de Sol Pico) da região.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Select value={selectedState} onValueChange={setSelectedState}>
                                        <SelectTrigger className="pl-9">
                                            <SelectValue placeholder="Selecione o estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {states.map((state) => (
                                                <SelectItem key={state.code} value={state.code}>
                                                    {state.name} - {state.hsp}h HSP
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HSP Info / Custom */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            <Sun className="h-5 w-5 text-solo-warning" />
                            <div>
                                <p className="text-sm font-medium">HSP Utilizado</p>
                                <p className="text-xs text-muted-foreground">Horas de Sol Pico</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {useCustomHSP ? (
                                <Input
                                    type="number"
                                    value={customHSP}
                                    onChange={(e) => setCustomHSP(e.target.value)}
                                    placeholder="4.5"
                                    className="w-20 h-8 text-center"
                                    step="0.1"
                                    min="3"
                                    max="7"
                                />
                            ) : (
                                <Badge variant="secondary" className="text-lg px-3">
                                    {hsp.toFixed(1)}h
                                </Badge>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setUseCustomHSP(!useCustomHSP)}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Zap className="h-4 w-4 text-primary" />
                                Resultado do Dimensionamento
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Recommended Power */}
                                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                    <div className="text-sm text-muted-foreground mb-1">Potência Recomendada</div>
                                    <div className="text-3xl font-bold text-primary">
                                        {result.recommendedPowerKwp} <span className="text-lg font-normal">kWp</span>
                                    </div>
                                    {currentPowerKwp && currentPowerKwp !== result.recommendedPowerKwp && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Atual: {currentPowerKwp} kWp
                                            {result.recommendedPowerKwp > currentPowerKwp ? (
                                                <span className="text-solo-warning"> (+{(result.recommendedPowerKwp - currentPowerKwp).toFixed(2)})</span>
                                            ) : (
                                                <span className="text-solo-success"> ({(result.recommendedPowerKwp - currentPowerKwp).toFixed(2)})</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Expected Generation */}
                                <div className="p-4 rounded-lg bg-solo-success/5 border border-solo-success/20">
                                    <div className="text-sm text-muted-foreground mb-1">Geração Estimada</div>
                                    <div className="text-3xl font-bold text-solo-success">
                                        {result.expectedGenerationKwh} <span className="text-lg font-normal">kWh/mês</span>
                                    </div>
                                    {currentGenerationKwh && currentGenerationKwh !== result.expectedGenerationKwh && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Atual: {currentGenerationKwh} kWh
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Apply Button */}
                            {onApply && (
                                <Button onClick={handleApply} className="w-full gap-2">
                                    <Zap className="h-4 w-4" />
                                    Aplicar Dimensionamento
                                </Button>
                            )}
                        </div>
                    )}

                    {!result && consumption && (
                        <div className="text-center py-4 text-muted-foreground">
                            <p className="text-sm">Insira um consumo válido para calcular</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
