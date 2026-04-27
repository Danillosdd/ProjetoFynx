import { logger } from '../../../shared/utils/logger.js';

// Função para formatar duração
const formatDuration = (duration: number): string => {
  if (duration < 1000) return `${duration.toFixed(2)}ms`;
  return `${(duration / 1000).toFixed(2)}s`;
};

// Interface para operações de banco de dados
interface DatabaseOperation {
  operationId: string;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'TRANSACTION' | 'OTHER';
  table?: string;
  query?: string;
  params?: any[];
  startTime: number;
  endTime?: number;
  duration?: string;
  rowsAffected?: number;
  error?: any;
  requestId?: string;
}

// Interface para operações de serviço
interface ServiceOperation {
  operationId: string;
  service: string;
  method: string;
  params?: any;
  startTime: number;
  endTime?: number;
  duration?: string;
  result?: any;
  error?: any;
  requestId?: string;
}

// Classe para logging de operações de banco de dados
export class DatabaseLogger {
  private static operations: Map<string, DatabaseOperation> = new Map();
  
  // Iniciar uma operação de banco de dados
  static startOperation(
    type: DatabaseOperation['type'],
    table?: string,
    query?: string,
    params?: any[],
    requestId?: string
  ): string {
    const operationId = Math.random().toString(36).substring(2, 15);
    const startTime = Date.now();
    
    const operation: DatabaseOperation = {
      operationId,
      type,
      params: this.sanitizeParams(params),
      startTime,
    };
    
    if (table) operation.table = table;
    if (query) operation.query = query;
    if (requestId) operation.requestId = requestId;
    
    this.operations.set(operationId, operation);
    
    logger.db(`🗄️  DB OPERATION START [${operationId}] - ${type} ${table || ''} ${query ? `(${this.sanitizeQuery(query)})` : ''} ${params?.length ? `with ${params.length} params` : ''} ${requestId ? `[${requestId}]` : ''}`);
    
    // Log detalhado em modo debug
    if (process.env.LOG_LEVEL === 'debug' && params?.length) {
      logger.debug(`📋 DB PARAMS [${operationId}]`, this.sanitizeParams(params));
    }
    
    return operationId;
  }
  
  // Finalizar uma operação de banco de dados
  static endOperation(
    operationId: string,
    rowsAffected?: number,
    error?: any
  ): void {
    const operation = this.operations.get(operationId);
    if (!operation) {
      logger.warn(`⚠️  DB OPERATION NOT FOUND [${operationId}]`);
      return;
    }
    
    const endTime = Date.now();
    const durationMs = endTime - operation.startTime;
    const duration = formatDuration(durationMs);
    
    operation.endTime = endTime;
    operation.duration = duration;
    if (rowsAffected !== undefined) operation.rowsAffected = rowsAffected;
    if (error) operation.error = error;
    
    if (error) {
      logger.error(`❌ DB OPERATION ERROR [${operationId}] - ${operation.type} ${operation.table || ''} (${duration}) - ${error.message} [${error.code || 'UNKNOWN'}] ${operation.requestId ? `[${operation.requestId}]` : ''}`);
      
      if (process.env.LOG_LEVEL === 'debug') {
        logger.debug(`🔍 DB ERROR DETAILS [${operationId}] - Query: ${operation.query || 'N/A'} - Params: ${JSON.stringify(operation.params || [])} - Stack: ${error.stack || 'N/A'}`);
      }
    } else {
      logger.db(`✅ DB OPERATION SUCCESS [${operationId}] - ${operation.type} ${operation.table || ''} (${duration}) - ${rowsAffected || 0} rows ${operation.requestId ? `[${operation.requestId}]` : ''}`);
      
      // Alerta para operações lentas
      if (durationMs > 1000) {
        logger.warn(`🐌 SLOW DB OPERATION [${operationId}] - ${operation.type} ${operation.table || ''} (${duration}) - Threshold: 1000ms`);
      }
    }
    
    // Remover da memória
    this.operations.delete(operationId);
  }
  
  // Sanitizar parâmetros sensíveis
  private static sanitizeParams(params?: any[]): any[] {
    if (!params) return [];
    
    return params.map(param => {
      if (typeof param === 'string') {
        // Verificar se pode ser uma senha ou token
        if (param.length > 20 && /^[A-Za-z0-9+/=]+$/.test(param)) {
          return '[REDACTED_TOKEN]';
        }
        if (param.toLowerCase().includes('password')) {
          return '[REDACTED_PASSWORD]';
        }
      }
      return param;
    });
  }
  
