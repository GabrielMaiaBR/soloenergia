/**
 * Reverse Calculator - Solo Smart v2.0
 * 
 * Calcula o sistema solar ideal baseado no orçamento mensal do cliente.
 * "Qual sistema cabe no meu bolso?"
 * 
 * @author Solo Smart Team
 */

import { getHSPByState, DEFAULT_HSP } from './solar-sizing';

// ============ Types ============

export interface ReverseCalcInput {
    /** Quanto o cliente pode pagar por mês (R$) */
    monthlyBudget: number;
    /** Tarifa atual de energia (R$/kWh) */
    energyTariff: number;
    /** Horas de Sol Pico ou código do estado para lookup automático */
    hspOrStateCode: number | string;
    /** Fator de compensação Lei 14.300 (default 0.85) */
    lei14300Factor?: number;
    /** Preço médio por kWp do sistema (default R$ 4.500) */
    systemPricePerKwp?: number;
    /** Considerar cashflow positivo? Se true, orçamento = economia esperada */
    requirePositiveCashflow?: boolean;
}

export interface FinancingOption {
    /** Número de parcelas */
    installments: number;
    /** Taxa mensal estimada (%) */
    estimatedRate: number;
    /** Valor da parcela (R$) */
    installmentValue: number;
    /** Total pago ao final (R$) */
    totalPaid: number;
    /** Cashflow mensal = economia - parcela (R$) */
    monthlyCashflow: number;
    /** Classificação de viabilidade */
    viability: 'excellent' | 'good' | 'tight' | 'negative';
    /** Descrição da viabilidade */
    viabilityLabel: string;
    /** Anos até o payback */
    paybackYears: number;
    /** VPL (Valor Presente Líquido) em 25 anos */
    npv: number;
    /** Total de juros pagos */
    totalInterest: number;
}

/** Opção de pagamento à vista com desconto */
export interface CashOption {
    /** Valor original do sistema */
    originalValue: number;
    /** Desconto aplicado (%) */
    discountPercent: number;
    /** Valor com desconto (R$) */
    discountedValue: number;
    /** Economia pelo desconto (R$) */
    discountSavings: number;
    /** VPL (Valor Presente Líquido) em 25 anos */
    npv: number;
    /** Anos até o payback */
    paybackYears: number;
}

export interface SystemRecommendation {
    /** Potência recomendada (kWp) */
    powerKwp: number;
    /** Geração mensal estimada (kWh) */
    monthlyGenerationKwh: number;
    /** Valor estimado do sistema (R$) */
    estimatedSystemValue: number;
    /** Economia mensal estimada (R$) */
    monthlyEconomy: number;
    /** HSP utilizado no cálculo */
    hspUsed: number;
}

export interface ReverseCalcResult {
    /** Input processado */
    input: ReverseCalcInput;
    /** Recomendação de sistema */
    recommendation: SystemRecommendation;
    /** Opção de pagamento à vista */
    cashOption: CashOption;
    /** Opções de financiamento */
    financingOptions: FinancingOption[];
    /** Análise de cenários */
    scenarios: {
        /** Cashflow zero (parcela = economia) */
        cashflowZero: SystemRecommendation & { maxInstallmentValue: number };
        /** Cashflow positivo (sobra dinheiro todo mês) */
        cashflowPositive: SystemRecommendation & { targetCashflow: number };
    };
    /** Projeção de economia em 25 anos */
    longTermProjection: {
        totalSavings25Years: number;
        averageAnnualSavings: number;
        roi: number;
    };
}

// ============ Constants ============

/** Taxas médias de mercado por prazo (mercado brasileiro real) */
const MARKET_RATES: Record<number, number> = {
    12: 2.19,  // 12x - 2.19% a.m.
    24: 2.09,  // 24x - 2.09% a.m.
    36: 1.99,  // 36x - 1.99% a.m.
    48: 1.89,  // 48x - 1.89% a.m.
    60: 1.79,  // 60x - 1.79% a.m.
    72: 1.69,  // 72x - 1.69% a.m.
    84: 1.59,  // 84x - 1.59% a.m.
    96: 1.49,  // 96x - 1.49% a.m.
};

/** Preço médio por kWp instalado no Brasil */
const DEFAULT_PRICE_PER_KWP = 4500;

/** Prazos de financiamento disponíveis */
const FINANCING_TERMS = [24, 36, 48, 60, 72, 84, 96];

/** Desconto para pagamento à vista (%) */
const CASH_DISCOUNT_PERCENT = 5;

