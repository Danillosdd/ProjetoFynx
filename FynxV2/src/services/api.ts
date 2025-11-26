import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3001/api/v1',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('fynx_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use(
    (response) => {
        console.log(`[API] Response from ${response.config.url}:`, response.status, response.data);
        return response;
    },
    (error) => {
        console.error('[API] Request error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);
