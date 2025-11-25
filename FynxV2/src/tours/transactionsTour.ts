import { DriveStep } from 'driver.js';

export const transactionsSteps: DriveStep[] = [
    {
        popover: {
            title: '💸 Gerenciando Transações',
            description: 'Vamos aprender como adicionar e gerenciar suas transações de forma simples e rápida.\n\nDica: Manter o registro atualizado é essencial para ter controle real das finanças.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="add-transaction-btn"]',
        popover: {
            title: '➕ Adicionar Nova Transação',
            description: 'Clique neste botão para abrir o formulário de nova transação.\n\nDica: Registre imediatamente após a compra ou recebimento para não esquecer detalhes.\n\nExemplo: Salário, supermercado, cinema, transporte.',
            side: 'left',
            align: 'start'
        }
    },
    {
        popover: {
            title: '📝 Descrição da Transação',
            description: 'Descreva sua transação de forma clara.\n\nExemplo: "Salário", "Supermercado", "Cinema", "Uber".\n\nDica: Use descrições padronizadas para facilitar buscas e relatórios.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '💵 Valor',
            description: 'Digite o valor da transação. O sistema formata automaticamente como moeda (R$).\n\nDica: Use valores exatos, sem arredondar, para maior precisão nos relatórios.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '🔄 Tipo de Transação',
            description: 'Selecione "Entrada" para receitas (salário, freelance, etc.) ou "Saída" para despesas (compras, contas, etc.).\n\nExemplo: Entrada = salário, venda; Saída = aluguel, mercado.\n\nDica: Classifique corretamente para relatórios mais precisos.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '🏷️ Categoria',
            description: 'Escolha uma categoria ou crie uma personalizada em "Gerenciar categorias".\n\nIsso ajuda na organização e análise dos gastos.\n\nExemplo: Alimentação, Transporte, Saúde, Lazer.\n\nDica: Categorize tudo! Assim você descobre para onde vai seu dinheiro.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '📅 Data',
            description: 'Selecione a data da transação. Você pode digitar ou usar o calendário.\n\nDica: Mantenha as datas corretas para acompanhar evolução e identificar padrões de gastos.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '🎯 Vincular a Meta',
            description: 'Se quiser, vincule esta transação a uma meta existente.\n\nPara despesas, vincule a metas de gasto. Para receitas, vincule a metas de poupança.\n\nDica: Vincular transações a metas facilita o acompanhamento do progresso.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '🔁 Transação Recorrente',
            description: 'Ative esta opção para transações que se repetem mensalmente (aluguel, assinaturas, etc.).\n\nExemplo: Netflix, aluguel, academia.\n\nDica: Use para não esquecer de lançar despesas fixas todo mês.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '✅ Salvar',
            description: 'Após preencher os dados, clique em "Salvar Transação".\n\nEla aparecerá imediatamente na lista de transações recentes.\n\nDica: Revise antes de salvar para evitar erros e retrabalho.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '✏️ Editar e Deletar',
            description: 'Nas transações existentes, você pode editar ou excluir a qualquer momento usando os ícones de ação.\n\nDica: Mantenha o histórico limpo e atualizado para relatórios mais confiáveis.\n\nExemplo: Corrija valores errados ou remova lançamentos duplicados sempre que identificar.',
            side: 'bottom',
            align: 'center'
        }
    }
];

export const getTransactionsTourSteps = () => transactionsSteps;
