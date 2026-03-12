import { apiClient } from './apiClient';
import type { Appointment, AppointmentRequest, Barber, Service, TimeSlot, WorkSchedule, AvailabilityResponse, DayOff, LocalTime } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';

// Role-based helper
const isAdmin = () => {
    const user = useAuthStore.getState().user;
    return user?.role === 'ROLE_ADMIN';
};

const isBarber = () => {
    const user = useAuthStore.getState().user;
    return user?.isBarber === true;
};

// ================= CLIENTS =================
export async function getAdminClients(): Promise<Barber[]> {
    const res = await apiClient.get<Barber[]>('/admin/clients');
    return res.data;
}

// ================= BARBERS =================
export async function getBarbers(): Promise<Barber[]> {
    if (isAdmin()) {
        const res = await apiClient.get<Barber[]>('/admin/barbers');
        return res.data;
    } else {
        const res = await apiClient.get<Barber[]>('/clients/barbers');
        return res.data;
    }
}

export async function registerBarber(data: any): Promise<Barber> {
    const res = await apiClient.post<Barber>('/admin/barbers', data);
    return res.data;
}

export async function updateProfile(data: any): Promise<Barber> {
    const user = useAuthStore.getState().user;
    const res = await apiClient.put<Barber>(`/admin/users/${user?.id}`, data);
    return res.data;
}

// ================= SERVICES =================
export async function getServices(barberId?: number): Promise<Service[]> {
    if (isAdmin() && !isBarber()) {
        const res = await apiClient.get<Service[]>('/admin/services');
        return res.data;
    } else if (isBarber()) {
        const res = await apiClient.get<Service[]>('/barbers/services');
        return res.data;
    } else {
        if (!barberId) return [];
        const res = await apiClient.get<Service[]>(`/clients/barbers/${barberId}/services`);
        return res.data;
    }
}

export async function saveService(service: Service): Promise<Service> {
    if (service.id) {
        const endpoint = isBarber() && !isAdmin() ? `/barbers/services/${service.id}` : `/admin/services/${service.id}`;
        const res = await apiClient.put<Service>(endpoint, service);
        return res.data;
    } else {
        const res = await apiClient.post<Service>('/admin/services', service);
        return res.data;
    }
}

export async function deleteService(id: number): Promise<void> {
    const services = await getServices();
    const service = services.find(s => s.id === id);
    if (service) {
        service.active = false;
        await saveService(service);
    }
}

// ================= APPOINTMENTS =================
export async function getAppointments(): Promise<Appointment[]> {
    if (isBarber()) {
        const res = await apiClient.get<Appointment[]>('/barbers/appointments');
        return res.data;
    } else if (isAdmin()) {
        const res = await apiClient.get<Appointment[]>('/admin/appointments');
        return res.data;
    }
    const res = await apiClient.get<Appointment[]>('/clients/appointments');
    return res.data;
}

export async function getAppointmentsByPhone(phone: string): Promise<Appointment[]> {
    try {
        const res = await apiClient.get<Appointment[]>('/clients/appointments');
        return res.data;
    } catch {
        return [];
    }
}

export async function createAppointment(data: AppointmentRequest): Promise<Appointment> {
    const res = await apiClient.post<Appointment>('/clients/appointments', data);
    return res.data;
}

export async function cancelAppointment(id: number, observation?: string): Promise<void> {
    if (isBarber()) {
        // Updated to use DELETE as per backend BarberController
        await apiClient.delete(`/barbers/appointments/${id}`, { 
            data: { observation: observation || 'Cancelado pelo barbeiro' } 
        });
    } else {
        await apiClient.delete(`/clients/appointments/${id}`, { 
            data: { observation: observation || 'Cancelado pelo cliente' } 
        });
    }
}

export async function proposeReschedule(id: number, data: any): Promise<void> {
    await apiClient.put(`/barbers/appointments/${id}/propose-reschedule`, data);
}

export async function acceptProposal(id: number): Promise<Appointment> {
    const res = await apiClient.put<Appointment>(`/clients/appointments/${id}/accept-proposal`);
    return res.data;
}

export async function rejectProposal(id: number): Promise<void> {
    await apiClient.put(`/clients/appointments/${id}/reject-proposal`);
}

export async function rescheduleAppointment(id: number, data: any): Promise<Appointment> {
    const res = await apiClient.put<Appointment>(`/clients/appointments/${id}/reschedule`, data);
    return res.data;
}

export async function finalizeAppointment(id: number): Promise<void> {
    // Assuming backend added this or uses a generic update. 
    // Since user says it's ready, I'll assume the endpoint is PUT /barbers/appointments/{id}/finalize
    await apiClient.put(`/barbers/appointments/${id}/finalize`);
}


