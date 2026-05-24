import { useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6060/api';

export function useAdminSSE() {
    const { token, isAuthenticated, user, triggerUpdate } = useAuthStore();
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        // Apenas conecta se o usuário estiver autenticado e for ADMIN (ou seja, se conectando através do AdminLayout)
        if (!isAuthenticated || !token || user?.role !== 'ADMIN') return;

        const connectToSSE = async () => {
            const ctrl = new AbortController();

            fetchEventSource(`${API_URL}/admin/stream`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal: ctrl.signal,
                async onmessage(event) {
                    if (event.event === 'INIT') {
                        console.log('🔗 Conectado ao túnel em tempo real da Barbearia');
                        return;
                    }

                    if (event.event === 'APPOINTMENT_UPDATE') {
                        triggerUpdate();
                        addToast('success', '🔔 Uma mudança foi feita na Agenda!', 4000);
                        return;
                    }

                    if (event.event === 'PENALTY_UPDATE') {
                        triggerUpdate();
                    }
                },
                onclose() {
                    console.log('SSE connection fechada pelo servidor. Tentando reconectar...');
                },
                onerror(err) {
                    console.error('Erro de conexão SSE:', err);
                    // Retorna um valor para que o browser saiba reconectar
                    return 5000;
                }
            });

            return () => {
                ctrl.abort(); // Limpando conexão quando desmontar.
            };
        };

        const cleanup = connectToSSE();

        return () => {
            cleanup.then((abortCall) => abortCall && abortCall());
        };
    }, [isAuthenticated, token, user?.role, triggerUpdate, addToast]);
}
