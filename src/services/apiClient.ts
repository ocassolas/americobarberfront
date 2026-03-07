import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

// URL base da API configurada nas variáveis de ambiente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6060/api';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token JWT em todas as requisições
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros globais da API
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se receber 401 (Não Autorizado) e o usuário estiver logado, faz logout automático
        if (error.response?.status === 401 && useAuthStore.getState().isAuthenticated) {
            useAuthStore.getState().logout();
            // Evita loop infinito redirecionando silenciosamente ou disparando um evento
            window.location.href = '/admin'; // Ou alguma rota pública
        }
        return Promise.reject(error);
    }
);
