import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste simples
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'FYNX API está funcionando!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Rota de teste para dashboard
app.get('/api/v1/dashboard', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            overview: [
                { title: "Total Balance", value: "$2,450.00", change: "+12.5% vs last month", trend: "up" },
                { title: "Monthly Income", value: "$3,200.00", change: "+8.2% vs last month", trend: "up" },
                { title: "Monthly Expenses", value: "$750.00", change: "-5.1% vs last month", trend: "up" },
                { title: "Savings Rate", value: "76.6%", change: "+3.4% vs last month", trend: "up" }
            ],
            recentTransactions: [
                { id: 1, description: "Salary", type: "income", status: "completed", amount: 3200, date: "2024-01-15", category: "salary" },
                { id: 2, description: "Groceries", type: "expense", status: "completed", amount: 120, date: "2024-01-14", category: "food" }
            ]
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
    console.log(`📍 Available at: http://localhost:${PORT}`);
});