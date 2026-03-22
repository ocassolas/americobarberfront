import { create } from 'zustand';

interface LoadingStore {
    loadingCount: number;
    startLoading: () => void;
    stopLoading: () => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
    loadingCount: 0,
    startLoading: () => set((state) => ({ loadingCount: state.loadingCount + 1 })),
    stopLoading: () => set((state) => ({ loadingCount: Math.max(0, state.loadingCount - 1) })),
}));
