export const INITIAL_CATEGORIES = [
  { name: 'Alimentação', type: 'expense', color: '#FF6B6B', icon: '🍽️' },
  { name: 'Transporte', type: 'expense', color: '#4ECDC4', icon: '🚗' },
  { name: 'Moradia', type: 'expense', color: '#45B7D1', icon: '🏠' },
  { name: 'Saúde', type: 'expense', color: '#96CEB4', icon: '🏥' },
  { name: 'Educação', type: 'expense', color: '#FFEAA7', icon: '📚' },
  { name: 'Entretenimento', type: 'expense', color: '#DDA0DD', icon: '🎬' },
  { name: 'Compras', type: 'expense', color: '#98D8C8', icon: '🛍️' },
  { name: 'Outros Gastos', type: 'expense', color: '#F7DC6F', icon: '💸' },
  { name: 'Salário', type: 'income', color: '#58D68D', icon: '💰' },
  { name: 'Freelance', type: 'income', color: '#85C1E9', icon: '💻' },
  { name: 'Investimentos', type: 'income', color: '#F8C471', icon: '📈' },
  { name: 'Outros Ganhos', type: 'income', color: '#BB8FCE', icon: '💎' }
];

export const INITIAL_ACHIEVEMENTS = [
  { name: 'Primeira Transação', description: 'Registrou sua primeira transação', icon: '🎯', points: 10 },
  { name: 'Meta Alcançada', description: 'Atingiu sua primeira meta de economia', icon: '🏆', points: 50 },
  { name: 'Economizador', description: 'Economizou R$ 1.000', icon: '💰', points: 100 },
  { name: 'Disciplinado', description: 'Manteve gastos dentro do limite por 30 dias', icon: '📊', points: 75 },
  { name: 'Investidor', description: 'Registrou 10 transações de investimento', icon: '📈', points: 150 }
];

export const INITIAL_BADGES = [
  { id: 'badge_novice', name: 'Novato', description: 'Começou sua jornada financeira', icon: 'star', category: 'special' },
  { id: 'badge_saver', name: 'Cofrinho Cheio', description: 'Economizou seus primeiros R$ 1.000', icon: 'piggy-bank', category: 'savings' },
  { id: 'badge_fire', name: 'On Fire', description: 'Sequência de 7 dias de atividade', icon: 'flame', category: 'streak' },
  { id: 'badge_investor', name: 'Investidor', description: 'Crie sua primeira meta de investimento', icon: 'trending-up', category: 'goals' }
];
