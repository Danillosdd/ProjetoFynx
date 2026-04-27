// Logger simples e estável
export const logger = {
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[31m[${timestamp}] [ERROR]\x1b[0m ${message}`);
    if (error) {
      console.log(`\x1b[90m${error}\x1b[0m`);
    }
  },
  
  warn: (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[33m[${timestamp}] [WARN]\x1b[0m ${message}`);
  },
  
  info: (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[34m[${timestamp}] [INFO]\x1b[0m ${message}`);
  },
  
  http: (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[32m[${timestamp}] [HTTP]\x1b[0m ${message}`);
  },
  
  db: (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[35m[${timestamp}] [DB]\x1b[0m ${message}`);
  },
  
  performance: (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[36m[${timestamp}] [PERF]\x1b[0m ${message}`);
  },
  
  debug: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[90m[${timestamp}] [DEBUG]\x1b[0m ${message}`);
    if (data) {
      console.log(`\x1b[90m${JSON.stringify(data, null, 2)}\x1b[0m`);
    }
  },
};

export default logger;