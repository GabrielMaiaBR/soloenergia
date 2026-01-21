/**
 * Testes dos cálculos financeiros do Solo Smart
 * 
 * Estes testes garantem a precisão matemática das funções críticas
 * que afetam as decisões financeiras dos clientes.
 */

import { describe, it, expect } from 'vitest';
import {
    detectMonthlyRate,
    calculatePayback,
    calculateRealEconomy,
    calculateCashflow,
    calculateInstallment,
    getRateSemaphore,
    calculateROI,
    calculateLCOE,
    calculateDetailedPayback,
    formatCurrency,
    formatPercent,
} from '@/lib/financial';

describe('detectMonthlyRate - Detecção de Taxa (Newton-Raphson)', () => {
    it('deve retornar 0 para pagamento sem juros', () => {
        // R$ 30.000 em 60x de R$ 500 = exatamente o valor financiado
        const result = detectMonthlyRate(30000, 60, 500);
        expect(result.monthly_rate).toBe(0);
        expect(result.semaphore).toBe('excellent');
        expect(result.total_interest).toBe(0);
    });

    it('deve detectar taxa aproximada de 1% a.m.', () => {
        // Usando fórmula Price inversa para validar
        // PV = 30000, n = 48, i = 1% -> PMT ≈ 789.91
        const result = detectMonthlyRate(30000, 48, 789.91);
        expect(result.monthly_rate).toBeCloseTo(1.0, 1);
        expect(result.semaphore).toBe('excellent');
    });

    it('deve detectar taxa aproximada de 1.8% a.m.', () => {
        // Um financiamento solar típico
        // PV = 30000, n = 60, i = 1.8% -> PMT ≈ 814.46
        const result = detectMonthlyRate(30000, 60, 814.46);
        expect(result.monthly_rate).toBeCloseTo(1.8, 1);
        expect(result.semaphore).toBe('average');
    });

    it('deve detectar taxa alta (2.5% a.m.)', () => {
        // Financiamento caro
        // PV = 30000, n = 48, i = 2.5% -> PMT ≈ 990.30
        const result = detectMonthlyRate(30000, 48, 990.30);
        expect(result.monthly_rate).toBeCloseTo(2.5, 1);
        expect(result.semaphore).toBe('expensive');
    });

    it('deve lidar com entradas zeradas', () => {
        const result = detectMonthlyRate(0, 0, 0);
        expect(result.monthly_rate).toBe(0);
        expect(result.total_interest).toBe(0);
    });

    it('deve lidar com valores negativos graciosamente', () => {
        const result = detectMonthlyRate(-1000, 12, 100);
        expect(result.monthly_rate).toBe(0);
    });

    it('deve calcular taxa anual corretamente (composição)', () => {
        // 1% a.m. = (1.01)^12 - 1 = 12.68% a.a.
        const result = detectMonthlyRate(30000, 48, 789.91);
        expect(result.annual_rate).toBeCloseTo(12.68, 0);
    });

    it('deve calcular juros totais corretamente', () => {
        // 30000 em 60x de 800 = 48000 total, juros = 18000
        const result = detectMonthlyRate(30000, 60, 800);
        expect(result.total_interest).toBeCloseTo(18000, 0);
    });
});

describe('calculateInstallment - Cálculo de Parcela', () => {
    it('deve calcular parcela sem juros', () => {
        const pmt = calculateInstallment(30000, 0, 60);
        expect(pmt).toBeCloseTo(500, 2);
    });

    it('deve calcular parcela com 1% a.m. (Price)', () => {
        // Fórmula Price: PMT = PV * [i(1+i)^n] / [(1+i)^n - 1]
        const pmt = calculateInstallment(30000, 1, 48);
        expect(pmt).toBeCloseTo(789.91, 0);
    });

    it('deve calcular parcela com 2% a.m.', () => {
        const pmt = calculateInstallment(30000, 2, 36);
        expect(pmt).toBeCloseTo(1177.86, 0);
    });
});

describe('calculateRealEconomy - Economia com Lei 14.300', () => {
    it('deve calcular economia sem desconto (100%)', () => {
        const economy = calculateRealEconomy(1000, 0.85, 1.0);
        expect(economy).toBeCloseTo(850, 2);
    });

    it('deve calcular economia com 85% de compensação', () => {
        const economy = calculateRealEconomy(1000, 0.85, 0.85);
        expect(economy).toBeCloseTo(722.50, 2);
    });

    it('deve calcular economia com 72% de compensação', () => {
        const economy = calculateRealEconomy(1000, 0.90, 0.72);
        expect(economy).toBeCloseTo(648, 2);
    });

    it('deve lidar com zero kWh', () => {
        const economy = calculateRealEconomy(0, 0.85, 0.85);
        expect(economy).toBe(0);
    });
});

describe('calculateCashflow - Fluxo de Caixa Mensal', () => {
    it('deve calcular fluxo positivo', () => {
        const result = calculateCashflow(700, 500);
        expect(result.monthly_cashflow).toBe(200);
        expect(result.is_positive).toBe(true);
    });

    it('deve calcular fluxo negativo', () => {
        const result = calculateCashflow(500, 700);
        expect(result.monthly_cashflow).toBe(-200);
        expect(result.is_positive).toBe(false);
    });

    it('deve calcular fluxo zero (break-even)', () => {
        const result = calculateCashflow(500, 500);
        expect(result.monthly_cashflow).toBe(0);
        expect(result.is_positive).toBe(true);
    });
});

