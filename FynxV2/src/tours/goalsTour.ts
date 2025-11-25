import { DriveStep } from 'driver.js';

export const goalsSteps: DriveStep[] = [
    {
        popover: {
            title: '🎯 Gerenciando Metas',
            description: 'Aprenda a criar e acompanhar suas metas financeiras para ter mais controle e alcançar seus objetivos!\n\nDica: Definir metas claras aumenta sua motivação e facilita o acompanhamento do progresso.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        popover: {
            title: '📊 Dois Tipos de Metas',
            description: 'Existem dois tipos de metas:\n\n• **Metas de Gasto**: Defina limites para não ultrapassar em categorias como alimentação, lazer, transporte.\n• **Metas de Poupança**: Objetivos para economizar, como viagem, reserva de emergência, compra de um bem.\n\nExemplo: "Gastar no máximo R$ 500 em restaurantes este mês" ou "Economizar R$ 2.000 para uma viagem".',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="spending-goals-section"]',
        popover: {
            title: '🛡️ Metas de Gasto',
            description: 'Defina limites para categorias específicas (alimentação, transporte, etc.).\n\nDica: Analise seus gastos anteriores para definir limites realistas.\n\nExemplo: Se gastou R$ 600 em transporte no mês passado, tente limitar para R$ 550 este mês.',
            side: 'top',
            align: 'start'
        }
    },
    {
        element: '[data-tour="create-spending-goal-btn"]',
        popover: {
            title: '➕ Criar Meta de Gasto',
            description: 'Clique aqui para definir um novo limite.\n\nDica: Dê nomes claros às metas para facilitar o acompanhamento.\n\nExemplo: "Limite de Lazer Novembro".',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="saving-goals-section"]',
        popover: {
            title: '💰 Metas de Poupança',
            description: 'Crie objetivos de economia para seus sonhos: viagem, carro, reserva de emergência, etc.\n\nDica: Divida grandes metas em etapas menores para manter a motivação.\n\nExemplo: "Economizar R$ 500 por mês para a viagem dos sonhos".',
            side: 'top',
            align: 'start'
        }
    },
    {
        element: '[data-tour="create-saving-goal-btn"]',
        popover: {
            title: '➕ Criar Meta de Poupança',
            description: 'Defina seu objetivo: nome, valor alvo, prazo e descrição.\n\nDica: Estabeleça prazos realistas e acompanhe o progresso mês a mês.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="goal-progress-bar"]',
        popover: {
            title: '📈 Barra de Progresso',
            description: 'A barra mostra visualmente quanto você já progrediu em relação à meta.\n\nDica: Atualize sempre que fizer um novo aporte ou gasto vinculado à meta.\n\nExemplo: 60% concluído significa que você já economizou R$ 600 de uma meta de R$ 1.000.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="add-to-goal-btn"]',
        popover: {
            title: '➕ Adicionar Transação à Meta',
            description: 'Clique no botão + para adicionar uma transação vinculada à meta.\n\nDica: Vincule receitas a metas de poupança e despesas a metas de gasto para acompanhar o impacto direto.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="delete-goal-btn"]',
        popover: {
            title: '🗑️ Deletar Meta',
            description: 'O botão de lixeira permite excluir uma meta.\n\nDica: Só exclua metas que não fazem mais sentido para seus objetivos. Prefira ajustar valores ou prazos quando possível.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '✅ Metas Configuradas!',
            description: 'Agora você sabe como criar e gerenciar suas metas financeiras!\n\nDica: Revise suas metas todo mês e ajuste conforme sua realidade. O segredo é persistência e adaptação.',
            side: 'bottom',
            align: 'center'
        }
    }
];
