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
        // Update handling depending on context (admin vs barber)
        const endpoint = isBarber() && !isAdmin() ? `/barbers/services/${service.id}` : `/admin/services/${service.id}`;
        const res = await apiClient.put<Service>(endpoint, service);
        return res.data;
    } else {
        const res = await apiClient.post<Service>('/admin/services', service);
        return res.data;
    }
}

export async function deleteService(id: number): Promise<void> {
    // API doesn't specify DELETE /services, assuming setting active=false via PUT
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
    // Backend API handles this via /clients/appointments tied to the JWT
    // So we just return the logged client's appointments (or empty if not logged in)
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
        await apiClient.put(`/barbers/appointments/${id}/cancel`, { observation: observation || 'Cancelado pelo barbeiro' });
    } else {
        await apiClient.delete(`/clients/appointments/${id}`, { data: { observation: observation || 'Cancelado pelo cliente' } });
    }
}

// ================= SCHEDULES & AVAILABILITY =================
export async function getSchedules(): Promise<WorkSchedule[]> {
    // Mock assembling schedule from API since API separates availability and days off
    if (!isBarber()) return [];

    const availRes = await apiClient.get<AvailabilityResponse[]>('/barbers/availability');
    const daysOffRes = await apiClient.get<string[]>('/barbers/date-off');

    const user = useAuthStore.getState().user;

    const workDays = [0, 1, 2, 3, 4, 5, 6].map(day => {
        const slot = availRes.data.find(a => a.dayOfWeek === day);
        if (slot) {
            return {
                dayOfWeek: day,
                enabled: true,
                openTime: `${String(slot.startTime.hour).padStart(2, '0')}:${String(slot.startTime.minute).padStart(2, '0')}`,
                closeTime: `${String(slot.endTime.hour).padStart(2, '0')}:${String(slot.endTime.minute).padStart(2, '0')}`
            };
        }
        return { dayOfWeek: day, enabled: false, openTime: '08:00', closeTime: '20:00' };
    });

    const daysOff: DayOff[] = daysOffRes.data.map((date, idx) => ({
        id: `off-${idx}`,
        barberId: user!.id,
        date: date,
        reason: 'Folga'
    }));

    return [{
        barberId: user!.id,
        barberName: user!.name,
        workDays,
        daysOff
    }];
}

export async function getTimeSlots(barberId: number, date: string, serviceIds: number[]): Promise<TimeSlot[]> {
    try {
        const res = await apiClient.get<LocalTime[]>(`/clients/barbers/${barberId}/available-times`, {
            params: { 
                date,
                serviceIds: serviceIds.join(',')
            }
        });
        
        return res.data.map(lt => ({
            time: `${String(lt.hour).padStart(2, '0')}:${String(lt.minute).padStart(2, '0')}`,
            available: true
        }));
    } catch (error) {
        console.error('Error fetching available times:', error);
        return [];
    }
}

export async function updateSlotInterval(interval: number): Promise<void> {
    await apiClient.put('/barbers/profile/slot-interval', { slotIntervalMinutes: interval });
}

export async function saveSchedule(schedule: WorkSchedule): Promise<WorkSchedule> {
    // API separated into /availability and /date-off
    const availabilityPayload = schedule.workDays
        .filter(wd => wd.enabled)
        .map(wd => {
            const [oH, oM] = wd.openTime.split(':').map(Number);
            const [cH, cM] = wd.closeTime.split(':').map(Number);
            return {
                dayOfWeek: wd.dayOfWeek,
                startTime: { hour: oH, minute: oM, second: 0, nano: 0 },
                endTime: { hour: cH, minute: cM, second: 0, nano: 0 }
            };
        });

    await apiClient.put('/barbers/availability', availabilityPayload);

    const datesOffPayload = {
        datesOff: schedule.daysOff.map(d => d.date)
    };
    await apiClient.put('/barbers/date-off', datesOffPayload);

    return schedule;
}
