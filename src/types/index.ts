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
    isOwner: boolean;
    createdAt: string;
    assignedBarberId: number | null;
    slotIntervalMinutes: number;
    profilePicture?: string;
    description?: string;
    descriptionUpdatedAt?: string;
    blocked?: boolean;
}

export interface LoginResponse {
    token: string;
    type: string;
    userId: number;
    name: string;
    email: string;
    cpf?: string;
    phone?: string;
    role: string;
    isBarber: boolean;
    isOwner: boolean;
    profilePicture?: string;
    description?: string;
    descriptionUpdatedAt?: string;
    blocked?: boolean;
}

export interface Barber extends UserResponse {
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
    icon?: string;
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
    status: 'AGENDADO' | 'CANCELADO_POR_CLIENTE' | 'CANCELADO_POR_BARBEIRO' | 'CONCLUIDO' | 'PROPOSTA_REAGENDAMENTO' | 'FINALIZADO' | 'NO_SHOW';
    observation: string;
    barberMessage: string;
    proposedDate: string | null;
    proposedStartTime: string | null;
    proposedEndTime: string | null;
    clientPhone: string;
    barberPhone: string;
    createdAt: string;
    clientProfilePicture?: string;
}

export interface AppointmentRequest {
    clientId: number;
    barberId: number;
    serviceIds: number[];
    date: string;
    startTime: string;
    observation?: string;
}

export interface AvailabilityResponse {
    id: number;
    barberId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breaks: BreakInterval[];
}

export interface AvailabilityRequest {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breaks: BreakInterval[];
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
    openTime: string;
    closeTime: string;
    breaks: BreakInterval[];
}

export interface BreakInterval {
    startTime: string;
    endTime: string;
}

export interface DayOff {
    id: string | number;
    barberId: number;
    date: string;
    reason: string;
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
    clientCpf: string;
    notes: string;
}

export interface GalleryPhoto {
    id: number;
    imageData: string;
    title?: string;
    displayOrder: number;
    createdAt: string;
}

export type CancellationPenaltyStatus = 'PENDING' | 'AWAITING_REVIEW' | 'CONFIRMED' | 'REJECTED';

export interface CancellationPenalty {
    id: number;
    clientId: number;
    clientName: string;
    clientPhone: string;
    appointmentId: number;
    barberName: string;
    serviceNames: string;
    appointmentDate: string;
    appointmentTime: string;
    amount: number;
    status: CancellationPenaltyStatus;
    proofImageData?: string;
    createdAt: string;
    reviewedAt?: string;
    reviewedByName?: string;
}
