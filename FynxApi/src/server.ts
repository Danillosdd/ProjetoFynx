import 'dotenv/config'; // Carrega as variáveis do .env
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import './database/database.js'; // Inicializa o banco de dados

logger.info('🚀 Starting FYNX API Server...');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares Essenciais
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Habilita o Express a ler JSON no corpo das requisições
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Por favor, tente novamente mais tarde.' }
});
app.use('/api', limiter);

// Stricter Rate Limiting for Auth
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 5, // Limit each IP to 5 login attempts per hour
    message: { error: 'Muitas tentativas de login. Tente novamente em 1 hora.' }
});
app.use('/api/v1/auth/login', authLimiter);

// Middleware de logging HTTP simples
app.use((req, res, next) => {
    const startTime = Date.now();
    logger.http(`${req.method} ${req.url}`);
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.http(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
});

// Configurar as Rotas
logger.info('📁 Loading routes...');
app.use('/api/v1', routes);

// Rota de teste simples
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'FYNX API está funcionando!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Middleware para rotas não encontradas (404)
app.use((req, res) => {
    logger.warn(`404 - Rota não encontrada: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Rota não encontrada',
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    });
});

// Middleware de tratamento de erros
app.use((error: any, req: any, res: any, next: any) => {
    logger.error(`Erro na rota ${req.method} ${req.url}:`, error.message);
    
    res.status(error.status || 500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    try {
        logger.info(`⚡️ Servidor FYNX rodando na porta ${PORT}`);
        logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`🔗 URL: http://localhost:${PORT}`);
        logger.info(`📊 API Base: http://localhost:${PORT}/api/v1`);
    } catch (error) {
        logger.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
});