import { create } from 'zustand';
import type { Service, BookingState } from '@/types';

interface BookingStore extends BookingState {
    setStep: (step: number) => void;
    setBarber: (id: number | null, name: string | null) => void;
    toggleService: (service: Service) => void;
    setDate: (date: string | null) => void;
    setTime: (time: string | null) => void;
    setClientName: (name: string) => void;
    setClientPhone: (phone: string) => void;
    setNotes: (notes: string) => void;
    reset: () => void;
    totalDuration: () => number;
    totalPrice: () => number;
}

const initialState: BookingState = {
    step: 0,
    barberId: null,
    barberName: null,
    services: [],
    date: null,
    time: null,
    clientName: '',
    clientPhone: '',
    notes: '',
};

export const useBookingStore = create<BookingStore>((set, get) => ({
    ...initialState,
    setStep: (step) => set({ step }),
    setBarber: (id, name) => set({ barberId: id, barberName: name }),
    toggleService: (service) =>
        set((s) => {
            const exists = s.services.find((sv) => sv.id === service.id);
            return {
                services: exists
                    ? s.services.filter((sv) => sv.id !== service.id)
                    : [...s.services, service],
            };
        }),
    setDate: (date) => set({ date, time: null }),
    setTime: (time) => set({ time }),
    setClientName: (clientName) => set({ clientName }),
    setClientPhone: (clientPhone) => set({ clientPhone }),
    setNotes: (notes) => set({ notes }),
    reset: () => set(initialState),
    totalDuration: () => get().services.reduce((sum, s) => sum + s.durationMinutes, 0),
    totalPrice: () => get().services.reduce((sum, s) => sum + s.price, 0),
}));
