import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../../shared/utils/logger.js';

// Função para obter IP do cliente
const getClientIP = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         'unknown';
};

// Função para obter tamanho da resposta
const getResponseSize = (res: Response): string => {
  const contentLength = res.get('content-length');
  return contentLength || '0';
};

// Função para obter cor do status
const getStatusColor = (statusCode: number): string => {
  if (statusCode >= 500) return '\x1b[31m'; // Vermelho
  if (statusCode >= 400) return '\x1b[33m'; // Amarelo
  if (statusCode >= 300) return '\x1b[36m'; // Ciano
  if (statusCode >= 200) return '\x1b[32m'; // Verde
  return '\x1b[37m'; // Branco
};

// Função para formatar duração
const formatDuration = (duration: number): string => {
  if (duration < 1000) return `${duration.toFixed(2)}ms`;
  return `${(duration / 1000).toFixed(2)}s`;
};

// Interface para dados da requisição
interface RequestData {
  method: string;
  url: string;
  originalUrl: string;
  ip: string;
  userAgent: string;
  contentType: string;
  contentLength: string;
  headers: Record<string, any>;
  query: Record<string, any>;
  params: Record<string, any>;
  body?: any;
}

// Interface para dados da resposta
interface ResponseData {
  statusCode: number;
  statusMessage: string;
  contentType: string;
  contentLength: string;
  headers: Record<string, any>;
  duration: string;
}

// Função para sanitizar dados sensíveis
const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'token', 'authorization', 'cookie', 'secret', 'key'];
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
};

// Função para filtrar headers importantes
const getImportantHeaders = (headers: Record<string, any>): Record<string, any> => {
  const important = [
    'content-type',
    'content-length',
    'authorization',
    'user-agent',
    'accept',
    'origin',
    'referer',
    'x-forwarded-for',
    'x-real-ip'
  ];
  
  const filtered: Record<string, any> = {};
  for (const key of important) {
    if (headers[key]) {
      filtered[key] = headers[key];
    }
  }
  
  return sanitizeData(filtered);
};

// Middleware principal de logging HTTP
export const httpLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // Adicionar ID da requisição ao request
  (req as any).requestId = requestId;
  
  // Dados da requisição
  const requestData: RequestData = {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    ip: getClientIP(req),
    userAgent: req.get('user-agent') || 'unknown',
    contentType: req.get('content-type') || 'none',
    contentLength: req.get('content-length') || '0',
    headers: getImportantHeaders(req.headers),
    query: req.query,
    params: req.params,
  };

  // Adicionar body se existir (apenas para métodos que podem ter body)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    requestData.body = sanitizeData(req.body);
  }

  // Log da requisição entrante
  const queryParamsStr = Object.keys(req.query).length > 0 ? ` Query: ${JSON.stringify(req.query)}` : '';
  const routeParamsStr = Object.keys(req.params).length > 0 ? ` Params: ${JSON.stringify(req.params)}` : '';
  logger.http(`📥 INCOMING REQUEST [${requestId}] - ${req.method} ${req.originalUrl} from ${requestData.ip} (${requestData.userAgent}) ${requestData.contentType} ${requestData.body ? 'with body' : ''}${queryParamsStr}${routeParamsStr}`);

  // Log detalhado dos headers (apenas em modo debug)
  if (process.env.LOG_LEVEL === 'debug') {
    logger.debug(`📋 REQUEST HEADERS [${requestId}] - ${JSON.stringify(requestData.headers)}`);
    
    if (requestData.body) {
      logger.debug(`📦 REQUEST BODY [${requestId}] - ${JSON.stringify(requestData.body)}`);
    }
  }

  // Interceptar a resposta
  const originalSend = res.send;
  const originalJson = res.json;
  let responseBody: any;

  // Interceptar res.send
  res.send = function(body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Interceptar res.json
  res.json = function(body: any) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Listener para quando a resposta terminar
  res.on('finish', () => {
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const duration = formatDuration(durationMs);
    const statusColor = getStatusColor(res.statusCode);
    
    const responseData: ResponseData = {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage || 'OK',
      contentType: res.get('content-type') || 'unknown',
      contentLength: getResponseSize(res),
      headers: getImportantHeaders(res.getHeaders()),
      duration,
    };

    // Log da resposta
    logger.http(`📤 OUTGOING RESPONSE [${requestId}] - ${req.method} ${req.originalUrl} ${statusColor}${res.statusCode}${'\x1b[0m'} (${duration}) ${responseData.contentLength} ${responseData.contentType}`);

    // Log detalhado em modo debug
    if (process.env.LOG_LEVEL === 'debug') {
      logger.debug(`📋 RESPONSE HEADERS [${requestId}] - ${JSON.stringify(responseData.headers)}`);
      
      if (responseBody && typeof responseBody === 'object') {
        logger.debug(`📦 RESPONSE BODY [${requestId}] - ${JSON.stringify(sanitizeData(responseBody))}`);
      }
    }

    // Log de performance se a requisição demorou muito
    if (durationMs > 1000) {
      logger.performance(`🐌 SLOW REQUEST [${requestId}] - ${req.method} ${req.originalUrl} (${duration}) Status: ${res.statusCode}`);
    }
  });

  // Listener para erros na resposta
  res.on('error', (error) => {
    logger.error(`❌ RESPONSE ERROR [${requestId}] - ${req.method} ${req.originalUrl} Error: ${error.message} Stack: ${error.stack}`);
  });

  next();
};

// Middleware para logging de rotas não encontradas
export const notFoundLogger = (req: Request, res: Response, next: NextFunction): void => {
  logger.warn(`🔍 ROUTE NOT FOUND - ${req.method} ${req.originalUrl} from ${getClientIP(req)} (${req.get('user-agent')})`);
  next();
};

export default httpLogger;