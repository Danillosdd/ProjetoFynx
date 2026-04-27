import 'dotenv/config'; // Carrega as variáveis do .env
import express from 'express';
import cors from 'cors';
import { logger } from '../../shared/utils/logger.js';

logger.info('🚀 Starting FYNX API Server...');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para logging de requisições HTTP
const httpLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(httpLogger);

// Rotas temporárias mockadas
app.get('/', (req, res) => {
  res.json({
    message: 'FYNX API está funcionando!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Dashboard routes mockadas
app.get('/api/v1/dashboard', (req, res) => {
  res.json({
    overview: [
      { label: 'Balanço Total', value: 'R$ 5.000,00', change: '+5%', type: 'currency' },
      { label: 'Renda Mensal', value: 'R$ 3.000,00', change: '+2%', type: 'currency' },
      { label: 'Despesas Mensais', value: 'R$ 2.000,00', change: '-3%', type: 'currency' },
      { label: 'Taxa de Poupança', value: '33%', change: '+8%', type: 'percentage' }
    ],
    recentTransactions: [
      { id: 1, description: 'Salário', amount: 3000, type: 'income', date: '2024-01-15', category: 'Trabalho' },
      { id: 2, description: 'Supermercado', amount: -150, type: 'expense', date: '2024-01-14', category: 'Alimentação' }
    ],
    spendingByCategory: [
      { category: 'Alimentação', amount: 500, percentage: 25 },
      { category: 'Transporte', amount: 300, percentage: 15 },
      { category: 'Lazer', amount: 200, percentage: 10 }
    ],
    incomeByCategory: [
      { category: 'Trabalho', amount: 3000, percentage: 100 }
    ],
    dailyData: [
      { date: '2024-01-01', income: 0, expenses: 50 },
      { date: '2024-01-02', income: 0, expenses: 75 }
    ],
    monthlyData: [
      { month: '2024-01', income: 3000, expenses: 2000, savings: 1000 }
    ]
  });
});

// Spending Limits routes mockadas
app.get('/api/v1/spending-limits', (req, res) => {
  res.json([
    { id: 1, category: 'Alimentação', limit: 500, spent: 350, percentage: 70 },
    { id: 2, category: 'Transporte', limit: 300, spent: 250, percentage: 83 }
  ]);
});

// Ranking routes mockadas
app.get('/api/v1/ranking', (req, res) => {
  res.json({
    userRanking: { position: 5, score: 850, level: 'Poupador Bronze' },
    globalLeaderboard: [
      { position: 1, name: 'João Silva', score: 1200, level: 'Poupador Ouro' },
      { position: 2, name: 'Maria Santos', score: 1100, level: 'Poupador Prata' }
    ]
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`🌐 API available at: http://localhost:${PORT}`);
  logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});