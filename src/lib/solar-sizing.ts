/**
 * Dados de HSP (Horas de Sol Pico) por estado e cidades principais do Brasil
 * Fonte: Atlas Brasileiro de Energia Solar (INPE) e CRESESB
 * 
 * HSP (Horas de Sol Pico): média anual de horas de sol pleno por dia
 * Valor utilizado para estimar geração de sistemas fotovoltaicos
 */

export interface HSPData {
    state: string;
    stateName: string;
    hsp: number;
    cities: {
        name: string;
        hsp: number;
    }[];
}

// Dados de HSP por estado brasileiro (média anual)
export const brazilHSPData: HSPData[] = [
    {
        state: "AC",
        stateName: "Acre",
        hsp: 4.5,
        cities: [
            { name: "Rio Branco", hsp: 4.5 },
        ],
    },
    {
        state: "AL",
        stateName: "Alagoas",
        hsp: 5.2,
        cities: [
            { name: "Maceió", hsp: 5.3 },
            { name: "Arapiraca", hsp: 5.1 },
        ],
    },
    {
        state: "AP",
        stateName: "Amapá",
        hsp: 4.6,
        cities: [
            { name: "Macapá", hsp: 4.6 },
        ],
    },
    {
        state: "AM",
        stateName: "Amazonas",
        hsp: 4.4,
        cities: [
            { name: "Manaus", hsp: 4.4 },
        ],
    },
    {
        state: "BA",
        stateName: "Bahia",
        hsp: 5.5,
        cities: [
            { name: "Salvador", hsp: 5.2 },
            { name: "Feira de Santana", hsp: 5.4 },
            { name: "Vitória da Conquista", hsp: 5.6 },
            { name: "Camaçari", hsp: 5.2 },
            { name: "Juazeiro", hsp: 6.0 },
            { name: "Barreiras", hsp: 5.8 },
        ],
    },
    {
        state: "CE",
        stateName: "Ceará",
        hsp: 5.8,
        cities: [
            { name: "Fortaleza", hsp: 5.6 },
            { name: "Caucaia", hsp: 5.6 },
            { name: "Juazeiro do Norte", hsp: 5.9 },
            { name: "Sobral", hsp: 5.8 },
        ],
    },
    {
        state: "DF",
        stateName: "Distrito Federal",
        hsp: 5.2,
        cities: [
            { name: "Brasília", hsp: 5.2 },
        ],
    },
    {
        state: "ES",
        stateName: "Espírito Santo",
        hsp: 4.8,
        cities: [
            { name: "Vitória", hsp: 4.8 },
            { name: "Vila Velha", hsp: 4.8 },
            { name: "Serra", hsp: 4.7 },
            { name: "Cariacica", hsp: 4.7 },
        ],
    },
    {
        state: "GO",
        stateName: "Goiás",
        hsp: 5.3,
        cities: [
            { name: "Goiânia", hsp: 5.3 },
            { name: "Aparecida de Goiânia", hsp: 5.3 },
            { name: "Anápolis", hsp: 5.2 },
            { name: "Rio Verde", hsp: 5.4 },
        ],
    },
    {
        state: "MA",
        stateName: "Maranhão",
        hsp: 5.2,
        cities: [
            { name: "São Luís", hsp: 5.0 },
            { name: "Imperatriz", hsp: 5.3 },
        ],
    },
    {
        state: "MT",
        stateName: "Mato Grosso",
        hsp: 5.2,
        cities: [
            { name: "Cuiabá", hsp: 5.2 },
            { name: "Várzea Grande", hsp: 5.2 },
            { name: "Rondonópolis", hsp: 5.3 },
            { name: "Sinop", hsp: 5.1 },
        ],
    },
    {
        state: "MS",
        stateName: "Mato Grosso do Sul",
        hsp: 5.1,
        cities: [
            { name: "Campo Grande", hsp: 5.1 },
            { name: "Dourados", hsp: 5.0 },
            { name: "Três Lagoas", hsp: 5.2 },
        ],
    },
    {
        state: "MG",
        stateName: "Minas Gerais",
        hsp: 5.2,
        cities: [
            { name: "Belo Horizonte", hsp: 5.1 },
            { name: "Uberlândia", hsp: 5.3 },
            { name: "Contagem", hsp: 5.1 },
            { name: "Juiz de Fora", hsp: 4.8 },
            { name: "Betim", hsp: 5.0 },
            { name: "Montes Claros", hsp: 5.6 },
            { name: "Uberaba", hsp: 5.4 },
            { name: "Governador Valadares", hsp: 5.0 },
            { name: "Ipatinga", hsp: 4.9 },
            { name: "Sete Lagoas", hsp: 5.2 },
            { name: "Divinópolis", hsp: 5.1 },
            { name: "Poços de Caldas", hsp: 4.9 },
        ],
    },
    {
        state: "PA",
        stateName: "Pará",
        hsp: 4.8,
        cities: [
            { name: "Belém", hsp: 4.7 },
            { name: "Ananindeua", hsp: 4.7 },
            { name: "Santarém", hsp: 4.9 },
            { name: "Marabá", hsp: 5.0 },
        ],
    },
    {
        state: "PB",
        stateName: "Paraíba",
        hsp: 5.6,
        cities: [
            { name: "João Pessoa", hsp: 5.4 },
            { name: "Campina Grande", hsp: 5.7 },
            { name: "Patos", hsp: 6.0 },
        ],
    },
    {
        state: "PR",
        stateName: "Paraná",
        hsp: 4.6,
        cities: [
            { name: "Curitiba", hsp: 4.4 },
            { name: "Londrina", hsp: 4.8 },
            { name: "Maringá", hsp: 4.8 },
            { name: "Ponta Grossa", hsp: 4.5 },
            { name: "Cascavel", hsp: 4.7 },
            { name: "Foz do Iguaçu", hsp: 4.6 },
        ],
    },
    {
        state: "PE",
        stateName: "Pernambuco",
        hsp: 5.5,
        cities: [
            { name: "Recife", hsp: 5.3 },
            { name: "Jaboatão dos Guararapes", hsp: 5.3 },
            { name: "Olinda", hsp: 5.3 },
            { name: "Caruaru", hsp: 5.5 },
            { name: "Petrolina", hsp: 6.1 },
        ],
    },
    {
        state: "PI",
        stateName: "Piauí",
        hsp: 5.8,
        cities: [
            { name: "Teresina", hsp: 5.7 },
            { name: "Parnaíba", hsp: 5.6 },
            { name: "Picos", hsp: 6.0 },
        ],
    },
    {
        state: "RJ",
        stateName: "Rio de Janeiro",
        hsp: 4.6,
        cities: [
            { name: "Rio de Janeiro", hsp: 4.5 },
            { name: "São Gonçalo", hsp: 4.5 },
            { name: "Duque de Caxias", hsp: 4.5 },
            { name: "Nova Iguaçu", hsp: 4.5 },
            { name: "Niterói", hsp: 4.6 },
            { name: "Campos dos Goytacazes", hsp: 4.8 },
            { name: "Petrópolis", hsp: 4.3 },
        ],
    },
    {
        state: "RN",
        stateName: "Rio Grande do Norte",
        hsp: 5.8,
        cities: [
            { name: "Natal", hsp: 5.6 },
            { name: "Mossoró", hsp: 6.0 },
            { name: "Parnamirim", hsp: 5.6 },
        ],
    },
    {
        state: "RS",
        stateName: "Rio Grande do Sul",
        hsp: 4.4,
        cities: [
            { name: "Porto Alegre", hsp: 4.4 },
            { name: "Caxias do Sul", hsp: 4.3 },
            { name: "Pelotas", hsp: 4.3 },
            { name: "Canoas", hsp: 4.4 },
            { name: "Santa Maria", hsp: 4.5 },
            { name: "Gravataí", hsp: 4.4 },
        ],
    },
    {
        state: "RO",
        stateName: "Rondônia",
        hsp: 4.7,
        cities: [
            { name: "Porto Velho", hsp: 4.7 },
            { name: "Ji-Paraná", hsp: 4.8 },
        ],
    },
    {
        state: "RR",
        stateName: "Roraima",
        hsp: 4.9,
        cities: [
            { name: "Boa Vista", hsp: 4.9 },
        ],
    },
    {
        state: "SC",
        stateName: "Santa Catarina",
        hsp: 4.3,
        cities: [
            { name: "Joinville", hsp: 4.2 },
            { name: "Florianópolis", hsp: 4.3 },
            { name: "Blumenau", hsp: 4.2 },
            { name: "São José", hsp: 4.3 },
            { name: "Chapecó", hsp: 4.4 },
            { name: "Criciúma", hsp: 4.3 },
        ],
    },
    {
        state: "SP",
        stateName: "São Paulo",
        hsp: 4.8,
        cities: [
            { name: "São Paulo", hsp: 4.6 },
            { name: "Guarulhos", hsp: 4.6 },
            { name: "Campinas", hsp: 4.9 },
            { name: "São Bernardo do Campo", hsp: 4.6 },
            { name: "Santo André", hsp: 4.6 },
            { name: "São José dos Campos", hsp: 4.7 },
            { name: "Osasco", hsp: 4.6 },
            { name: "Ribeirão Preto", hsp: 5.2 },
            { name: "Sorocaba", hsp: 4.8 },
            { name: "Santos", hsp: 4.5 },
            { name: "São José do Rio Preto", hsp: 5.1 },
            { name: "Bauru", hsp: 5.0 },
            { name: "Piracicaba", hsp: 4.9 },
            { name: "Jundiaí", hsp: 4.8 },
            { name: "Presidente Prudente", hsp: 5.0 },
        ],
    },
    {
        state: "SE",
        stateName: "Sergipe",
        hsp: 5.4,
        cities: [
            { name: "Aracaju", hsp: 5.4 },
        ],
    },
    {
        state: "TO",
        stateName: "Tocantins",
        hsp: 5.3,
        cities: [
            { name: "Palmas", hsp: 5.3 },
            { name: "Araguaína", hsp: 5.2 },
        ],
    },
];

