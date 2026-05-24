import { useEffect } from 'react';
import { usePaymentPenaltyStore } from '@/stores/usePaymentPenaltyStore';
import { useAuthStore } from '@/stores/useAuthStore';

export function usePaymentPenalty() {
    const { penalty, loading, refresh, clear } = usePaymentPenaltyStore();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        refresh();
    }, [isAuthenticated, user?.role, refresh]);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ROLE_CLIENT') return;
        const interval = setInterval(refresh, 15000);
        return () => clearInterval(interval);
    }, [isAuthenticated, user?.role, refresh]);

    return { penalty, loading, refresh, clearPenalty: clear };
}
