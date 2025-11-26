import { DriveStep } from 'driver.js';

export const dashboardSteps: DriveStep[] = [
    {
        popover: {
            title: '👋 Bem-vindo ao Fynx!',
            description: 'Este tour apresenta os principais indicadores e ações da sua Dashboard. Em cada passo você verá para que serve o bloco e como usá-lo para tomar decisões melhores.\n\nDica: Use o tour sempre que quiser relembrar funcionalidades ou apresentar o sistema a novos usuários.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="balance-card"]',
        popover: {
            title: '💰 Saldo / Balanço',
            description: 'Mostra o resultado do período (Receitas - Despesas).\n\nSe o saldo está positivo, parabéns! Se estiver negativo, avalie onde pode reduzir gastos ou aumentar receitas.\n\nExemplo: Se você recebeu R$ 3.000 e gastou R$ 2.500, seu saldo é R$ 500.\n\nDica: Use este bloco como um "termômetro" rápido antes de detalhar categorias ou tendências.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="income-card"]',
        popover: {
            title: '📈 Receitas do Mês',
            description: 'Total de entradas confirmadas no mês atual.\n\nAcompanhe a evolução dos seus ganhos e veja se suas metas de aumento de renda estão sendo atingidas.\n\nExemplo: Salário, vendas, freelances, reembolsos.\n\nDica: Categorize corretamente para identificar fontes de renda mais relevantes.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="expenses-card"]',
        popover: {
            title: '📉 Despesas do Mês',
            description: 'Somatório de todos os gastos registrados no mês.\n\nCompare com seus limites e metas para evitar excessos.\n\nExemplo: Alimentação, transporte, lazer, contas fixas.\n\nDica: Revise despesas recorrentes e busque oportunidades de economia.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="savings-card"]',
        popover: {
            title: '🎯 Poupança / Meta',
            description: 'Exibe seu progresso rumo à meta ou sua taxa de poupança (parte da renda que não virou despesa).\n\nAcompanhe se está conseguindo guardar dinheiro para seus objetivos.\n\nExemplo: Meta de R$ 5.000 para viagem, reserva de emergência, etc.\n\nDica: Pequenos aportes mensais fazem grande diferença no longo prazo.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="category-chart"]',
        popover: {
            title: '🧷 Distribuição por Categoria',
            description: 'Mostra onde o dinheiro está sendo aplicado ou gasto.\n\nFoque nas maiores fatias para encontrar oportunidades de redução ou realocação.\n\nExemplo: Se alimentação representa 40% dos gastos, avalie se é possível reduzir.\n\nDica: Use este gráfico para identificar hábitos e ajustar prioridades.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="revenue-chart"]',
        popover: {
            title: '📊 Comparação Diária',
            description: 'Linhas de receitas e despesas dia a dia no período selecionado.\n\nProcure picos fora do padrão para investigar ou ajustar comportamento rapidamente.\n\nExemplo: Um pico de despesa pode indicar uma compra fora do planejado.\n\nDica: Analise padrões para evitar surpresas no orçamento.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="goals-widget"]',
        popover: {
            title: '🎯 Minhas Metas',
            description: 'Acompanhe suas metas de poupança e controle de gastos.\n\nVisualize o progresso e ajuste prioridades conforme necessário para alcançar seus objetivos financeiros.\n\nExemplo: Meta de gastar até R$ 500 em lazer ou economizar R$ 200 por mês.\n\nDica: Revise metas periodicamente para mantê-las desafiadoras e realistas.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="recent-transactions"]',
        popover: {
            title: '📋 Transações Recentes',
            description: 'Veja as últimas movimentações.\nEdite ou remova para manter os dados corretos.\nExemplo: Corrija valores errados ou duplicados.\nDica: Histórico atualizado = relatórios confiáveis.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="monthly-chart"]',
        popover: {
            title: '📊 Entradas e Saídas Mensais',
            description: 'Gráfico de barras mostrando receitas e despesas mês a mês.\n\nUse para identificar tendências de longo prazo e planejar ajustes sazonais no orçamento.\n\nExemplo: Gastos maiores em dezembro podem indicar despesas de fim de ano.\n\nDica: Antecipe-se a meses de maior gasto para evitar aperto financeiro.',
            side: 'top',
            align: 'start'
        }
    },
    {
        element: '[data-tour="add-transaction-btn"]',
        popover: {
            title: '➕ Novo Lançamento',
            description: 'Botão flutuante para registrar uma nova transação (entrada ou saída) instantaneamente.\n\nQuanto mais rápido você registra, mais fiel fica seu painel.\n\nDica: Não deixe para depois! Registre assim que acontecer para não esquecer detalhes.',
            side: 'left',
            align: 'start'
        }
    },
    {
        popover: {
            title: '✅ Tour Concluído!',
            description: 'Você já viu os principais blocos!\n\nUse o menu de Ajuda para refazer o tour quando quiser ou avance para outras áreas (Metas, Ranking, Transações).\n\nDica: Compartilhe o tour com colegas ou familiares para ajudá-los a organizar suas finanças também. Bom proveito!',
            side: 'bottom',
            align: 'center'
        }
    }
];
