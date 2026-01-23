/**
 * WhatsApp Integration - Solo Smart v2.0
 * 
 * Utilitários para geração de links e compartilhamento via WhatsApp.
 * 
 * @author Solo Smart Team
 */

/**
 * Gera um link para abrir chat do WhatsApp.
 * @param phone - Número de telefone (com ou sem formatação)
 * @param message - Mensagem opcional para pré-preencher
 * @returns URL do WhatsApp Web/App
 */
export function generateWhatsAppLink(phone?: string, message?: string): string {
    const cleanPhone = phone?.replace(/\D/g, '') || '';

    // Se tem telefone, abre direto no contato
    if (cleanPhone) {
        // Adiciona DDI 55 (Brasil) se não tiver
        const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
        const url = new URL(`https://wa.me/${fullPhone}`);
        if (message) {
            url.searchParams.set('text', message);
        }
        return url.toString();
    }

    // Sem telefone, abre WhatsApp com mensagem para escolher contato
    if (message) {
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    }

    return 'https://wa.me/';
}

/**
 * Abre o WhatsApp com a mensagem especificada.
 * @param phone - Número de telefone
 * @param message - Mensagem para enviar
 */
export function openWhatsApp(phone?: string, message?: string): void {
    const url = generateWhatsAppLink(phone, message);
    window.open(url, '_blank');
}

/**
 * Formata número de telefone para exibição.
 * @param phone - Número de telefone
 * @returns Telefone formatado (XX) XXXXX-XXXX
 */
export function formatPhoneDisplay(phone?: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
}

// ============ Message Templates ============

interface ProposalShareData {
    clientName: string;
    systemPower: number;
    monthlyGeneration: number;
    systemValue: number;
    monthlyEconomy: number;
    paybackYears: number;
    companyName?: string;
}

/**
 * Gera mensagem de proposta para compartilhar via WhatsApp.
 */
export function generateProposalMessage(data: ProposalShareData): string {
    return `👋 Olá ${data.clientName}!

Preparei uma proposta personalizada de energia solar para você:

🔋 *Sistema de ${data.systemPower} kWp*
• Geração: ${data.monthlyGeneration} kWh/mês
• Economia: ~R$ ${data.monthlyEconomy.toFixed(0)}/mês
• Investimento: R$ ${data.systemValue.toLocaleString('pt-BR')}
• Payback: ${data.paybackYears.toFixed(1)} anos

A energia solar é um investimento que se paga e continua gerando economia por mais de 25 anos! ☀️

Posso te explicar mais detalhes?${data.companyName ? `

_${data.companyName}_` : ''}`;
}

interface FollowUpData {
    clientName: string;
    daysSinceContact: number;
    lastSimulation?: {
        systemPower: number;
        monthlyEconomy: number;
    };
}

/**
 * Gera mensagem de follow-up para cliente que precisa de atenção.
 */
export function generateFollowUpMessage(data: FollowUpData): string {
    const opening = data.daysSinceContact > 7
        ? `Faz um tempinho que conversamos`
        : `Passando para ver como você está`;

    const simulationInfo = data.lastSimulation
        ? `\n\nSó lembrando que aquele sistema de ${data.lastSimulation.systemPower} kWp geraria uma economia de aproximadamente R$ ${data.lastSimulation.monthlyEconomy.toFixed(0)}/mês para você.`
        : '';

    return `👋 Oi ${data.clientName}!

${opening}! ${simulationInfo}

Tem alguma dúvida que eu possa ajudar? Fico à disposição! 🌞`;
}

interface ReminderData {
    eventDescription: string;
    dateTime?: string;
}

/**
 * Gera mensagem de lembrete.
 */
export function generateReminderMessage(data: ReminderData): string {
    return `⏰ Lembrete: ${data.eventDescription}${data.dateTime ? `\n📅 ${data.dateTime}` : ''}`;
}
