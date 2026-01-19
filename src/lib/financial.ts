// Financial calculation utilities for Solo Smart
// Newton-Raphson method for rate detection and other financial formulas

import type { RateSemaphore, RateDetectionResult, CashflowResult, PaybackResult } from "@/types";

/**
 * Detects hidden interest rate using Newton-Raphson iterative method
 * Given: present value (PV), number of payments (n), payment amount (PMT)
 * Finds: monthly interest rate (i)
 * 
 * Formula: PV = PMT * [(1 - (1 + i)^-n) / i]
 */
export function detectMonthlyRate(
  financedValue: number,
  installments: number,
  installmentValue: number,
  maxIterations: number = 100,
  tolerance: number = 0.0000001
): RateDetectionResult {
  // Initial guess: simple approximation
  let rate = (installmentValue * installments / financedValue - 1) / installments;
  
  // Ensure initial rate is positive
  if (rate <= 0) rate = 0.01;
  
  for (let i = 0; i < maxIterations; i++) {
    const onePlusRate = 1 + rate;
    const power = Math.pow(onePlusRate, -installments);
    
    // f(i) = PV - PMT * [(1 - (1+i)^-n) / i]
    const f = financedValue - installmentValue * (1 - power) / rate;
    
    // f'(i) derivative
    const numerator = (1 - power) / rate - installments * power / onePlusRate;
    const fPrime = -installmentValue * numerator / rate;
    
    // Newton-Raphson step
    const newRate = rate - f / fPrime;
    
    // Check convergence
    if (Math.abs(newRate - rate) < tolerance) {
      rate = newRate;
      break;
    }
    
    rate = newRate;
    
    // Safeguard against negative rates
    if (rate <= 0) rate = 0.001;
  }
  
  const monthlyRatePercent = rate * 100;
  const annualRate = (Math.pow(1 + rate, 12) - 1) * 100;
  const totalPaid = installmentValue * installments;
  const totalInterest = totalPaid - financedValue;
  
  return {
    monthly_rate: monthlyRatePercent,
    annual_rate: annualRate,
    semaphore: getRateSemaphore(monthlyRatePercent),
    total_interest: totalInterest,
  };
}

/**
 * Calculates installment value given rate, value and number of payments
 * PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]
 */
export function calculateInstallment(
  financedValue: number,
  monthlyRatePercent: number,
  installments: number
): number {
  const rate = monthlyRatePercent / 100;
  
  if (rate === 0) {
    return financedValue / installments;
  }
  
  const onePlusRate = 1 + rate;
  const power = Math.pow(onePlusRate, installments);
  
  return financedValue * (rate * power) / (power - 1);
}

/**
 * Returns the rate semaphore classification
 */
export function getRateSemaphore(monthlyRatePercent: number): RateSemaphore {
  if (monthlyRatePercent < 1.5) return "excellent";
  if (monthlyRatePercent <= 2.0) return "average";
  return "expensive";
}

/**
 * Calculates real economy considering Lei 14.300
 * @param generationKwh Monthly generation in kWh
 * @param tariff Energy tariff in R$/kWh
 * @param lei14300Factor Factor for Fio B compensation (e.g., 0.85 = 85% of generation is compensated)
 */
export function calculateRealEconomy(
  generationKwh: number,
  tariff: number,
  lei14300Factor: number = 0.85
): number {
  return generationKwh * lei14300Factor * tariff;
}

/**
 * Calculates monthly cashflow
 */
export function calculateCashflow(
  monthlyEconomy: number,
  installmentValue: number
): CashflowResult {
  const cashflow = monthlyEconomy - installmentValue;
  
  return {
    monthly_economy: monthlyEconomy,
    monthly_cashflow: cashflow,
    is_positive: cashflow >= 0,
  };
}

/**
 * Calculates simple adjusted payback
 * @param totalPaid Total amount paid (system value + interest)
 * @param monthlyEconomy Monthly economy from solar generation
 */
export function calculatePayback(
  totalPaid: number,
  monthlyEconomy: number
): PaybackResult {
  if (monthlyEconomy <= 0) {
    return { months: Infinity, years: Infinity, display: "N/A" };
  }
  
  const months = Math.ceil(totalPaid / monthlyEconomy);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  let display: string;
  if (years === 0) {
    display = `${months} meses`;
  } else if (remainingMonths === 0) {
    display = `${years} ${years === 1 ? "ano" : "anos"}`;
  } else {
    display = `${years} ${years === 1 ? "ano" : "anos"} e ${remainingMonths} ${remainingMonths === 1 ? "mês" : "meses"}`;
  }
  
  return { months, years, display };
}

/**
 * Calculates cash benchmark - how much would be saved by paying cash
 */
export function calculateCashBenchmark(
  systemValue: number,
  totalPaid: number
): number {
  return totalPaid - systemValue;
}

/**
 * Formats currency to BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formats percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Parses BRL currency string to number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
}
