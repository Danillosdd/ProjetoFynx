import { DriveStep } from 'driver.js';

export const dashboardSteps: DriveStep[] = [
    {
        popover: {
            title: '👋 Bem-vindo ao Fynx!',
            description: 'Este tour apresenta os principais indicadores e ações da sua Dashboard. Em cada passo você verá para que serve o bloco e como usá-lo para tomar decisões melhores.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="balance-card"]',
        popover: {
            title: '💰 Saldo / Balanço',
            description: 'Mostra o resultado do período (Receitas - Despesas). Acompanhe aqui se você está fechando o mês positivo. Use como termômetro rápido antes de detalhar categorias ou tendências.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="income-card"]',
        popover: {
            title: '📈 Receitas do Mês',
            description: 'Total de entradas confirmadas no mês atual. Ideal para comparar evolução de ganhos e validar se metas de aumento de renda estão funcionando.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="expenses-card"]',
        popover: {
            title: '📉 Despesas do Mês',
            description: 'Somatório de todos os gastos registrados. Compare com seus limites e metas para segurar excessos antes do fim do período.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="savings-card"]',
        popover: {
            title: '🎯 Poupança / Meta',
            description: 'Exibe seu progresso rumo à meta ou sua taxa de poupança (parte da renda que não virou despesa). Serve para medir a saúde financeira de longo prazo.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="revenue-chart"]',
        popover: {
            title: '📊 Comparação Diária',
            description: 'Linhas de receitas e despesas dia a dia no período selecionado. Procure picos fora do padrão para investigar ou ajustar comportamento rapidamente.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="category-chart"]',
        popover: {
            title: '🥧 Distribuição por Categoria',
            description: 'Mostra onde o dinheiro está sendo aplicado ou gasto. Foque nas maiores fatias para encontrar oportunidades de redução ou realocação.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="recent-transactions"]',
        popover: {
            title: '📋 Transações Recentes',
            description: 'Últimas movimentações registradas. Edite ou remova rapidamente para manter seus dados limpos e evitar distorções em relatórios.',
            side: 'top',
            align: 'start'
        }
    },
    {
        element: '[data-tour="add-transaction-btn"]',
        popover: {
            title: '➕ Novo Lançamento',
            description: 'Botão flutuante para registrar uma nova transação (entrada ou saída) instantaneamente. Quanto mais rápido você registra, mais fiel fica seu painel.',
            side: 'left',
            align: 'start'
        }
    },
    {
        popover: {
            title: '✅ Tour Concluído!',
            description: 'Você já viu os principais blocos. Use o menu de Ajuda para refazer o tour quando quiser ou avance para outras áreas (Metas, Ranking, Transações). Bom proveito!',
            side: 'bottom',
            align: 'center'
        }
    }
];