// ================= SCHEDULES & AVAILABILITY =================
export async function getSchedules(): Promise<WorkSchedule[]> {
    const user = useAuthStore.getState().user;
    if (!user) return [];

    if (isAdmin() && !isBarber()) {
        // Global admin: fetch all barbers and their schedules
        const barbers = await getBarbers();
        const schedules = await Promise.all(barbers.map(async b => {
            try {
                const availRes = await apiClient.get<AvailabilityResponse[]>(`/admin/barbers/${b.id}/availability`);
                const daysOffRes = await apiClient.get<string[]>(`/admin/barbers/${b.id}/date-off`);
                
                return assembleSchedule(b.id, b.name, availRes.data, daysOffRes.data);
            } catch (e) {
                console.error(`Error fetching schedule for barber ${b.id}:`, e);
                return assembleSchedule(b.id, b.name, [], []);
            }
        }));
        return schedules;
    } else if (isBarber()) {
        // Barber: fetch own schedule
        const availRes = await apiClient.get<AvailabilityResponse[]>('/barbers/availability');
        const daysOffRes = await apiClient.get<string[]>('/barbers/date-off');
        return [assembleSchedule(user.id, user.name, availRes.data, daysOffRes.data)];
    }

    return [];
}

function assembleSchedule(barberId: number, barberName: string, avail: AvailabilityResponse[], daysOffDates: string[]): WorkSchedule {
    // FE uses 0=Sunday, 1=Monday... 6=Saturday
    // BE uses 1=Monday... 7=Sunday
    const workDays = [0, 1, 2, 3, 4, 5, 6].map(feDay => {
        const beDay = feDay === 0 ? 7 : feDay;
        const slot = avail.find(a => a.dayOfWeek === beDay);
        
        if (slot) {
            return {
                dayOfWeek: feDay,
                enabled: true,
                openTime: (slot.startTime as unknown as string).substring(0, 5),
                closeTime: (slot.endTime as unknown as string).substring(0, 5),
                breakStart: slot.breakStartTime ? (slot.breakStartTime as unknown as string).substring(0, 5) : null,
                breakEnd: slot.breakEndTime ? (slot.breakEndTime as unknown as string).substring(0, 5) : null,
            };
        }
        return { dayOfWeek: feDay, enabled: false, openTime: '08:00', closeTime: '20:00', breakStart: null, breakEnd: null };
    });

    const daysOff: DayOff[] = daysOffDates.map((date, idx) => ({
        id: `off-${barberId}-${idx}`,
        barberId,
        date: date,
        reason: 'Folga'
    }));

    return {
        barberId,
        barberName,
        workDays,
        daysOff
    };
}

export async function getBarberAvailability(barberId: number): Promise<AvailabilityResponse[]> {
    if (!barberId || barberId <= 0) return [];
    try {
        const res = await apiClient.get<AvailabilityResponse[]>(`/clients/barbers/${barberId}/availability`);
        return res.data;
    } catch {
        return [];
    }
}

export async function getTimeSlots(barberId: number, date: string, serviceIds: number[]): Promise<TimeSlot[]> {
     // Ensure barberId is valid (BookingPage might pass -1 for 'no preference')
    if (!barberId || barberId === -1) {
        // For no preference, we might need a different backend endpoint or just pick the first available barber
        // For now, let's just pick barber 1 or handle it as an error
        return [];
    }
    try {
        const res = await apiClient.get<string[]>(`/clients/barbers/${barberId}/available-times`, {
            params: { 
                date,
                serviceIds: serviceIds.join(',')
            }
        });
        
        return res.data.map((timeStr: string) => ({
            time: timeStr.substring(0, 5),
            available: true
        }));
    } catch (error) {
        console.error('Error fetching available times:', error);
        return [];
    }
}

export async function updateSlotInterval(interval: number, barberId?: number): Promise<void> {
    const user = useAuthStore.getState().user;
    const targetId = barberId || user?.id;
    if (!targetId) return;

    if (isAdmin() && targetId !== user?.id) {
        await apiClient.put(`/admin/barbers/${targetId}/slot-interval`, { slotIntervalMinutes: interval });
    } else {
        await apiClient.put('/barbers/profile/slot-interval', { slotIntervalMinutes: interval });
    }
}

export async function saveSchedule(schedule: WorkSchedule): Promise<WorkSchedule> {
    const user = useAuthStore.getState().user;
    const isEditingSelf = schedule.barberId === user?.id;
    
    // API separated into /availability and /date-off
    const availabilityPayload = schedule.workDays
        .filter(wd => wd.enabled)
        .map(wd => {
            const beDay = wd.dayOfWeek === 0 ? 7 : wd.dayOfWeek;
            return {
                dayOfWeek: beDay,
                startTime: wd.openTime.substring(0, 5),
                endTime: wd.closeTime.substring(0, 5),
                breakStartTime: wd.breakStart || null,
                breakEndTime: wd.breakEnd || null,
            };
        });

    const datesOffPayload = {
        datesOff: schedule.daysOff.map(d => d.date)
    };

    if (isAdmin() && !isEditingSelf) {
        await apiClient.put(`/admin/barbers/${schedule.barberId}/availability`, availabilityPayload);
        await apiClient.put(`/admin/barbers/${schedule.barberId}/date-off`, datesOffPayload);
    } else {
        await apiClient.put('/barbers/availability', availabilityPayload);
        await apiClient.put('/barbers/date-off', datesOffPayload);
    }

    return schedule;
}
