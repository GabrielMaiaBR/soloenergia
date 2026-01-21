/**
 * Banco de Argumentos de Venda - Solo Smart
 * 
 * FAQ completo e estruturado para ajudar vendedores de energia solar
 * a responder objeções e dúvidas dos clientes.
 */

export interface SalesArgument {
    id: string;
    category: ArgumentCategory;
    objection: string;
    response: string;
    tips?: string[];
    relatedQuestions?: string[];
}

export type ArgumentCategory =
    | "preco"
    | "financiamento"
    | "tecnico"
    | "confianca"
    | "urgencia"
    | "concorrencia";

export const categoryLabels: Record<ArgumentCategory, string> = {
    preco: "💰 Preço e Investimento",
    financiamento: "🏦 Financiamento",
    tecnico: "⚡ Técnico",
    confianca: "🤝 Confiança",
    urgencia: "⏰ Urgência",
    concorrencia: "🆚 Concorrência",
};

export const categoryColors: Record<ArgumentCategory, string> = {
    preco: "bg-solo-warning/10 text-solo-warning border-solo-warning/30",
    financiamento: "bg-primary/10 text-primary border-primary/30",
    tecnico: "bg-solo-trust/10 text-solo-trust border-solo-trust/30",
    confianca: "bg-solo-success/10 text-solo-success border-solo-success/30",
    urgencia: "bg-solo-danger/10 text-solo-danger border-solo-danger/30",
    concorrencia: "bg-purple-500/10 text-purple-600 border-purple-500/30",
};