// HSP padrão do Brasil (média nacional)
export const DEFAULT_HSP = 4.8;

// Fator de performance do sistema (considera perdas)
export const SYSTEM_PERFORMANCE_FACTOR = 0.80; // 80% eficiência típica

/**
 * Calcula a potência necessária (kWp) baseado no consumo mensal
 * 
 * Fórmula: kWp = consumo_mensal / (HSP * 30 * fator_performance)
 * 
 * @param monthlyConsumptionKwh - Consumo mensal em kWh
 * @param hsp - Horas de Sol Pico (default: 4.8)
 * @param performanceFactor - Fator de performance do sistema (default: 0.80)
 * @returns Potência em kWp
 */
export function calculateRequiredPower(
    monthlyConsumptionKwh: number,
    hsp: number = DEFAULT_HSP,
    performanceFactor: number = SYSTEM_PERFORMANCE_FACTOR
): number {
    if (monthlyConsumptionKwh <= 0 || hsp <= 0) return 0;

    const dailyGeneration = hsp * performanceFactor;
    const kWp = monthlyConsumptionKwh / (dailyGeneration * 30);

    return Math.round(kWp * 100) / 100; // Arredonda para 2 casas
}

/**
 * Calcula a geração mensal esperada baseado na potência
 * 
 * Fórmula: geração = kWp * HSP * 30 * fator_performance
 * 
 * @param powerKwp - Potência do sistema em kWp
 * @param hsp - Horas de Sol Pico (default: 4.8)
 * @param performanceFactor - Fator de performance do sistema (default: 0.80)
 * @returns Geração mensal em kWh
 */
