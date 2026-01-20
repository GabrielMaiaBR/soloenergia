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
  // Validate inputs
  if (financedValue <= 0 || installments <= 0 || installmentValue <= 0) {
    return {
      monthly_rate: 0,
      annual_rate: 0,
      semaphore: "excellent",
      total_interest: 0,
    };
  }

  const totalPaid = installmentValue * installments;
  
  // If total paid equals or is less than financed value, no interest
  if (totalPaid <= financedValue) {
    return {
      monthly_rate: 0,
      annual_rate: 0,
      semaphore: "excellent",
      total_interest: 0,
    };
  }

  // Initial guess using a better approximation
  // Based on: i ≈ (2 * n * (PMT * n - PV)) / (PV * (n + 1))
  let rate = (2 * installments * (totalPaid - financedValue)) / (financedValue * (installments + 1));
  
  // Ensure initial rate is within reasonable bounds
  if (rate <= 0) rate = 0.01;
  if (rate > 0.5) rate = 0.1; // Cap at 10% for initial guess
  
  for (let i = 0; i < maxIterations; i++) {
    const onePlusRate = 1 + rate;
    const power = Math.pow(onePlusRate, -installments);
    
    // f(i) = PV - PMT * [(1 - (1+i)^-n) / i]
    // We want to find rate where f(i) = 0
    const pvCalculated = installmentValue * (1 - power) / rate;
    const f = financedValue - pvCalculated;
    
    // f'(i) - derivative using quotient rule
    // d/di [(1 - (1+i)^-n) / i] = [n*(1+i)^(-n-1) * i - (1 - (1+i)^-n)] / i^2
    const powerPlus1 = Math.pow(onePlusRate, -(installments + 1));
    const numerator = installments * powerPlus1 * rate - (1 - power);
    const fPrime = -installmentValue * numerator / (rate * rate);

    // Avoid division by ~0 which can explode Newton steps
    if (!isFinite(fPrime) || Math.abs(fPrime) < 1e-12) {
      break;
    }
    
    // Newton-Raphson step
    const newRate = rate - f / fPrime;
    
    // Check convergence
    if (Math.abs(newRate - rate) < tolerance) {
      rate = newRate;
      break;
    }
    
    rate = newRate;
    
    // Safeguard against negative or extremely high rates
    if (rate <= 0) rate = 0.001;
    if (rate > 1) rate = 0.5; // Cap at 50% monthly
  }
  
  // Validate result - verify the rate gives correct PV
  const verifyPV = installmentValue * (1 - Math.pow(1 + rate, -installments)) / rate;
  const error = Math.abs(verifyPV - financedValue) / financedValue;
  
  // If error is too large, fall back to simple approximation
  if (error > 0.01) {
    // Use simple interest approximation
    const totalInterest = totalPaid - financedValue;
    rate = totalInterest / financedValue / installments;
  }
  
  const monthlyRatePercent = rate * 100;
  const annualRate = (Math.pow(1 + rate, 12) - 1) * 100;
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
 * Calculates payback period - how long until accumulated savings >= total project cost
 * 
 * For financing: considers total paid (principal + interest) as the cost
 * For cash: considers system value as the cost
 * 
 * @param totalProjectCost Total amount to be recovered (system value for cash, total paid for financing)
 * @param monthlyEconomy Monthly savings from solar generation
 * @param tariffIncreaseRate Annual tariff increase rate (percentage, e.g., 8 for 8%)
 */