export const salesArguments: SalesArgument[] = [
    // ============ PREÇO E INVESTIMENTO ============
    {
        id: "preco-1",
        category: "preco",
        objection: "É muito caro, não tenho esse dinheiro",
        response: `Entendo sua preocupação. Mas deixa eu te mostrar uma perspectiva diferente: você já está pagando pela energia todo mês, certo? A diferença é que esse dinheiro vai pro bolso da concessionária e nunca volta.

Com energia solar, você transforma essa despesa em INVESTIMENTO. O sistema se paga sozinho com a economia que gera. É como se a conta de luz pagasse o financiamento pra você.

Além disso, com a tarifa aumentando em média 8-10% ao ano, quem não investe agora vai pagar cada vez mais. Em 5 anos, sua conta pode estar 50% mais cara.`,
        tips: [
            "Mostre a simulação de cashflow mensal",
            "Compare com outros investimentos (poupança, CDB)",
            "Calcule quanto ele já gastou de luz nos últimos 10 anos"
        ],
        relatedQuestions: ["E se eu esperar o preço baixar?", "Não tenho entrada"]
    },
    {
        id: "preco-2",
        category: "preco",
        objection: "Achei mais barato em outro lugar",
        response: `Fico feliz que você esteja pesquisando! Isso mostra que você é uma pessoa cuidadosa. Agora, deixa eu te fazer algumas perguntas importantes:

1. Os equipamentos são de primeira linha? (JA Solar, Canadian, Trina para módulos / Fronius, SMA, Growatt para inversores)
2. A empresa tem histórico? Quantos anos no mercado?
3. O que está incluso? (projeto, homologação, monitoramento, garantia de mão de obra)
4. Qual a garantia real? Quem vai honrar daqui 10-25 anos?

Às vezes o "barato" sai caro. Já vi muitos clientes que compraram pelo menor preço e hoje estão com sistema parado, sem assistência.

Nosso preço reflete qualidade de equipamento, instalação profissional e suporte real nos próximos 25 anos.`,
        tips: [
            "Pergunte qual inversor e módulos estão sendo oferecidos",
            "Mostre casos de sistemas 'baratos' que deram problema",
            "Destaque seu diferencial de pós-venda"
        ]
    },
    {
        id: "preco-3",
        category: "preco",
        objection: "Vou esperar o preço baixar mais",
        response: `Essa é uma dúvida muito comum! Mas olha só: os preços dos painéis já caíram muito nos últimos anos e agora estabilizaram. O que não estabilizou foi a TARIFA DE ENERGIA - ela continua subindo todo ano.

Cada mês que você espera, você continua pagando a conta de luz cheia. Vamos fazer uma conta rápida:

Se sua economia seria de R$ 500/mês, em 1 ano esperando você "perde" R$ 6.000. Mesmo que o sistema ficasse 10% mais barato (improvável), você já teria perdido mais do que a diferença.

Além disso, existem mudanças regulatórias no horizonte que podem reduzir os benefícios da energia solar. Quem instala agora, garante as regras atuais por 25 anos.`,
        tips: [
            "Calcule a perda mensal de não ter o sistema",
            "Mencione a Lei 14.300 e possíveis mudanças futuras",
            "Ofereça travamento de preço por X dias"
        ]
    },

    // ============ FINANCIAMENTO ============
    {
        id: "fin-1",
        category: "financiamento",
        objection: "A taxa de juros está muito alta",
        response: `Eu entendo a preocupação com juros. Mas vamos analisar de forma diferente:

A pergunta certa não é "quanto custa o financiamento", mas "quanto sobra no meu bolso todo mês".

Olha nossa simulação: mesmo com o financiamento, seu fluxo de caixa mensal [é positivo / tem apenas pequeno desembolso de X reais]. Isso significa que a economia que o sistema gera é maior que a parcela.

E tem mais: depois que o financiamento termina (geralmente em 5-6 anos), você terá mais 20 anos de energia praticamente grátis. O sistema dura 25+ anos!

A conta é simples: você prefere continuar pagando 100% da conta de luz pra sempre, ou pagar o financiamento por alguns anos e depois ter energia gratuita?`,
        tips: [
            "Mostre o cashflow positivo ou quase neutro",
            "Calcule a economia após o fim do financiamento",
            "Compare: parcela vs conta de luz que ele já paga"
        ]
    },
    {
        id: "fin-2",
        category: "financiamento",
        objection: "Não quero me endividar / Tenho medo de financiamento",
        response: `Essa é uma preocupação muito válida! Ninguém quer uma dívida que pese no orçamento.

Mas aqui está o ponto: você já tem uma "dívida" - a conta de luz todo mês. A diferença é que essa dívida não tem fim e aumenta todo ano.

O financiamento solar é diferente porque:
1. TEM PRAZO DEFINIDO - termina em 5-6 anos
2. A ECONOMIA PAGA - a redução na conta cobre (ou quase) a parcela
3. GERA PATRIMÔNIO - diferente da conta de luz, você fica com um ativo que valoriza o imóvel

É como trocar aluguel pela parcela de uma casa própria, só que no final você ainda tem a casa!`,
        tips: [
            "Enfatize que é uma dívida que se paga sozinha",
            "Mostre que a conta de luz é um 'aluguel de energia' sem fim",
            "Fale sobre valorização do imóvel"
        ]
    },
    {
        id: "fin-3",
        category: "financiamento",
        objection: "Não tenho entrada",
        response: `Sem problema! Temos opções de financiamento com entrada zero, onde você parcela 100% do valor.

Inclusive, muitos clientes preferem assim porque mesmo tendo dinheiro guardado, faz mais sentido deixar rendendo e usar o financiamento que se paga com a economia.

Vamos fazer a simulação sem entrada e você vai ver que o fluxo de caixa ainda fica muito interessante.`,
        tips: [
            "Simule cenários com e sem entrada",
            "Mostre que a entrada não muda tanto o cashflow mensal",
            "Sugira usar entrada para aumentar a potência do sistema"
        ]
    },

    // ============ TÉCNICO ============
    {
        id: "tec-1",
        category: "tecnico",
        objection: "E se chover muito / não bater sol?",
        response: `Ótima pergunta! Os painéis funcionam com LUZ, não necessariamente sol direto. Mesmo em dias nublados, eles geram energia - menos, é verdade, mas geram.

Nosso dimensionamento já considera a média de radiação solar da sua região ao longo do ano todo, incluindo dias nublados e chuvosos.

Além disso, o sistema é conectado à rede. Nos dias de boa geração, você "exporta" energia para a concessionária e ganha créditos. Nos dias de baixa geração, usa esses créditos. É um sistema de compensação que funciona como uma "conta corrente de energia".

Por isso conseguimos garantir que você vai economizar o que calculamos.`,
        tips: [
            "Explique o conceito de créditos de energia",
            "Mostre dados de irradiação da cidade",
            "Mencione que o sistema é dimensionado para a média anual"
        ]
    },
    {
        id: "tec-2",
        category: "tecnico",
        objection: "Meu telhado é pequeno / não sei se cabe",
        response: `Vamos analisar! Com a tecnologia atual, precisamos de aproximadamente 7m² de área por kWp instalado.

Para seu consumo de [X] kWh/mês, estimamos um sistema de [Y] kWp, que precisa de cerca de [Z]m² de área.

Mas se o espaço for limitado, temos algumas opções:
1. Usar painéis de maior potência (550W ou mais) que aproveitam melhor a área
2. Instalar em outros espaços (área de serviço, garagem, pergolado)
3. Dimensionar para o espaço disponível e cobrir parte do consumo

Posso fazer uma visita técnica gratuita para avaliar as opções?`,
        tips: [
            "Pergunte as dimensões aproximadas do telhado",
            "Sugira visita técnica para avaliação",
            "Apresente opção de sistema híbrido (solo + telhado)"
        ]
    },
    {
        id: "tec-3",
        category: "tecnico",
        objection: "E a manutenção? Dá muito trabalho?",
        response: `Energia solar é famosa pela BAIXA manutenção! O sistema não tem partes móveis, então não tem desgaste mecânico.

A única manutenção regular é uma limpeza dos painéis 2-3 vezes por ano, que você mesmo pode fazer com água e uma vassoura macia. Em muitas regiões, a própria chuva já faz esse serviço!

O inversor pode precisar de manutenção após 10-12 anos, e eventualmente substituição (já previsto no cálculo de longo prazo).

Além disso, oferecemos acompanhamento via app de monitoramento. Se qualquer coisa sair do normal, você e nós somos notificados automaticamente.`,
        tips: [
            "Mostre o app de monitoramento",
            "Enfatize que não precisa subir no telhado com frequência",
            "Mencione garantias: módulos 25 anos, inversor 10-12 anos"
        ]
    },
    {
        id: "tec-4",
        category: "tecnico",
        objection: "E se faltar energia da rua? O solar funciona?",
        response: `Essa é uma dúvida técnica importante! No sistema conectado à rede (on-grid), que é o mais comum e mais barato, quando falta energia da rua, o sistema solar também desliga por segurança.

Isso é uma exigência de segurança para proteger quem trabalha na rede elétrica durante a manutenção.

Mas se ter energia durante quedas for prioridade pra você, podemos instalar um sistema híbrido com baterias. Ele custa um pouco mais, mas mantém sua casa funcionando mesmo sem a rede.

Para a maioria dos clientes residenciais, o sistema on-grid atende perfeitamente - as quedas de energia são raras e curtas.`,
        tips: [
            "Pergunte a frequência de quedas na região",
            "Calcule o custo-benefício de adicionar bateria",
            "Explique que bateria pode ser adicionada depois"
        ]
    },

    // ============ CONFIANÇA ============
    {
        id: "conf-1",
        category: "confianca",
        objection: "Não conheço vocês / nunca ouvi falar da empresa",
        response: `Essa preocupação é muito válida - energia solar é um investimento de longo prazo e você quer parceiros confiáveis.

Deixa eu me apresentar melhor:
- Atuamos há [X] anos no mercado de energia solar
- Já instalamos [X] sistemas na região
- Temos avaliação [X] no Google com [X] avaliações
- Somos homologados pela [concessionária local]

Posso te passar contatos de clientes que já instalaram pra você conversar diretamente com eles. Além disso, fazemos questão de acompanhar você não só na instalação, mas ao longo dos anos.

Também trabalhamos apenas com equipamentos de fabricantes consolidados mundialmente, que têm representação no Brasil pra garantir a garantia.`,
        tips: [
            "Tenha depoimentos e cases prontos para mostrar",
            "Ofereça visita a instalações anteriores",
            "Mostre certificações e homologações"
        ]
    },
    {
        id: "conf-2",
        category: "confianca",
        objection: "E se a empresa fechar? Quem vai dar suporte?",
        response: `Essa é uma preocupação legítima, especialmente em um mercado que cresceu rápido.

Por isso é importante olhar para:

1. **Equipamentos de marcas globais**: Os fabricantes que usamos (JA Solar, Canadian, Growatt, Fronius) têm representação própria no Brasil e honram garantias diretamente.

2. **Nosso modelo de negócio**: Não somos uma empresa de aventura. Temos [X] anos de mercado, sede física, equipe própria.

3. **Sistema simples**: Mesmo sem nós, qualquer técnico em energia solar consegue dar manutenção. Não há lock-in tecnológico.

4. **Documentação completa**: Você recebe projeto, ART, manual, tudo documentado para qualquer profissional dar continuidade.

A verdade é que o risco maior é continuar pagando conta de luz pra sempre do que investir em solar.`,
        tips: [
            "Enfatize as garantias dos fabricantes",
            "Moste estrutura física da empresa",
            "Entregue documentação completa"
        ]
    },

    // ============ URGÊNCIA ============
    {
        id: "urg-1",
        category: "urgencia",
        objection: "Vou pensar melhor / preciso consultar minha família",
        response: `Claro, decisão importante deve ser pensada mesmo! Só me permite deixar alguns pontos pra você levar na conversa:

1. **Cada dia esperando é dinheiro perdido**: Se a economia é de R$ [X]/mês, cada mês de análise são R$ [X] que você poderia estar economizando.

2. **Preço pode mudar**: Consigo manter essa condição especial por [X] dias, mas não posso garantir depois.

3. **Demora para ligar**: Entre fechamento, instalação e homologação, leva cerca de 45-60 dias para o sistema começar a gerar. Quanto antes começar, antes começa a economia.

Que tal eu mandar um resumo por WhatsApp pra facilitar a conversa com a família? Posso incluir a simulação e os principais pontos.`,
        tips: [
            "Entenda quem é o decisor real",
            "Ofereça para fazer apresentação para a família",
            "Calcule a 'perda' mensal de não decidir"
        ]
    },
    {
        id: "urg-2",
        category: "urgencia",
        objection: "Agora não é um bom momento, talvez ano que vem",
        response: `Entendo que timing é importante. Mas deixa eu compartilhar algo:

O "momento certo" para energia solar foi ontem. O segundo melhor momento é hoje.

Por quê?

1. **A tarifa não espera**: Ela sobe todo ano. A conta de 2025 vai ser mais cara que a de 2024.

2. **Regulamentação pode mudar**: A Lei 14.300 já trouxe mudanças. Novas regras podem ser menos favoráveis.

3. **Início do ano é lotado**: Se deixar pra ano que vem, vai entrar na fila junto com todo mundo. Melhor garantir agora e ter instalação rápida.

Se a questão for o investimento inicial, posso mostrar opções que cabem no seu momento atual. O que te faria sentir confortável para começar?`,
        tips: [
            "Entenda o real motivo do adiamento",
            "Mostre o custo de oportunidade de esperar",
            "Flexibilize condições se possível"
        ]
    },

    // ============ CONCORRÊNCIA ============
    {
        id: "conc-1",
        category: "concorrencia",
        objection: "Recebi proposta de um concorrente oferecendo algo melhor",
        response: `Que bom que você está comparando! Isso mostra que você está fazendo a lição de casa.

Posso ver a proposta deles? Não pra falar mal, mas pra te ajudar a comparar maçãs com maçãs.

Alguns pontos importantes para checar:
- Potência real dos módulos e marca
- Marca e modelo do inversor
- O que está incluído: estrutura, eletrodutos, proteções, homologação
- Garantia real: quem dá? Por quanto tempo?
- Suporte pós-venda: monitoramento, visitas técnicas

Às vezes uma proposta parece mais barata, mas quando você olha os detalhes, faltam coisas importantes que vão custar depois.

Se depois de comparar você ainda preferir eles, tudo bem! O importante é você ter feito uma boa escolha.`,
        tips: [
            "Nunca fale mal direto do concorrente",
            "Ajude o cliente a criar uma matriz de comparação",
            "Destaque seus diferenciais de forma factual"
        ]
    },
    {
        id: "conc-2",
        category: "concorrencia",
        objection: "Vi na internet que existem painéis mais baratos na China",
        response: `É verdade que os painéis são fabricados na China - inclusive os das melhores marcas como JA Solar, Canadian, Trina. Eles dominam o mercado mundial.

A questão não é onde é fabricado, mas:

1. **Quem é o fabricante**: Existem centenas de fábricas. As boas têm padrões rigorosos de qualidade.

2. **Garantia no Brasil**: Quem vai honrar a garantia? Os bons fabricantes têm representação aqui.

3. **Certificações**: Os painéis têm certificação INMETRO? Sem isso, não pode ser instalado legalmente.

4. **Logística e suporte**: Comprar direto "barato" pode sair caro quando você precisar de assistência.

Trabalhamos com marcas Tier 1 (as melhores do ranking Bloomberg) que têm décadas de histórico e presença no Brasil.`,
        tips: [
            "Explique o conceito de Tier 1 da Bloomberg",
            "Mostre que as boas marcas são chinesas mesmo",
            "Enfatize a importância do suporte local"
        ]
    },
];

/**
 * Busca argumentos por categoria
 */
export function getArgumentsByCategory(category: ArgumentCategory): SalesArgument[] {
    return salesArguments.filter(arg => arg.category === category);
}

/**
 * Busca argumentos por texto (busca em objeção e resposta)
 */
export function searchArguments(query: string): SalesArgument[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return salesArguments;

    return salesArguments.filter(arg =>
        arg.objection.toLowerCase().includes(normalizedQuery) ||
        arg.response.toLowerCase().includes(normalizedQuery) ||
        arg.tips?.some(t => t.toLowerCase().includes(normalizedQuery))
    );
}

/**
 * Retorna todas as categorias únicas
 */
export function getAllCategories(): ArgumentCategory[] {
    return Object.keys(categoryLabels) as ArgumentCategory[];
}
