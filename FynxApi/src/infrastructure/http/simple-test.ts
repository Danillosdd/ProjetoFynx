import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando!', version: '1.0.0' });
});

// Rota de teste para dashboard
app.get('/api/v1/dashboard', (req, res) => {
  res.json({
    overview: {
      totalBalance: 5000,
      monthlyIncome: 3000,
      monthlyExpenses: 2000,
      savingsGoal: 1000
    },
    recentTransactions: [
      { id: 1, description: 'Salário', amount: 3000, type: 'income', date: '2024-01-15' },
      { id: 2, description: 'Supermercado', amount: -150, type: 'expense', date: '2024-01-14' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});