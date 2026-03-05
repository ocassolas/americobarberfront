import { create } from 'zustand';
import type { Toast, ToastType } from '@/types';

interface ToastStore {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (type, message, duration = 4000) => {
        const id = `toast-${++toastCounter}`;
        set((s) => ({ toasts: [...s.toasts, { id, type, message, duration }] }));
        setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, duration);
    },
    removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
