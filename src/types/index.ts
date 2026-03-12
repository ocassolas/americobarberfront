export interface LocalTime {
    hour: number;
    minute: number;
    second: number;
    nano: number;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    cpf: string;
    phone: string;
    role: string;
    active: boolean;
    isBarber: boolean;
    createdAt: string;
    assignedBarberId: number | null;
    slotIntervalMinutes: number;
}

export interface LoginResponse {
    token: string;
    type: string;
    userId: number;
    name: string;
    email: string;
    role: string;
    isBarber: boolean;
}

export interface Barber extends UserResponse {
    // Frontend specific properties for UI that don't come from API directly
    specialty?: string;
    bio?: string;
    avatar?: string;
    rating?: number;
}

export interface Service {
    id: number;
    name: string;
    durationMinutes: number;
    price: number;
    icon?: string; // Frontend specific property
    description: string;
    active: boolean;
    barberId: number;
    barberName?: string;
}

export interface TimeSlot {
    time: string;
    available: boolean;
}

export interface Appointment {
    id: number;
    clientId: number;
    clientName: string;
    barberId: number;
    barberName: string;
    services: Service[];
    totalPrice: number;
    date: string;
    startTime: string;
    endTime: string;
    status: 'AGENDADO' | 'CANCELADO_POR_CLIENTE' | 'CANCELADO_POR_BARBEIRO' | 'CONCLUIDO' | 'PROPOSTA_REAGENDAMENTO' | 'FINALIZADO';
    observation: string;
    barberMessage: string;
    proposedDate: string | null;
    proposedStartTime: string | null;
    proposedEndTime: string | null;
    clientPhone: string;
    barberPhone: string;
    createdAt: string;
}

export interface AppointmentRequest {
    clientId: number;
    barberId: number;
    serviceIds: number[];
    date: string;
    startTime: string; // "HH:mm" string as per @JsonFormat on backend
    observation?: string;
}

export interface AvailabilityResponse {
    id: number;
    barberId: number;
    dayOfWeek: number;
    startTime: string; // "HH:mm" string as per @JsonFormat on backend
    endTime: string;
    breakStartTime: string | null;
    breakEndTime: string | null;
}

export interface AvailabilityRequest {
    dayOfWeek: number;
    startTime: string; // "HH:mm" string
    endTime: string;
    breakStartTime?: string | null;
    breakEndTime?: string | null;
}

export interface WorkSchedule {
    barberId: number;
    barberName: string;
    workDays: WorkDay[];
    daysOff: DayOff[];
}

export interface WorkDay {
    dayOfWeek: number;
    enabled: boolean;
    openTime: string; // Keep string for UI "HH:mm" handling
    closeTime: string;
    breakStart: string | null;
    breakEnd: string | null;
}

export interface DayOff {
    id: string | number; // String for mocks usually
    barberId: number;
    date: string; // ISO yyyy-MM-dd
    reason: string; // optional from UI perspective
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
    barberId: number | null;
    barberName: string | null;
    services: Service[];
    date: string | null;
    time: string | null;
    clientName: string;
    clientPhone: string;
    notes: string;
}