/** Taxa de desconto para cálculo de VPL (custo de oportunidade) */
const NPV_DISCOUNT_RATE = 0.01; // 1% a.m. (~ 12.68% a.a. - CDI)

/** Fator de performance do sistema (considera perdas) */
const SYSTEM_PERFORMANCE_FACTOR = 0.80;

/** Taxa de inflação energética anual para projeções */
const ENERGY_INFLATION_RATE = 0.08; // 8% a.a.

// ============ Core Functions ============

/**
 * Calcula o sistema solar ideal baseado no orçamento do cliente.
 * Esta é a função principal da calculadora reversa.
 */
export function calculateReverse(input: ReverseCalcInput): ReverseCalcResult {
    // Normalizar inputs
    const lei14300Factor = input.lei14300Factor ?? 0.85;
    const pricePerKwp = input.systemPricePerKwp ?? DEFAULT_PRICE_PER_KWP;

    // Resolver HSP
    const hsp = typeof input.hspOrStateCode === 'string'
        ? getHSPByState(input.hspOrStateCode)
        : input.hspOrStateCode || DEFAULT_HSP;

    // ===== Cenário 1: Cashflow Zero =====
    // Se orçamento = parcela, qual sistema gera economia = parcela?
    // economia = geração × tarifa × fator
    // geração = potência × HSP × 30 × performance
    // Derivando: potência = economia / (HSP × 30 × performance × tarifa × fator)

    const cashflowZeroEconomy = input.monthlyBudget;
    const cashflowZeroPower = calculatePowerFromEconomy(
        cashflowZeroEconomy,
        input.energyTariff,
        hsp,
        lei14300Factor
    );
    const cashflowZeroGen = calculateGeneration(cashflowZeroPower, hsp);
    const cashflowZeroValue = cashflowZeroPower * pricePerKwp;

    // ===== Cenário 2: Cashflow Positivo =====
    // Alvo: sobrar R$ 100/mês mínimo
    const targetCashflow = Math.min(100, input.monthlyBudget * 0.2);
    const cashflowPositiveEconomy = input.monthlyBudget + targetCashflow;
    const cashflowPositivePower = calculatePowerFromEconomy(
        cashflowPositiveEconomy,
        input.energyTariff,
        hsp,
        lei14300Factor
    );
    const cashflowPositiveGen = calculateGeneration(cashflowPositivePower, hsp);
    const cashflowPositiveValue = cashflowPositivePower * pricePerKwp;

    // ===== Recomendação Principal =====
    // Usamos o cenário de cashflow zero como recomendação padrão
    const recommendation: SystemRecommendation = {
        powerKwp: roundToDecimals(cashflowZeroPower, 2),
        monthlyGenerationKwh: Math.round(cashflowZeroGen),
        estimatedSystemValue: Math.round(cashflowZeroValue),
        monthlyEconomy: Math.round(cashflowZeroEconomy),
        hspUsed: hsp,
    };

    // ===== Opção à Vista =====
    const cashOption = calculateCashOption(
        recommendation.estimatedSystemValue,
        recommendation.monthlyEconomy,
        ENERGY_INFLATION_RATE
    );

    // ===== Opções de Financiamento =====
    const financingOptions = getFinancingOptions(
        recommendation.estimatedSystemValue,
        recommendation.monthlyEconomy,
        ENERGY_INFLATION_RATE
    );

    // ===== Projeção de Longo Prazo =====
    const longTermProjection = calculateLongTermProjection(
        recommendation.monthlyEconomy,
        recommendation.estimatedSystemValue,
        ENERGY_INFLATION_RATE,
        25
    );

    return {
        input,
        recommendation,
        cashOption,
        financingOptions,
        scenarios: {
            cashflowZero: {
                powerKwp: roundToDecimals(cashflowZeroPower, 2),
                monthlyGenerationKwh: Math.round(cashflowZeroGen),
                estimatedSystemValue: Math.round(cashflowZeroValue),
                monthlyEconomy: Math.round(cashflowZeroEconomy),
                hspUsed: hsp,
                maxInstallmentValue: Math.round(cashflowZeroEconomy),
            },
            cashflowPositive: {
                powerKwp: roundToDecimals(cashflowPositivePower, 2),
                monthlyGenerationKwh: Math.round(cashflowPositiveGen),
                estimatedSystemValue: Math.round(cashflowPositiveValue),
                monthlyEconomy: Math.round(cashflowPositiveEconomy),
                hspUsed: hsp,
                targetCashflow: Math.round(targetCashflow),
            },
        },
        longTermProjection,
    };
}

