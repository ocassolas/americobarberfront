import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse, LoginResponse } from '@/types';

interface AuthStore {
    isAuthenticated: boolean;
    token: string | null;
    user: UserResponse | null;
    login: (data: LoginResponse) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            token: null,
            user: null,
            login: (data: LoginResponse) => set({
                isAuthenticated: true,
                token: data.token,
                user: {
                    id: data.userId,
                    name: data.name,
                    email: data.email,
                    cpf: '', // Not returned in login response currently, fetched in profile
                    phone: '', // Not returned in login response currently, fetched in profile
                    role: data.role,
                    active: true,
                    isBarber: data.isBarber,
                    createdAt: new Date().toISOString(),
                    assignedBarberId: null,
                }
            }),
            logout: () => set({ isAuthenticated: false, token: null, user: null }),
        }),
        { name: 'americo-auth' }
    )
);
