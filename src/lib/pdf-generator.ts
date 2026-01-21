import { jsPDF } from "jspdf";
import type { Client, Simulation, AppSettings } from "@/types";
import { formatCurrency, formatPercent, calculateRealEconomy } from "@/lib/financial";

interface ProfessionalPDFOptions {
    client: Client;
    simulation?: Simulation;
    settings?: AppSettings;
}

/**
 * Cores do tema Solo Smart
 */
const Colors = {
    primary: [20, 184, 166] as [number, number, number],    // Solo trust teal
    success: [34, 197, 94] as [number, number, number],     // Green
    warning: [251, 191, 36] as [number, number, number],    // Yellow
    danger: [239, 68, 68] as [number, number, number],      // Red
    dark: [30, 30, 30] as [number, number, number],         // Almost black
    gray: [120, 120, 120] as [number, number, number],      // Gray text
    lightGray: [240, 240, 240] as [number, number, number], // Light background
    white: [255, 255, 255] as [number, number, number],
};

/**
 * Gera um PDF profissional de proposta comercial
 */
export async function generateProfessionalPDF({
    client,
    simulation,
    settings,
}: ProfessionalPDFOptions): Promise<jsPDF> {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Helper functions
    const addText = (text: string, x: number, y: number, options?: {
        fontSize?: number;
        color?: [number, number, number];
        fontStyle?: "normal" | "bold";
        align?: "left" | "center" | "right";
    }) => {
        const { fontSize = 10, color = Colors.dark, fontStyle = "normal", align = "left" } = options || {};
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);
        doc.setFont("helvetica", fontStyle);
        doc.text(text, x, y, { align });
    };

    const addRect = (x: number, y: number, w: number, h: number, color: [number, number, number]) => {
        doc.setFillColor(...color);
        doc.roundedRect(x, y, w, h, 3, 3, "F");
    };

    // Company info
    const companyName = settings?.company_name || "Solo Smart";
    const companyPhone = settings?.contact_phone || "";
    const companyEmail = settings?.contact_email || "";

    // Calculate values
    const lei14300Factor = settings?.lei_14300_factor || 0.85;
    const tariff = client.energy_tariff || settings?.default_tariff || 0.85;
    const monthlyGeneration = client.monthly_generation_kwh || 0;
    const monthlyEconomy = calculateRealEconomy(monthlyGeneration, tariff, lei14300Factor);
    const yearlyEconomy = monthlyEconomy * 12;
    const economy25Years = yearlyEconomy * 25;

    // ========================================
    // HEADER
    // ========================================
    addRect(0, 0, pageWidth, 45, Colors.primary);

    // Company name
    addText(companyName.toUpperCase(), margin, 20, {
        fontSize: 22,
        color: Colors.white,
        fontStyle: "bold",
    });

    // Proposal title
    addText("PROPOSTA COMERCIAL", margin, 32, {
        fontSize: 12,
        color: Colors.white,
    });

    // Date
    const today = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    addText(today, pageWidth - margin, 28, {
        fontSize: 10,
        color: Colors.white,
        align: "right",
    });

    // ========================================
    // CLIENT INFO
    // ========================================
    let yPos = 60;

    addText("CLIENTE", margin, yPos, {
        fontSize: 11,
        color: Colors.primary,
        fontStyle: "bold",
    });
    yPos += 8;

    addText(client.name, margin, yPos, {
        fontSize: 16,
        fontStyle: "bold",
    });
    yPos += 8;

    if (client.email || client.phone) {
        const contactInfo = [client.email, client.phone].filter(Boolean).join(" • ");
        addText(contactInfo, margin, yPos, {
            fontSize: 10,
            color: Colors.gray,
        });
        yPos += 8;
    }

    if (client.city && client.state_code) {
        addText(`${client.city}, ${client.state_code}`, margin, yPos, {
            fontSize: 10,
            color: Colors.gray,
        });
        yPos += 8;
    }

    // ========================================
    // SYSTEM INFO - Cards
    // ========================================
    yPos += 10;

    addText("SISTEMA PROPOSTO", margin, yPos, {
        fontSize: 11,
        color: Colors.primary,
        fontStyle: "bold",
    });
    yPos += 8;

    const cardWidth = (contentWidth - 10) / 3;
    const cardHeight = 35;

    // Card 1 - Potência
    addRect(margin, yPos, cardWidth, cardHeight, Colors.lightGray);
    addText("POTÊNCIA", margin + 5, yPos + 10, {
        fontSize: 8,
        color: Colors.gray,
    });
    addText(`${client.system_power_kwp || "?"} kWp`, margin + 5, yPos + 22, {
        fontSize: 16,
        fontStyle: "bold",
        color: Colors.primary,
    });

    // Card 2 - Geração
    addRect(margin + cardWidth + 5, yPos, cardWidth, cardHeight, Colors.lightGray);
    addText("GERAÇÃO MENSAL", margin + cardWidth + 10, yPos + 10, {
        fontSize: 8,
        color: Colors.gray,
    });
    addText(`${monthlyGeneration} kWh`, margin + cardWidth + 10, yPos + 22, {
        fontSize: 16,
        fontStyle: "bold",
        color: Colors.primary,
    });

    // Card 3 - Economia
    addRect(margin + (cardWidth + 5) * 2, yPos, cardWidth, cardHeight, Colors.lightGray);
    addText("ECONOMIA MENSAL", margin + (cardWidth + 5) * 2 + 5, yPos + 10, {
        fontSize: 8,
        color: Colors.gray,
    });
    addText(formatCurrency(monthlyEconomy), margin + (cardWidth + 5) * 2 + 5, yPos + 22, {
        fontSize: 16,
        fontStyle: "bold",
        color: Colors.success,
    });

    yPos += cardHeight + 15;

    // ========================================
    // SIMULATION DETAILS
    // ========================================
    if (simulation) {
        addText("CONDIÇÃO DE PAGAMENTO", margin, yPos, {
            fontSize: 11,
            color: Colors.primary,
            fontStyle: "bold",
        });
        yPos += 10;

        const typeLabels: Record<string, string> = {
            financing: "Financiamento",
            credit_card: "Cartão de Crédito",
            cash: "À Vista",
        };

        // Detail rows
        const addDetailRow = (label: string, value: string, valueColor?: [number, number, number]) => {
            addText(label, margin, yPos, {
                fontSize: 10,
                color: Colors.gray,
            });
            addText(value, pageWidth - margin, yPos, {
                fontSize: 10,
                fontStyle: "bold",
                color: valueColor || Colors.dark,
                align: "right",
            });
            yPos += 7;
        };

        addDetailRow("Modalidade", typeLabels[simulation.type] || simulation.type);
        addDetailRow("Valor do Sistema", formatCurrency(simulation.system_value));

        if (simulation.entry_value && simulation.entry_value > 0) {
            addDetailRow("Entrada", formatCurrency(simulation.entry_value));
        }

        if (simulation.installments && simulation.installment_value) {
            addDetailRow("Parcelas", `${simulation.installments}x de ${formatCurrency(simulation.installment_value)}`);
        }

        if (simulation.detected_monthly_rate !== undefined && simulation.type !== "cash") {
            addDetailRow("Taxa Mensal", formatPercent(simulation.detected_monthly_rate));
        }

        if (simulation.monthly_cashflow !== undefined) {
            const cashflowColor: [number, number, number] = simulation.monthly_cashflow >= 0 ? Colors.success : Colors.danger;
            addDetailRow("Fluxo de Caixa Mensal", formatCurrency(simulation.monthly_cashflow), cashflowColor);
        }

        // Payback highlight box
        if (simulation.payback_months) {
            yPos += 5;
            addRect(margin, yPos, contentWidth, 25, Colors.success);
            addText("PAYBACK", margin + 10, yPos + 10, {
                fontSize: 9,
                color: Colors.white,
            });

            const paybackYears = Math.floor(simulation.payback_months / 12);
            const paybackMonths = simulation.payback_months % 12;
            let paybackText = "";
            if (paybackYears > 0) paybackText += `${paybackYears} ano${paybackYears > 1 ? "s" : ""}`;
            if (paybackMonths > 0) paybackText += ` ${paybackMonths} mês${paybackMonths > 1 ? "es" : ""}`;

            addText(paybackText.trim(), margin + 10, yPos + 19, {
                fontSize: 14,
                color: Colors.white,
                fontStyle: "bold",
            });

            addText("Após esse período, energia praticamente grátis!", pageWidth - margin - 10, yPos + 15, {
                fontSize: 9,
                color: Colors.white,
                align: "right",
            });

            yPos += 30;
        }
    }

    // ========================================
    // ECONOMY PROJECTION
    // ========================================
    yPos += 10;

    addText("PROJEÇÃO DE ECONOMIA", margin, yPos, {
        fontSize: 11,
        color: Colors.primary,
        fontStyle: "bold",
    });
    yPos += 10;

    const projectionData = [
        { label: "Economia Mensal", value: monthlyEconomy },
        { label: "Economia Anual", value: yearlyEconomy },
        { label: "Economia em 25 Anos", value: economy25Years, highlight: true },
    ];

    projectionData.forEach((item) => {
        if (item.highlight) {
            addRect(margin, yPos - 4, contentWidth, 15, Colors.primary);
            addText(item.label, margin + 5, yPos + 5, {
                fontSize: 10,
                color: Colors.white,
            });
            addText(formatCurrency(item.value), pageWidth - margin - 5, yPos + 5, {
                fontSize: 12,
                fontStyle: "bold",
                color: Colors.white,
                align: "right",
            });
            yPos += 18;
        } else {
            addText(item.label, margin, yPos, {
                fontSize: 10,
                color: Colors.gray,
            });
            addText(formatCurrency(item.value), pageWidth - margin, yPos, {
                fontSize: 10,
                fontStyle: "bold",
                color: Colors.success,
                align: "right",
            });
            yPos += 8;
        }
    });

    // ========================================
    // BENEFITS
    // ========================================
    yPos += 10;

    addText("BENEFÍCIOS DA ENERGIA SOLAR", margin, yPos, {
        fontSize: 11,
        color: Colors.primary,
        fontStyle: "bold",
    });
    yPos += 10;

    const benefits = [
        "✓ Redução de até 95% na conta de luz",
        "✓ Proteção contra aumentos tarifários",
        "✓ Valorização do imóvel em até 8%",
        "✓ Energia limpa e sustentável",
        "✓ Garantia de 25 anos nos módulos",
    ];

    benefits.forEach((benefit) => {
        addText(benefit, margin, yPos, {
            fontSize: 10,
            color: Colors.dark,
        });
        yPos += 7;
    });

    // ========================================
    // FOOTER
    // ========================================
    const footerY = pageHeight - 30;

    // Line
    doc.setDrawColor(...Colors.lightGray);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    // Company info
    addText(companyName, margin, footerY, {
        fontSize: 10,
        fontStyle: "bold",
        color: Colors.primary,
    });

    const contactParts = [];
    if (companyPhone) contactParts.push(companyPhone);
    if (companyEmail) contactParts.push(companyEmail);

    if (contactParts.length > 0) {
        addText(contactParts.join(" • "), margin, footerY + 6, {
            fontSize: 9,
            color: Colors.gray,
        });
    }

    // Validity
    addText("Proposta válida por 15 dias", pageWidth - margin, footerY, {
        fontSize: 8,
        color: Colors.gray,
        align: "right",
    });
    addText("Valores sujeitos a confirmação técnica", pageWidth - margin, footerY + 5, {
        fontSize: 8,
        color: Colors.gray,
        align: "right",
    });

    return doc;
}

/**
 * Gera e faz download do PDF
 */
export async function downloadProposalPDF(options: ProfessionalPDFOptions): Promise<void> {
    const doc = await generateProfessionalPDF(options);
    const fileName = `Proposta_${options.client.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
}

/**
 * Gera o PDF e retorna como Blob
 */
export async function getProposalPDFBlob(options: ProfessionalPDFOptions): Promise<Blob> {
    const doc = await generateProfessionalPDF(options);
    return doc.output("blob");
}
