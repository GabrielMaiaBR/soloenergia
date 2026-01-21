/**
 * Máscaras de formatação para inputs
 * Implementação própria sem dependências externas
 */

/**
 * Remove todos os caracteres não numéricos
 */
export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Formata CPF: 000.000.000-00
 */
export function formatCPF(value: string): string {
  const numbers = onlyNumbers(value).slice(0, 11);
  
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

/**
 * Remove formatação de CPF
 */
export function unformatCPF(value: string): string {
  return onlyNumbers(value);
}

/**
 * Formata telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatPhone(value: string): string {
  const numbers = onlyNumbers(value).slice(0, 11);
  
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : '';
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

/**
 * Remove formatação de telefone
 */
export function unformatPhone(value: string): string {
  return onlyNumbers(value);
}

/**
 * Formata valor monetário: R$ 1.234,56
 */
export function formatCurrencyInput(value: string): string {
  // Remove tudo exceto números e vírgula
  const cleaned = value.replace(/[^\d,]/g, '');
  
  // Separa parte inteira e decimal
  const parts = cleaned.split(',');
  let integerPart = parts[0].replace(/\D/g, '');
  const decimalPart = parts[1]?.slice(0, 2) || '';
  
  // Adiciona pontos de milhar
  if (integerPart.length > 3) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  
  // Monta o resultado
  if (!integerPart && !decimalPart) return '';
  if (decimalPart || cleaned.includes(',')) {
    return `R$ ${integerPart || '0'},${decimalPart}`;
  }
  return `R$ ${integerPart}`;
}

/**
 * Converte valor formatado para número
 */
export function unformatCurrency(value: string): number {
  // Remove R$, pontos e espaços, substitui vírgula por ponto
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

/**
 * Formata número com separador de milhares (para exibição)
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Hook-friendly: aplica máscara mantendo posição do cursor
 * Retorna valor formatado e handler de onChange
 */
export function createMaskedHandler(
  maskFn: (value: string) => string,
  setter: (value: string) => void
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = maskFn(e.target.value);
    setter(formatted);
  };
}
