import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse, LoginResponse } from '@/types';

interface AuthStore {
    isAuthenticated: boolean;
    token: string | null;
    user: UserResponse | null;
    lastUpdateTimestamp: number;
    login: (data: LoginResponse) => void;
    logout: () => void;
    setUser: (user: UserResponse) => void;
    setPaymentBlocked: (blocked: boolean) => void;
    triggerUpdate: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            token: null,
            user: null,
            lastUpdateTimestamp: Date.now(),
            login: (data: LoginResponse) => set({
                isAuthenticated: true,
                token: data.token,
                user: {
                    id: data.userId,
                    name: data.name,
                    email: data.email,
                    cpf: data.cpf || '',
                    phone: data.phone || '',
                    role: data.role,
                    active: true,
                    isBarber: data.isBarber,
                    isOwner: data.isOwner,
                    paymentBlocked: data.paymentBlocked ?? false,
                    createdAt: new Date().toISOString(),
                    assignedBarberId: null,
                    slotIntervalMinutes: 30, 
                    profilePicture: data.profilePicture,
                    description: data.description,
                    descriptionUpdatedAt: data.descriptionUpdatedAt,
                }
            }),
            logout: () => set({ isAuthenticated: false, token: null, user: null }),
            setUser: (user: UserResponse) => set({ user }),
            setPaymentBlocked: (blocked: boolean) => set((state) => ({
                user: state.user ? { ...state.user, paymentBlocked: blocked } : null,
            })),
            triggerUpdate: () => set({ lastUpdateTimestamp: Date.now() }),
        }),
        { name: 'americo-auth' }
    )
);
