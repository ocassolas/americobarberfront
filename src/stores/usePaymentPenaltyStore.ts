import { create } from 'zustand';
import { getActivePenalty } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import type { CancellationPenalty } from '@/types';

interface PaymentPenaltyStore {
    penalty: CancellationPenalty | null;
    loading: boolean;
    refresh: () => Promise<void>;
    clear: () => void;
}

export const usePaymentPenaltyStore = create<PaymentPenaltyStore>((set) => ({
    penalty: null,
    loading: false,
    refresh: async () => {
        const { isAuthenticated, user, setPaymentBlocked } = useAuthStore.getState();
        if (!isAuthenticated || user?.role !== 'ROLE_CLIENT') {
            set({ penalty: null, loading: false });
            setPaymentBlocked(false);
            return;
        }

        set({ loading: true });
        try {
            const active = await getActivePenalty();
            set({ penalty: active, loading: false });
            setPaymentBlocked(!!active);
        } catch {
            set({ penalty: null, loading: false });
        }
    },
    clear: () => {
        useAuthStore.getState().setPaymentBlocked(false);
        set({ penalty: null });
    },
}));