export function calculatePayback(
  totalProjectCost: number,
  monthlyEconomy: number,
  tariffIncreaseRate: number = 0
): PaybackResult {
  if (monthlyEconomy <= 0 || totalProjectCost <= 0) {
    return { months: Infinity, years: Infinity, display: "N/A" };
  }
  
  // Simple payback without tariff increase
  if (tariffIncreaseRate <= 0) {
    const months = Math.ceil(totalProjectCost / monthlyEconomy);
    return formatPaybackResult(months);
  }
  
  // Payback with compound tariff increase
  // Each year, the monthly economy increases by tariffIncreaseRate%
  const monthlyIncreaseRate = Math.pow(1 + tariffIncreaseRate / 100, 1/12) - 1;
  
  let accumulatedSavings = 0;
  let currentMonthlyEconomy = monthlyEconomy;
  let months = 0;
  const maxMonths = 600; // 50 years max
  
  while (accumulatedSavings < totalProjectCost && months < maxMonths) {
    accumulatedSavings += currentMonthlyEconomy;
    currentMonthlyEconomy *= (1 + monthlyIncreaseRate);
    months++;
  }
  
  if (months >= maxMonths) {
    return { months: Infinity, years: Infinity, display: "N/A" };
  }
  
  return formatPaybackResult(months);
}

/**
 * Helper to format payback result
 */
function formatPaybackResult(months: number): PaybackResult {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  let display: string;
  if (years === 0) {
    display = `${months} ${months === 1 ? "mês" : "meses"}`;
  } else if (remainingMonths === 0) {
    display = `${years} ${years === 1 ? "ano" : "anos"}`;
  } else {
    display = `${years} ${years === 1 ? "ano" : "anos"} e ${remainingMonths} ${remainingMonths === 1 ? "mês" : "meses"}`;
  }
  
  return { months, years, display };
}

/**
 * Calculates detailed payback considering financing period
 * This is a more sophisticated calculation that accounts for:
 * - Negative cashflow during financing (when installment > savings)
 * - Break-even point after financing ends
 * 
 * @param systemValue Original system cost
 * @param installmentValue Monthly installment
 * @param installments Number of installments
 * @param monthlyEconomy Monthly savings
 * @param tariffIncreaseRate Annual tariff increase (%)
 */
export function calculateDetailedPayback(
  systemValue: number,
  installmentValue: number,
  installments: number,
  monthlyEconomy: number,
  tariffIncreaseRate: number = 0
): PaybackResult & { 
  totalPaid: number; 
  netSavingsAfter25Years: number;
  breakEvenMonth: number;
} {
  const totalPaid = installmentValue * installments;
  const monthlyIncreaseRate = tariffIncreaseRate > 0 
    ? Math.pow(1 + tariffIncreaseRate / 100, 1/12) - 1 
    : 0;
  
  let accumulatedSavings = 0;
  let accumulatedCost = 0;
  let currentMonthlyEconomy = monthlyEconomy;
  let breakEvenMonth = -1;
  
  // Calculate for 25 years (300 months)
  for (let month = 1; month <= 300; month++) {
    accumulatedSavings += currentMonthlyEconomy;
    
    // Add installment cost during financing period
    if (month <= installments) {
      accumulatedCost += installmentValue;
    }
    
    // Check break-even
    if (breakEvenMonth === -1 && accumulatedSavings >= accumulatedCost) {
      breakEvenMonth = month;
    }
    
    // Apply tariff increase
    currentMonthlyEconomy *= (1 + monthlyIncreaseRate);
  }
  
  const netSavingsAfter25Years = accumulatedSavings - totalPaid;
  
  // For payback, use total project cost (what was paid)
  const paybackResult = calculatePayback(totalPaid, monthlyEconomy, tariffIncreaseRate);
  
  return {
    ...paybackResult,
    totalPaid,
    netSavingsAfter25Years,
    breakEvenMonth: breakEvenMonth === -1 ? Infinity : breakEvenMonth,
  };
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

/**
 * Calculate ROI (Return on Investment) percentage
 */
export function calculateROI(
  totalSavings: number,
  totalInvestment: number
): number {
  if (totalInvestment <= 0) return 0;
  return ((totalSavings - totalInvestment) / totalInvestment) * 100;
}

/**
 * Calculate LCOE (Levelized Cost of Energy)
 * Simplified version: Total cost / Total energy generated over lifetime
 */
export function calculateLCOE(
  totalSystemCost: number,
  monthlyGenerationKwh: number,
  systemLifetimeYears: number = 25
): number {
  const totalGeneration = monthlyGenerationKwh * 12 * systemLifetimeYears;
  if (totalGeneration <= 0) return 0;
  return totalSystemCost / totalGeneration;
}