  // Sanitizar queries sensíveis
  private static sanitizeQuery(query?: string): string {
    if (!query) return '';
    
    // Remover valores sensíveis de queries
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password = '[REDACTED]'")
      .replace(/token\s*=\s*'[^']*'/gi, "token = '[REDACTED]'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret = '[REDACTED]'");
  }
  
  // Log de transações
  static logTransaction(action: 'BEGIN' | 'COMMIT' | 'ROLLBACK', requestId?: string): void {
    logger.db(`🔄 DB TRANSACTION: ${action} ${requestId ? `[${requestId}]` : ''} - ${new Date().toISOString()}`);
  }
  
  // Log de conexões
  static logConnection(action: 'CONNECT' | 'DISCONNECT' | 'ERROR', details?: any): void {
    const logLevel = action === 'ERROR' ? 'error' : 'info';
    
    const detailsStr = details ? ` - Details: ${JSON.stringify(details)}` : '';
    logger[logLevel](`🔌 DB CONNECTION: ${action}${detailsStr} - ${new Date().toISOString()}`);
  }
}

// Classe para logging de operações de serviço
export class ServiceLogger {
  private static operations: Map<string, ServiceOperation> = new Map();
  
  // Iniciar uma operação de serviço
  static startOperation(
    service: string,
    method: string,
    params?: any,
    requestId?: string
  ): string {
    const operationId = Math.random().toString(36).substring(2, 15);
    const startTime = Date.now();
    
    const operation: ServiceOperation = {
      operationId,
      service,
      method,
      params: this.sanitizeData(params),
      startTime,
      requestId: requestId || 'unknown',
    };
    
    this.operations.set(operationId, operation);
    
    logger.info(`🔧 SERVICE OPERATION START [${operationId}] - ${service}.${method} ${params ? 'with params' : ''} ${requestId ? `[${requestId}]` : ''}`);
    
    if (process.env.LOG_LEVEL === 'debug' && params) {
      logger.debug(`📋 SERVICE PARAMS [${operationId}] - ${JSON.stringify(this.sanitizeData(params))}`);
    }
    
    return operationId;
  }
  
  // Finalizar uma operação de serviço
  static endOperation(
    operationId: string,
    result?: any,
    error?: any
  ): void {
    const operation = this.operations.get(operationId);
    if (!operation) {
      logger.warn(`⚠️  SERVICE OPERATION NOT FOUND [${operationId}]`);
      return;
    }
    
    const endTime = Date.now();
    const durationMs = endTime - operation.startTime;
    const duration = formatDuration(durationMs);
    
    operation.endTime = endTime;
    operation.duration = duration;
    operation.result = result;
    operation.error = error;
    
    if (error) {
      logger.error(`❌ SERVICE OPERATION ERROR [${operationId}] - ${operation.service}.${operation.method} (${duration}) - ${error.message} [${error.name}] ${operation.requestId ? `[${operation.requestId}]` : ''}`);
    } else {
      logger.info(`✅ SERVICE OPERATION SUCCESS [${operationId}] - ${operation.service}.${operation.method} (${duration}) ${result ? 'with result' : ''} ${operation.requestId ? `[${operation.requestId}]` : ''}`);
      
      if (process.env.LOG_LEVEL === 'debug' && result) {
        logger.debug(`📦 SERVICE RESULT [${operationId}] - ${JSON.stringify(this.sanitizeData(result))}`);
      }
    }
    
    this.operations.delete(operationId);
  }
  
  // Sanitizar dados sensíveis
  private static sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = JSON.parse(JSON.stringify(data));
    
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
  }
}

// Função para criar wrapper de função com logging automático
export const withServiceLogging = (
  service: string,
  method: string,
  fn: Function,
  requestId?: string
) => {
  return async (...args: any[]) => {
    const operationId = ServiceLogger.startOperation(service, method, args, requestId);
    
    try {
      const result = await fn(...args);
      ServiceLogger.endOperation(operationId, result);
      return result;
    } catch (error) {
      ServiceLogger.endOperation(operationId, undefined, error);
      throw error;
    }
  };
};

// Função para criar wrapper de operação de banco com logging automático
export const withDatabaseLogging = (
  type: DatabaseOperation['type'],
  table?: string,
  requestId?: string
) => {
  return (query: string, params?: any[]) => {
    return async (executeFn: Function) => {
      const operationId = DatabaseLogger.startOperation(type, table, query, params, requestId);
      
      try {
        const result = await executeFn();
        const rowsAffected = result?.affectedRows || result?.rowCount || result?.length;
        DatabaseLogger.endOperation(operationId, rowsAffected);
        return result;
      } catch (error) {
        DatabaseLogger.endOperation(operationId, undefined, error);
        throw error;
      }
    };
  };
};