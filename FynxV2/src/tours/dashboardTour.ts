import { DriveStep } from 'driver.js';

export const dashboardSteps: DriveStep[] = [
    {
        popover: {
            title: '👋 Bem-vindo ao Fynx!',
            description: 'Vamos fazer um tour rápido para você conhecer as principais funcionalidades da plataforma.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="balance-card"]',
        popover: {
            title: '💰 Saldo Total',
            description: 'Aqui você visualiza seu saldo atual, calculado automaticamente com base em suas receitas e despesas.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="income-card"]',
        popover: {
            title: '📈 Receitas Mensais',
            description: 'Total de receitas registradas no mês atual.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="expenses-card"]',
        popover: {
            title: '📉 Despesas Mensais',
            description: 'Total de despesas do mês. Fique atento a esse valor!',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="savings-card"]',
        popover: {
            title: '🎯 Meta de Poupança',
            description: 'Acompanhe seu progresso rumo às suas metas de poupança.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="revenue-chart"]',
        popover: {
            title: '📊 Gráfico de Receitas vs Despesas',
            description: 'Visualize a evolução de suas receitas e despesas ao longo do tempo.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="category-chart"]',
        popover: {
            title: '🥧 Distribuição por Categoria',
            description: 'Veja como suas despesas estão distribuídas entre diferentes categorias.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="recent-transactions"]',
        popover: {
            title: '📋 Transações Recentes',
            description: 'Lista de suas transações mais recentes. Você pode editar ou deletar transações aqui.',
            side: 'top',
            align: 'start'
        }
    },
    {
        popover: {
            title: '✅ Tour Concluído!',
            description: 'Agora você conhece os principais recursos do Dashboard. Explore à vontade!',
            side: 'bottom',
            align: 'center'
        }
    }
];
