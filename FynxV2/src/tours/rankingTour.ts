import { DriveStep } from 'driver.js';

export const rankingSteps: DriveStep[] = [
    {
        popover: {
            title: '🏆 Sistema de Gamificação',
            description: 'Descubra como ganhar pontos, subir de nível e conquistar badges mantendo suas finanças organizadas!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="user-level-card"]',
        popover: {
            title: '⭐ Seu Nível',
            description: 'Aqui você vê seu nível atual e a experiência (XP) acumulada. Quanto mais você usa a plataforma, mais XP ganha!',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="user-league"]',
        popover: {
            title: '🥇 Sua Liga',
            description: 'As ligas vão de Bronze até Diamante. Sua liga é determinada pela sua pontuação total. Quanto maior a pontuação, melhor a liga!',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="earn-points-section"]',
        popover: {
            title: '💎 Como Ganhar Pontos',
            description: 'Você ganha pontos de várias formas:',
            side: 'left',
            align: 'start'
        }
    },
    {
        popover: {
            title: '📝 Registrando Transações',
            description: 'Cada transação registrada = +10 pontos. Mantenha um histórico completo das suas finanças!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        popover: {
            title: '🎯 Completando Metas',
            description: 'Meta completada = +50 pontos! Crie e alcance metas para ganhar mais XP.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        popover: {
            title: '🔥 Mantendo Streak',
            description: 'Use a plataforma consecutivamente para manter seu streak ativo e ganhar pontos de bônus!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="achievements-section"]',
        popover: {
            title: '🏅 Conquistas',
            description: 'Desbloqueie badges especiais ao atingir marcos importantes. Cada badge tem uma pontuação associada!',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="ranking-list"]',
        popover: {
            title: '📊 Ranking Global',
            description: 'Veja sua posição em relação a outros usuários. Compete de forma saudável e melhore sua educação financeira!',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="season-info"]',
        popover: {
            title: '🔄 Sistema de Temporadas',
            description: 'O ranking é resetado periodicamente. Você mantém uma parte da pontuação (carry-over) e começa uma nova temporada!',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '🎮 Divirta-se!',
            description: 'Use a gamificação como motivação para manter suas finanças organizadas. Quanto mais você cuida do seu dinheiro, mais pontos ganha!',
            side: 'bottom',
            align: 'center'
        }
    }
];

export const getRankingTourSteps = () => rankingSteps;
