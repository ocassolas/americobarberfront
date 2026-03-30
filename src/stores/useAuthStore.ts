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
                    cpf: '', 
                    phone: '', 
                    role: data.role,
                    active: true,
                    isBarber: data.isBarber,
                    isOwner: data.isOwner,
                    createdAt: new Date().toISOString(),
                    assignedBarberId: null,
                    slotIntervalMinutes: 30, 
                    profilePicture: data.profilePicture,
                }
            }),
            logout: () => set({ isAuthenticated: false, token: null, user: null }),
            setUser: (user: UserResponse) => set({ user }),
            triggerUpdate: () => set({ lastUpdateTimestamp: Date.now() }),
        }),
        { name: 'americo-auth' }
    )
);
