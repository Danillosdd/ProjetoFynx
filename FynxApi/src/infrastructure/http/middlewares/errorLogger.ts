import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../../shared/utils/logger.js';

// Função para obter IP do cliente
const getClientIP = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         'unknown';
};

// Interface para dados do erro
interface ErrorContext {
  requestId?: string;
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  headers: Record<string, any>;
  query: Record<string, any>;
  params: Record<string, any>;
  body?: any;
}

// Interface para erro customizado
interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

// Função para determinar se o erro é operacional (esperado) ou crítico
const isOperationalError = (error: CustomError): boolean => {
  if (error.isOperational !== undefined) {
    return Boolean(error.isOperational);
  }
  
  // Erros operacionais comuns
  const operationalCodes = [
    'VALIDATION_ERROR',
    'NOT_FOUND',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'BAD_REQUEST',
    'CONFLICT'
  ];
  
  return operationalCodes.includes(error.code || '') || 
         (error.statusCode !== undefined && error.statusCode >= 400 && error.statusCode < 500);
};

// Função para extrair informações relevantes do erro
const extractErrorInfo = (error: CustomError) => {
  return {
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    details: error.details,
    isOperational: isOperationalError(error),
    stack: error.stack,
  };
};

// Função para sanitizar dados sensíveis do contexto
const sanitizeContext = (context: any): any => {
  if (!context || typeof context !== 'object') return context;
  
  const sensitiveFields = ['password', 'token', 'authorization', 'cookie', 'secret', 'key'];
  const sanitized = JSON.parse(JSON.stringify(context));
  
  const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        obj[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        obj[key] = sanitizeObject(value);
      }
    }
    return obj;
  };
  
  return sanitizeObject(sanitized);
};

// Middleware de captura de erros não tratados
export const errorLogger = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = (req as any).requestId || 'unknown';
  const timestamp = new Date().toISOString();
  
  // Contexto da requisição
  const context: ErrorContext = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: getClientIP(req),
    userAgent: req.get('user-agent') || 'unknown',
    timestamp,
    headers: req.headers,
    query: req.query,
    params: req.params,
  };

  // Adicionar body se existir
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    context.body = req.body;
  }

  // Sanitizar contexto
  const sanitizedContext = sanitizeContext(context);
  
  // Extrair informações do erro
  const errorInfo = extractErrorInfo(error);
  
  // Determinar nível de log baseado no tipo de erro
  if (errorInfo.isOperational) {
    // Erro operacional (esperado)
    logger.warn(`⚠️  OPERATIONAL ERROR [${requestId}] - ${errorInfo.name}: ${errorInfo.message} (${context.method} ${context.url})`);
    
    // Log detalhado apenas em modo debug
    if (process.env.LOG_LEVEL === 'debug') {
      const errorDetails = {
        error: errorInfo,
        context: sanitizedContext,
      };
      logger.debug(`🔍 ERROR DETAILS [${requestId}] - ${JSON.stringify(errorDetails)}`);
    }
  } else {
    // Erro crítico (não esperado)
    const criticalErrorData = {
      error: {
        name: errorInfo.name,
        message: errorInfo.message,
        code: errorInfo.code,
        statusCode: errorInfo.statusCode,
        details: errorInfo.details,
      },
      context: sanitizedContext,
    };
    logger.error(`🚨 CRITICAL ERROR [${requestId}] - ${JSON.stringify(criticalErrorData)}`);
    
    // Log do stack trace completo para erros críticos
    if (errorInfo.stack) {
      logger.error(`📚 STACK TRACE [${requestId}]: ${errorInfo.stack}`);
    }
  }

  // Determinar status code da resposta
  const statusCode = errorInfo.statusCode || 500;
  
  // Preparar resposta de erro
  const errorResponse: any = {
    error: true,
    message: errorInfo.isOperational ? errorInfo.message : 'Internal Server Error',
    requestId,
    timestamp,
  };

  // Adicionar detalhes apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      name: errorInfo.name,
      code: errorInfo.code,
      stack: errorInfo.stack,
    };
  }

  // Log da resposta de erro
  logger.http(`📤 ERROR RESPONSE [${requestId}] - ${statusCode} ${errorResponse.message}`);

  // Enviar resposta
  res.status(statusCode).json(errorResponse);
};

// Middleware para capturar erros assíncronos não tratados
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware para logging de warnings
export const warningLogger = (message: string, context?: any) => {
  const contextStr = context ? ` - Context: ${JSON.stringify(sanitizeContext(context))}` : '';
  logger.warn(`⚠️  APPLICATION WARNING: ${message}${contextStr}`);
};

// Middleware para logging de eventos
export const eventLogger = (event: string, data?: any) => {
  const dataStr = data ? ` - Data: ${JSON.stringify(sanitizeContext(data))}` : '';
  logger.info(`📋 EVENT: ${event}${dataStr}`);
};

// Handler para erros não capturados
export const setupGlobalErrorHandlers = () => {
  // Capturar erros não tratados
  process.on('uncaughtException', (error: Error) => {
    const uncaughtExceptionData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
    logger.error(`🚨 UNCAUGHT EXCEPTION - ${JSON.stringify(uncaughtExceptionData)}`);
    
    // Graceful shutdown
    process.exit(1);
  });

  // Capturar promises rejeitadas não tratadas
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const unhandledRejectionData = {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
      timestamp: new Date().toISOString(),
    };
    logger.error(`🚨 UNHANDLED PROMISE REJECTION - ${JSON.stringify(unhandledRejectionData)}`);
  });

  // Log de sinais do sistema
  process.on('SIGTERM', () => {
    logger.info('📴 SIGTERM received, shutting down gracefully');
  });

  process.on('SIGINT', () => {
    logger.info('📴 SIGINT received, shutting down gracefully');
  });
};

export default errorLogger;