/**
 * Calcula opções de financiamento para um dado valor de sistema.
 */
export function getFinancingOptions(
    systemValue: number,
    monthlyEconomy: number,
    tariffInflation: number = 0.08
): FinancingOption[] {
    return FINANCING_TERMS.map(installments => {
        const rate = MARKET_RATES[installments] || 1.99;
        const installmentValue = calculateInstallmentValue(systemValue, rate / 100, installments);
        const totalPaid = installmentValue * installments;
        const totalInterest = totalPaid - systemValue;
        const monthlyCashflow = monthlyEconomy - installmentValue;

        // Calcular payback considerando inflação energética
        const paybackYears = calculatePaybackYears(
            totalPaid,
            monthlyEconomy,
            tariffInflation
        );

        // Classificar viabilidade
        const { viability, viabilityLabel } = classifyViability(monthlyCashflow, monthlyEconomy);

        // Calcular VPL para comparação neutra
        // Investimento = custo total (sistema + juros), retorno = economia mensal crescente
        const npv = calculateNPV(totalPaid, monthlyEconomy, tariffInflation, 25);

        return {
            installments,
            estimatedRate: rate,
            installmentValue: Math.round(installmentValue),
            totalPaid: Math.round(totalPaid),
            totalInterest: Math.round(totalInterest),
            monthlyCashflow: Math.round(monthlyCashflow),
            viability,
            viabilityLabel,
            paybackYears: roundToDecimals(paybackYears, 1),
            npv: Math.round(npv),
        };
    });
}

/**
 * Encontra o maior sistema que cabe em um orçamento mensal.
 */
export function findMaxSystemForBudget(
    monthlyBudget: number,
    energyTariff: number,
    hsp: number,
    lei14300Factor: number = 0.85,
    pricePerKwp: number = DEFAULT_PRICE_PER_KWP
): SystemRecommendation {
    // A parcela máxima é o orçamento
    // Precisamos encontrar um sistema onde:
    // economia mensal >= parcela

    const power = calculatePowerFromEconomy(
        monthlyBudget,
        energyTariff,
        hsp,
        lei14300Factor
    );

    const generation = calculateGeneration(power, hsp);
    const systemValue = power * pricePerKwp;
    const economy = monthlyBudget;

    return {
        powerKwp: roundToDecimals(power, 2),
        monthlyGenerationKwh: Math.round(generation),
        estimatedSystemValue: Math.round(systemValue),
        monthlyEconomy: Math.round(economy),
        hspUsed: hsp,
    };
}

// ============ Helper Functions ============

/**
 * Calcula potência necessária para gerar uma economia específica.
 */
function calculatePowerFromEconomy(
    targetEconomy: number,
    tariff: number,
    hsp: number,
    lei14300Factor: number
): number {
    // economia = geração × tarifa × fator
    // geração = potência × HSP × 30 × performance
    // economia = potência × HSP × 30 × performance × tarifa × fator
    // potência = economia / (HSP × 30 × performance × tarifa × fator)

    if (tariff <= 0 || hsp <= 0) return 0;

    return targetEconomy / (hsp * 30 * SYSTEM_PERFORMANCE_FACTOR * tariff * lei14300Factor);
}

/**
 * Calcula geração mensal esperada.
 */
function calculateGeneration(powerKwp: number, hsp: number): number {
    return powerKwp * hsp * 30 * SYSTEM_PERFORMANCE_FACTOR;
}

/**
 * Calcula valor da parcela usando fórmula Price.
 */
function calculateInstallmentValue(
    principal: number,
    monthlyRate: number,
    installments: number
): number {
    if (monthlyRate === 0) {
        return principal / installments;
    }

    const factor = Math.pow(1 + monthlyRate, installments);
    return principal * (monthlyRate * factor) / (factor - 1);
}

/**
 * Calcula anos até o payback considerando inflação energética.
 */
function calculatePaybackYears(
    totalCost: number,
    monthlyEconomy: number,
    annualInflation: number
): number {
    if (monthlyEconomy <= 0) return Infinity;

    let accumulated = 0;
    let currentMonthlyEconomy = monthlyEconomy;
    const monthlyInflation = Math.pow(1 + annualInflation, 1 / 12) - 1;

    for (let month = 1; month <= 300; month++) { // Max 25 anos
        accumulated += currentMonthlyEconomy;
        if (accumulated >= totalCost) {
            return month / 12;
        }
        currentMonthlyEconomy *= (1 + monthlyInflation);
    }

    return 25; // Cap at 25 years
}