export function calculateExpectedGeneration(
    powerKwp: number,
    hsp: number = DEFAULT_HSP,
    performanceFactor: number = SYSTEM_PERFORMANCE_FACTOR
): number {
    if (powerKwp <= 0 || hsp <= 0) return 0;

    const monthlyGeneration = powerKwp * hsp * 30 * performanceFactor;

    return Math.round(monthlyGeneration);
}

/**
 * Busca HSP por estado
 */
export function getHSPByState(stateCode: string): number {
    const state = brazilHSPData.find(s => s.state === stateCode.toUpperCase());
    return state?.hsp || DEFAULT_HSP;
}

/**
 * Busca HSP por cidade (busca parcial)
 */
export function getHSPByCity(cityName: string): number {
    const normalizedCity = cityName.toLowerCase().trim();

    for (const state of brazilHSPData) {
        const city = state.cities.find(c =>
            c.name.toLowerCase().includes(normalizedCity) ||
            normalizedCity.includes(c.name.toLowerCase())
        );
        if (city) return city.hsp;
    }

    return DEFAULT_HSP;
}

/**
 * Lista todas as cidades disponíveis para autocomplete
 */
export function getAllCities(): { city: string; state: string; hsp: number }[] {
    const cities: { city: string; state: string; hsp: number }[] = [];

    for (const state of brazilHSPData) {
        for (const city of state.cities) {
            cities.push({
                city: city.name,
                state: state.state,
                hsp: city.hsp,
            });
        }
    }

    return cities.sort((a, b) => a.city.localeCompare(b.city));
}

/**
 * Lista todos os estados
 */
export function getAllStates(): { code: string; name: string; hsp: number }[] {
    return brazilHSPData.map(s => ({
        code: s.state,
        name: s.stateName,
        hsp: s.hsp,
    }));
}
