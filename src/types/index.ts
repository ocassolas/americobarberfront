export interface Barber {
    id: string;
    name: string;
    specialty: string;
    bio: string;
    avatar: string;
    rating: number;
}

export interface Service {
    id: string;
    name: string;
    duration: number;
    price: number;
    icon: string;
    description: string;
    active: boolean;
}

export interface TimeSlot {
    time: string;
    available: boolean;
}

export interface Appointment {
    id: string;
    clientName: string;
    clientPhone: string;
    notes: string;
    barberId: string;
    barberName: string;
    services: Service[];
    date: string;
    time: string;
    totalDuration: number;
    totalPrice: number;
    status: 'confirmed' | 'completed' | 'cancelled';
    createdAt: string;
}

export interface WorkDay {
    dayOfWeek: number;
    enabled: boolean;
    openTime: string;
    closeTime: string;
}

export interface DayOff {
    id: string;
    barberId: string;
    date: string;
    reason: string;
}

export interface WorkSchedule {
    barberId: string;
    barberName: string;
    workDays: WorkDay[];
    daysOff: DayOff[];
}

export interface BusinessConfig {
    name: string;
    subtitle: string;
    address: string;
    addressLink: string;
    phone: string;
    whatsapp: string;
    instagram: string;
    workingHours: string;
    slotInterval: number;
}

export interface AdminCredentials {
    username: string;
    password: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

export interface BookingState {
    step: number;
    barberId: string | null;
    barberName: string | null;
    services: Service[];
    date: string | null;
    time: string | null;
    clientName: string;
    clientPhone: string;
    notes: string;
}
