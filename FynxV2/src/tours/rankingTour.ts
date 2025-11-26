import { DriveStep } from 'driver.js';

export const rankingSteps: DriveStep[] = [
    {
        popover: {
            title: '🏆 Sistema de Gamificação',
            description: 'Descubra como ganhar pontos, subir de nível e conquistar badges mantendo suas finanças organizadas!\n\nDica: Use a gamificação como motivação extra para manter o controle financeiro em dia.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="user-level-card"]',
        popover: {
            title: '⭐ Seu Nível',
            description: 'Aqui você vê seu nível atual e a experiência (XP) acumulada.\n\nQuanto mais você usa a plataforma, mais XP ganha!\n\nExemplo: Registrar transações, criar metas e completar desafios aumentam seu XP.\n\nDica: Acompanhe sua evolução e busque sempre avançar para o próximo nível.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="user-league"]',
        popover: {
            title: '🥇 Sua Liga',
            description: 'As ligas vão de Bronze até Diamante.\n\nSua liga é determinada pela sua pontuação total. Quanto maior a pontuação, melhor a liga!\n\nDica: Suba de liga acumulando pontos e completando metas. Compartilhe sua conquista com amigos!',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="earn-points-section"]',
        popover: {
            title: '💎 Como Ganhar Pontos',
            description: 'Você ganha pontos de várias formas:\n\n• Registrar transações (+10 pontos cada)\n• Completar metas (+50 pontos)\n• Manter streak de uso diário\n\nDica: Quanto mais engajado, mais rápido você sobe no ranking!',
            side: 'left',
            align: 'start'
        }
    },
    {
        popover: {
            title: '📝 Registrando Transações',
            description: 'Cada transação registrada = +10 pontos.\n\nMantenha um histórico completo das suas finanças!\n\nDica: Não deixe de registrar nenhuma movimentação para maximizar seus pontos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        popover: {
            title: '🎯 Completando Metas',
            description: 'Meta completada = +50 pontos!\n\nCrie e alcance metas para ganhar mais XP.\n\nExemplo: Economizar R$ 1.000 ou manter gastos abaixo do limite por 3 meses.\n\nDica: Metas desafiadoras rendem mais pontos!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        popover: {
            title: '🔥 Mantendo Streak',
            description: 'Use a plataforma consecutivamente para manter seu streak ativo e ganhar pontos de bônus!\n\nDica: Acesse todos os dias para não perder o streak e garantir recompensas extras.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="achievements-section"]',
        popover: {
            title: '🏅 Conquistas',
            description: 'Desbloqueie badges especiais ao atingir marcos importantes.\n\nCada badge tem uma pontuação associada!\n\nExemplo: Badge de "Primeira Transação", "Meta Alcançada", "Economizador".\n\nDica: Veja todas as conquistas disponíveis e busque completar o máximo possível.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="ranking-list"]',
        popover: {
            title: '📊 Ranking Global',
            description: 'Veja sua posição em relação a outros usuários.\n\nCompita de forma saudável e melhore sua educação financeira!\n\nDica: Use o ranking como incentivo para evoluir e trocar experiências com outros usuários.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="season-info"]',
        popover: {
            title: '🔄 Sistema de Temporadas',
            description: 'O ranking é resetado periodicamente.\n\nVocê mantém uma parte da pontuação (carry-over) e começa uma nova temporada!\n\nDica: Aproveite o início de cada temporada para traçar novas metas e buscar o topo do ranking.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '🎮 Divirta-se!',
            description: 'Use a gamificação como motivação para manter suas finanças organizadas.\n\nQuanto mais você cuida do seu dinheiro, mais pontos ganha!\n\nDica: Compartilhe suas conquistas e motive amigos e familiares a entrarem na brincadeira financeira.',
            side: 'bottom',
            align: 'center'
        }
    }
];

export const getRankingTourSteps = () => rankingSteps;
