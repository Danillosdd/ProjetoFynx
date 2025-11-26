import axios from 'axios';
import { DataProvider } from '@refinedev/core';

// Interface para variáveis que podem incluir userId
interface VariablesWithUserId {
  userId?: number;
  [key: string]: any;
}

const API_URL = 'http://localhost:3001/api/v1'; // URL do seu backend Express

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mapeamento de recursos do Refine para paths reais da API
const RESOURCE_TO_PATH: Record<string, string> = {
  // Dashboard
  'dashboard': 'dashboard',
  'overview': 'dashboard/overview',
  // Transações e limites
  'transactions': 'transactions',
  'spending-limits': 'spending-limits',
  // Metas (corrige 404 de saving-goals)
  'saving-goals': 'goals/spending-goals',
  'goals': 'goals',
};

const resolvePath = (resource: string) => RESOURCE_TO_PATH[resource] ?? resource;

// Interceptor para adicionar autenticação
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fynx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,

  // GET /api/{resource} - Lista recursos
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `/${resolvePath(resource)}`;

    const params: any = {};

    // Fallback para userId se não vier nos filtros (embora o ideal seja vir do contexto/hook)
    const storedUser = localStorage.getItem('fynx_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id) params.userId = user.id;
      } catch (e) {
        // ignore
      }
    }

    // Paginação - ajustado para o formato do backend
    if (pagination) {
      params.page = pagination.current || 1;
      params.limit = pagination.pageSize || 10;
    }

    // Filtros - ajustado para o formato do backend
    if (filters) {
      filters.forEach((filter) => {
        if (filter.operator === 'eq') {
          params[filter.field] = filter.value;
        } else if (filter.operator === 'contains') {
          params.search = filter.value; // Para busca geral
        }
      });
    }

    // Ordenação - ajustado para o formato do backend
    if (sorters && sorters.length > 0) {
      params.sortBy = sorters[0].field;
      params.sortOrder = sorters[0].order;
    }

    try {
      const { data } = await axiosInstance.get(url, { params });

      return {
        data: Array.isArray(data) ? data : data.data || [],
        total: data.total || data.length || 0,
      };
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return {
          data: [],
          total: 0,
        };
      }
      console.error(`Erro ao buscar ${resource}:`, error);
      throw error;
    }
  },

  // GET /api/{resource}/{id} - Busca um recurso específico
  getOne: async ({ resource, id, meta }) => {
    const url = `/${resolvePath(resource)}/${id}`;

    const params: any = {};
    const storedUser = localStorage.getItem('fynx_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id) params.userId = user.id;
      } catch (e) {
        // ignore
      }
    }

    try {
      const { data } = await axiosInstance.get(url, { params });

      return {
        data: data.data || data,
      };
    } catch (error) {
      console.error(`Erro ao buscar ${resource} com id ${id}:`, error);
      throw error;
    }
  },

  // POST /api/{resource} - Cria um novo recurso
  create: async ({ resource, variables, meta }) => {
    const url = `/${resolvePath(resource)}`;

    // Adiciona userId padrão aos dados
    const typedVariables = variables as VariablesWithUserId;
    const dataWithUserId = { ...typedVariables };

    if (!dataWithUserId.userId) {
      const storedUser = localStorage.getItem('fynx_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.id) dataWithUserId.userId = user.id;
        } catch (e) {
          // ignore
        }
      }
    }

    try {
      const { data } = await axiosInstance.post(url, dataWithUserId);

      return {
        data: data.data || data,
      };
    } catch (error) {
      console.error(`Erro ao criar ${resource}:`, error);
      throw error;
    }
  },

  // PUT /api/{resource}/{id} - Atualiza um recurso
  update: async ({ resource, id, variables, meta }) => {
    const url = `/${resolvePath(resource)}/${id}`;

    // Adiciona userId padrão aos dados
    const typedVariables = variables as VariablesWithUserId;
    const dataWithUserId = { ...typedVariables };

    if (!dataWithUserId.userId) {
      const storedUser = localStorage.getItem('fynx_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.id) dataWithUserId.userId = user.id;
        } catch (e) {
          // ignore
        }
      }
    }

    try {
      const { data } = await axiosInstance.put(url, dataWithUserId);

      return {
        data: data.data || data,
      };
    } catch (error) {
      console.error(`Erro ao atualizar ${resource} com id ${id}:`, error);
      throw error;
    }
  },

  // DELETE /api/{resource}/{id} - Remove um recurso
  deleteOne: async ({ resource, id, meta }) => {
    const url = `/${resolvePath(resource)}/${id}`;

    const params: any = {};
    const storedUser = localStorage.getItem('fynx_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id) params.userId = user.id;
      } catch (e) {
        // ignore
      }
    }

    try {
      const { data } = await axiosInstance.delete(url, { params });

      return {
        data: data.data || { id },
      };
    } catch (error) {
      console.error(`Erro ao deletar ${resource} com id ${id}:`, error);
      throw error;
    }
  },

  // Para múltiplas deleções
  deleteMany: async ({ resource, ids }) => {
    try {
      const deletePromises = ids.map(id => {
        const params: any = {};
        const storedUser = localStorage.getItem('fynx_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user.id) params.userId = user.id;
          } catch (e) {
            // ignore
          }
        }
        return axiosInstance.delete(`/${resolvePath(resource)}/${id}`, { params });
      });
      await Promise.all(deletePromises);
      return { data: ids.map(id => ({ id })) as any };
    } catch (error) {
      console.error(`Erro ao deletar múltiplos ${resource}:`, error);
      throw error;
    }
  },

  // Para operações customizadas
  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    try {
      const { data } = await axiosInstance({
        url,
        method,
        data: payload,
        params: query,
        headers,
      });

      return { data };
    } catch (error) {
      console.error(`Erro na operação customizada:`, error);
      throw error;
    }
  },

  // Para buscar múltiplos recursos por IDs
  getMany: async ({ resource, ids }) => {
    try {
      const promises = ids.map(id => {
        const params: any = {};
        const storedUser = localStorage.getItem('fynx_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user.id) params.userId = user.id;
          } catch (e) {
            // ignore
          }
        }
        return axiosInstance.get(`/${resolvePath(resource)}/${id}`, { params });
      });
      const responses = await Promise.all(promises);
      const data = responses.map(response => response.data);

      return { data };
    } catch (error) {
      console.error(`Erro ao buscar múltiplos ${resource}:`, error);
      throw error;
    }
  },
};