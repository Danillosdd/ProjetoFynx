/**
 * @file Define as configurações para o módulo de dashboard.
 */

export const dashboardConfig = {
  // Configurações do ambiente
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
  
  // Configurações de paginação
  pagination: {
    defaultLimit: 10,
    maxLimit: 50,
  },
  
  // Configurações de cache
  cache: {
    ttl: 300, // 5 minutos em segundos
    enabled: true,
  },
};