describe('calculatePayback - Tempo de Retorno', () => {
    it('deve calcular payback simples sem reajuste', () => {
        // R$ 30.000 / R$ 500/mês = 60 meses
        const result = calculatePayback(30000, 500, 0);
        expect(result.months).toBe(60);
        expect(result.years).toBe(5);
        expect(result.display).toBe('5 anos');
    });

    it('deve calcular payback com reajuste de tarifa', () => {
        // Com 8% a.a. de reajuste, payback diminui
        const result = calculatePayback(30000, 500, 8);
        expect(result.months).toBeLessThan(60);
    });

    it('deve retornar N/A para economia zero', () => {
        const result = calculatePayback(30000, 0, 0);
        expect(result.months).toBe(Infinity);
        expect(result.display).toBe('N/A');
    });

    it('deve formatar payback anos/meses corretamente', () => {
        const result = calculatePayback(31000, 500, 0);
        expect(result.months).toBe(62);
        expect(result.display).toBe('5 anos e 2 meses');
    });

    it('deve formatar payback só meses', () => {
        const result = calculatePayback(5000, 500, 0);
        expect(result.months).toBe(10);
        expect(result.display).toBe('10 meses');
    });
});

describe('calculateDetailedPayback - Payback com Financiamento', () => {
    it('deve calcular payback considerando período de financiamento', () => {
        const result = calculateDetailedPayback(30000, 800, 60, 600, 8);

        expect(result.totalPaid).toBe(48000); // 60 * 800
        expect(result.netSavingsAfter25Years).toBeGreaterThan(0);
        expect(result.breakEvenMonth).toBeGreaterThan(0);
    });
});

describe('getRateSemaphore - Classificação de Taxa', () => {
    it('deve classificar taxa < 1.5% como excellent', () => {
        expect(getRateSemaphore(0.5)).toBe('excellent');
        expect(getRateSemaphore(1.0)).toBe('excellent');
        expect(getRateSemaphore(1.49)).toBe('excellent');
    });

    it('deve classificar taxa 1.5-2% como average', () => {
        expect(getRateSemaphore(1.5)).toBe('average');
        expect(getRateSemaphore(1.75)).toBe('average');
        expect(getRateSemaphore(2.0)).toBe('average');
    });

    it('deve classificar taxa > 2% como expensive', () => {
        expect(getRateSemaphore(2.01)).toBe('expensive');
        expect(getRateSemaphore(3.0)).toBe('expensive');
        expect(getRateSemaphore(5.0)).toBe('expensive');
    });
});

describe('calculateROI - Retorno sobre Investimento', () => {
    it('deve calcular ROI positivo', () => {
        // Investiu 30000, economizou 50000 = 66.67% ROI
        const roi = calculateROI(50000, 30000);
        expect(roi).toBeCloseTo(66.67, 1);
    });

    it('deve calcular ROI negativo', () => {
        // Investiu 30000, economizou 20000 = -33.33% ROI
        const roi = calculateROI(20000, 30000);
        expect(roi).toBeCloseTo(-33.33, 1);
    });

    it('deve lidar com investimento zero', () => {
        const roi = calculateROI(1000, 0);
        expect(roi).toBe(0);
    });
});

describe('calculateLCOE - Custo Nivelado de Energia', () => {
    it('deve calcular LCOE corretamente', () => {
        // R$ 30.000 sistema, 1000 kWh/mês, 25 anos
        // LCOE = 30000 / (1000 * 12 * 25) = 0.10 R$/kWh
        const lcoe = calculateLCOE(30000, 1000, 25);
        expect(lcoe).toBeCloseTo(0.10, 2);
    });

    it('deve lidar com geração zero', () => {
        const lcoe = calculateLCOE(30000, 0, 25);
        expect(lcoe).toBe(0);
    });
});

describe('Funções de Formatação', () => {
    it('formatCurrency deve formatar em BRL', () => {
        const formatted = formatCurrency(1234.56);
        expect(formatted).toContain('1.234,56');
        expect(formatted).toContain('R$');
    });

    it('formatPercent deve adicionar %', () => {
        expect(formatPercent(1.5)).toBe('1.50%');
        expect(formatPercent(2.345, 1)).toBe('2.3%');
    });
});

describe('Cenários de Uso Real', () => {
    it('deve simular projeto solar típico - financiamento BV', () => {
        // Projeto: 8 kWp, R$ 40.000, 72x
        // Taxa BV típica: ~1.49% a.m.
        // Geração: 1100 kWh/mês, Tarifa: R$ 0.95/kWh

        const systemValue = 40000;
        const monthlyGeneration = 1100;
        const tariff = 0.95;
        const lei14300Factor = 0.85;

        // Economia mensal
        const economy = calculateRealEconomy(monthlyGeneration, tariff, lei14300Factor);
        expect(economy).toBeCloseTo(888.25, 1);

        // Se parcela for R$ 950
        const installment = 950;
        const cashflow = calculateCashflow(economy, installment);
        expect(cashflow.is_positive).toBe(false); // Pequeno desembolso

        // Detectando taxa
        const rateResult = detectMonthlyRate(systemValue, 72, installment);
        expect(rateResult.semaphore).toBe('average'); // Taxa no limite

        // Payback com reajuste
        const payback = calculatePayback(installment * 72, economy, 8);
        expect(payback.months).toBeLessThan(120); // Menos de 10 anos
    });

    it('deve simular projeto solar - pagamento à vista', () => {
        const systemValue = 35000;
        const monthlyGeneration = 900;
        const tariff = 0.88;
        const lei14300Factor = 0.85;

        const economy = calculateRealEconomy(monthlyGeneration, tariff, lei14300Factor);
        const payback = calculatePayback(systemValue, economy, 8);

        // Payback à vista geralmente < 5 anos com reajuste
        expect(payback.years).toBeLessThanOrEqual(6);
    });
});