/**
 * Calcula o Valor Presente Líquido (VPL/NPV) de um investimento em solar.
 * VPL = Σ(economia_futura / (1 + taxa)^mês) - investimento_inicial
 * 
 * @param initialInvestment - Valor do investimento inicial (custo do sistema + juros)
 * @param monthlyEconomy - Economia mensal inicial
 * @param energyInflation - Inflação energética anual
 * @param years - Período de análise em anos
 * @param discountRate - Taxa de desconto mensal (custo de oportunidade)
 */
function calculateNPV(
    initialInvestment: number,
    monthlyEconomy: number,
    energyInflation: number,
    years: number = 25,
    discountRate: number = NPV_DISCOUNT_RATE
): number {
    const monthlyInflation = Math.pow(1 + energyInflation, 1 / 12) - 1;
    let npv = -initialInvestment;
    let currentMonthlyEconomy = monthlyEconomy;

    for (let month = 1; month <= years * 12; month++) {
        // Economia ajustada pela inflação / (1 + taxa)^mês
        npv += currentMonthlyEconomy / Math.pow(1 + discountRate, month);
        currentMonthlyEconomy *= (1 + monthlyInflation);
    }

    return npv;
}

/**
 * Calcula a opção de pagamento à vista com desconto.
 */
function calculateCashOption(
    systemValue: number,
    monthlyEconomy: number,
    energyInflation: number
): CashOption {
    const discountedValue = systemValue * (1 - CASH_DISCOUNT_PERCENT / 100);
    const discountSavings = systemValue - discountedValue;

    // Payback para pagamento à vista
    const paybackYears = calculatePaybackYears(discountedValue, monthlyEconomy, energyInflation);

    // VPL considerando que todo o investimento é feito no mês 0
    const npv = calculateNPV(discountedValue, monthlyEconomy, energyInflation, 25);

    return {
        originalValue: Math.round(systemValue),
        discountPercent: CASH_DISCOUNT_PERCENT,
        discountedValue: Math.round(discountedValue),
        discountSavings: Math.round(discountSavings),
        npv: Math.round(npv),
        paybackYears: roundToDecimals(paybackYears, 1),
    };
}

/**
 * Classifica a viabilidade do financiamento.
 */
function classifyViability(
    monthlyCashflow: number,
    monthlyEconomy: number
): { viability: FinancingOption['viability']; viabilityLabel: string } {
    const ratio = monthlyCashflow / Math.max(monthlyEconomy, 1);

    if (monthlyCashflow >= 100 || ratio >= 0.15) {
        return { viability: 'excellent', viabilityLabel: 'Excelente - Sobra dinheiro' };
    }
    if (monthlyCashflow >= 0) {
        return { viability: 'good', viabilityLabel: 'Bom - Se paga sozinho' };
    }
    if (monthlyCashflow >= -100) {
        return { viability: 'tight', viabilityLabel: 'Apertado - Pequeno desembolso' };
    }
    return { viability: 'negative', viabilityLabel: 'Negativo - Alto desembolso' };
}

/**
 * Calcula projeção de economia em longo prazo.
 */
function calculateLongTermProjection(
    monthlyEconomy: number,
    systemValue: number,
    annualInflation: number,
    years: number
): ReverseCalcResult['longTermProjection'] {
    let totalSavings = 0;
    let currentAnnualEconomy = monthlyEconomy * 12;

    for (let year = 1; year <= years; year++) {
        totalSavings += currentAnnualEconomy;
        currentAnnualEconomy *= (1 + annualInflation);
    }

    const averageAnnualSavings = totalSavings / years;
    const roi = systemValue > 0 ? ((totalSavings - systemValue) / systemValue) * 100 : 0;

    return {
        totalSavings25Years: Math.round(totalSavings),
        averageAnnualSavings: Math.round(averageAnnualSavings),
        roi: roundToDecimals(roi, 1),
    };
}

/**
 * Arredonda para N casas decimais.
 */
function roundToDecimals(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

// ============ Utility Exports ============

export const AVAILABLE_TERMS = FINANCING_TERMS;
export const DEFAULT_SYSTEM_PRICE_PER_KWP = DEFAULT_PRICE_PER_KWP;
export const MARKET_FINANCING_RATES = MARKET_RATES;
export const CASH_DISCOUNT = CASH_DISCOUNT_PERCENT;
