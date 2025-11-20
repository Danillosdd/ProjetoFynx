import { DriveStep } from 'driver.js';

export const transactionsSteps: DriveStep[] = [
    {
        popover: {
            title: '💸 Gerenciando Transações',
            description: 'Vamos aprender como adicionar e gerenciar suas transações de forma simples e rápida.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="add-transaction-btn"]',
        popover: {
            title: '➕ Adicionar Nova Transação',
            description: 'Clique neste botão para abrir o formulário de nova transação.',
            side: 'left',
            align: 'start'
        }
    },
    {
        popover: {
            title: '📝 Descrição da Transação',
            description: 'Descreva sua transação de forma clara. Exemplos: "Salário", "Supermercado", "Cinema", etc.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '💵 Valor',
            description: 'Digite o valor da transação. O sistema formata automaticamente como moeda (R$).',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '🔄 Tipo de Transação',
            description: 'Selecione "Entrada" para receitas (salário, freelance, etc.) ou "Saída" para despesas (compras, contas, etc.).',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '🏷️ Categoria',
            description: 'Escolha uma categoria ou crie uma personalizada em "Gerenciar categorias". Isso ajuda na organização e análise dos gastos.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '📅 Data',
            description: 'Selecione a data da transação. Você pode digitar ou usar o calendário.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '🎯 Vincular a Meta',
            description: 'Se quiser, vincule esta transação a uma meta existente. Para despesas, vincule a metas de gasto. Para receitas, vincule a metas de poupança.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '🔁 Transação Recorrente',
            description: 'Ative esta opção para transações que se repetem mensalmente (aluguel, assinaturas, etc.).',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '✅ Salvar',
            description: 'Após preencher os dados, clique em "Salvar Transação". Ela aparecerá imediatamente na lista de transações recentes.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '✏️ Editar e Deletar',
            description: 'Nas transações existentes, você pode editar ou excluir a qualquer momento usando os ícones de ação.',
            side: 'bottom',
            align: 'center'
        }
    }
];

export const getTransactionsTourSteps = () => transactionsSteps;
