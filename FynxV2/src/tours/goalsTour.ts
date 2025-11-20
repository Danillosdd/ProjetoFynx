import { DriveStep } from 'driver.js';

export const goalsSteps: DriveStep[] = [
    {
        popover: {
            title: '🎯 Gerenciando Metas',
            description: 'Aprenda a criar e acompanhar suas metas financeiras para ter mais controle e alcançar seus objetivos!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        popover: {
            title: '📊 Dois Tipos de Metas',
            description: 'Existem dois tipos de metas: **Metas de Gasto** (limites para não ultrapassar) e **Metas de Poupança** (objetivos para economizar).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="spending-goals-section"]',
        popover: {
            title: '🛑 Metas de Gasto',
            description: 'Defina limites para categorias específicas (alimentação, transporte, etc.).',
            side: 'top',
            align: 'start'
        }
    },
    {
        element: '[data-tour="create-spending-goal-btn"]',
        popover: {
            title: '➕ Criar Meta de Gasto',
            description: 'Clique aqui para definir um novo limite.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="saving-goals-section"]',
        popover: {
            title: '💰 Metas de Poupança',
            description: 'Crie objetivos de economia para seus sonhos: viagem, carro, reserva de emergência, etc.',
            side: 'top',
            align: 'start'
        }
    },
    {
        element: '[data-tour="create-saving-goal-btn"]',
        popover: {
            title: '➕ Criar Meta de Poupança',
            description: 'Defina seu objetivo: nome, valor alvo, prazo e descrição.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="goal-progress-bar"]',
        popover: {
            title: '📈 Barra de Progresso',
            description: 'A barra mostra visualmente quanto você já progrediu em relação à meta.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="add-to-goal-btn"]',
        popover: {
            title: '➕ Adicionar Transação à Meta',
            description: 'Clique no botão + para adicionar uma transação vinculada à meta.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="delete-goal-btn"]',
        popover: {
            title: '🗑️ Deletar Meta',
            description: 'O botão de lixeira permite excluir uma meta.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '✅ Metas Configuradas!',
            description: 'Agora você sabe como criar e gerenciar suas metas financeiras.',
            side: 'bottom',
            align: 'center'
        }
    }
];
