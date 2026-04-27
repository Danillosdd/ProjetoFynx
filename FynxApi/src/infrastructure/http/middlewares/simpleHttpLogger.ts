import type { Request, Response, NextFunction } from 'express';

// Middleware simples de logging HTTP
export const simpleHttpLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, url } = req;
  
  console.log(`[${new Date().toISOString()}] ${method} ${url}`);
  
  // Interceptar o final da resposta
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${statusCode} - ${duration}ms`);
  });
  
  next();
};

// Middleware para rotas não encontradas
export const notFoundLogger = (req: Request, res: Response) => {
  console.log(`[${new Date().toISOString()}] 404 - Rota não encontrada: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Rota não encontrada',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
};

// Middleware de tratamento de erros
export const errorLogger = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] Erro na rota ${req.method} ${req.url}:`, error.message);
  
  res.status(error.status || 500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
  });
};