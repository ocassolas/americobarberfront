import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { useToastStore } from '@/stores/useToastStore';

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
        useLoadingStore.getState().startLoading();
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        useLoadingStore.getState().stopLoading();
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros globais da API
apiClient.interceptors.response.use(
    (response) => {
        useLoadingStore.getState().stopLoading();
        return response;
    },
    (error) => {
        useLoadingStore.getState().stopLoading();
        
        const status = error.response?.status;
        const authStore = useAuthStore.getState();

        // Se receber 401 (Não Autorizado) ou 403 e o usuário estiver logado, faz logout automático
        if ((status === 401 || status === 403) && authStore.isAuthenticated) {
            authStore.logout();
            
            // Adiciona toast avisando sobre sessão expirada
            useToastStore.getState().addToast(
                'warning', 
                'Sua sessão expirou. Por favor, faça login novamente.', 
                5000
            );
            
            // Removido o window.location.href = '/admin'
            // Os Guards (ClientGuard/AdminGuard) cuidam do roteamento usando <Navigate />
            // quando authStore.isAuthenticated fica false, mantendo o toast vivo e um fluxo Single Page.
        }
        
        return Promise.reject(error);
    }
);
