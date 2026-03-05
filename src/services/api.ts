import { MOCK_BARBERS } from '@/mocks/barbers';
import { MOCK_SERVICES } from '@/mocks/services';
import { MOCK_APPOINTMENTS } from '@/mocks/appointments';
import { MOCK_SCHEDULES } from '@/mocks/schedules';
import type { Appointment, Barber, Service, TimeSlot, WorkSchedule } from '@/types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getBarbers(): Promise<Barber[]> {
    await delay(300);
    return MOCK_BARBERS;
}

export async function getServices(): Promise<Service[]> {
    await delay(300);
    return MOCK_SERVICES.filter((s) => s.active);
}

export async function getAppointments(): Promise<Appointment[]> {
    await delay(400);
    return MOCK_APPOINTMENTS;
}

export async function getAppointmentsByPhone(phone: string): Promise<Appointment[]> {
    await delay(500);
    return MOCK_APPOINTMENTS.filter((a) => a.clientPhone === phone);
}

export async function createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    await delay(600);
    const appointment: Appointment = {
        ...data,
        id: `apt-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    MOCK_APPOINTMENTS.push(appointment);
    return appointment;
}

export async function cancelAppointment(id: string): Promise<void> {
    await delay(400);
    const apt = MOCK_APPOINTMENTS.find((a) => a.id === id);
    if (apt) apt.status = 'cancelled';
}

export async function getSchedules(): Promise<WorkSchedule[]> {
    await delay(300);
    return MOCK_SCHEDULES;
}

export async function getTimeSlots(barberId: string, date: string): Promise<TimeSlot[]> {
    await delay(400);
    const slots: TimeSlot[] = [];
    const schedule = MOCK_SCHEDULES.find((s) => s.barberId === barberId) ?? MOCK_SCHEDULES[0];
    const dayDate = new Date(date + 'T12:00:00');
    const dayOfWeek = dayDate.getDay();
    const workDay = schedule.workDays.find((w) => w.dayOfWeek === dayOfWeek);

    if (!workDay || !workDay.enabled) return [];

    const isDayOff = schedule.daysOff.some((d) => d.date === date);
    if (isDayOff) return [];

    const [openH, openM] = workDay.openTime.split(':').map(Number);
    const [closeH, closeM] = workDay.closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isToday = date === todayStr;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const bookedTimes = MOCK_APPOINTMENTS
        .filter((a) => a.barberId === barberId && a.date === date && a.status !== 'cancelled')
        .map((a) => a.time);

    const seed = date.split('-').reduce((a, b) => a + parseInt(b, 10), 0) + barberId.charCodeAt(barberId.length - 1);

    for (let m = openMinutes; m < closeMinutes; m += 30) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

        if (isToday && m <= currentMinutes) continue;

        const isBooked = bookedTimes.includes(timeStr);
        const pseudoRandom = ((seed * (m + 1) * 17) % 100);
        const isRandomlyOccupied = pseudoRandom < 30;

        slots.push({
            time: timeStr,
            available: !isBooked && !isRandomlyOccupied,
        });
    }

    return slots;
}

export async function saveService(service: Service): Promise<Service> {
    await delay(400);
    const idx = MOCK_SERVICES.findIndex((s) => s.id === service.id);
    if (idx >= 0) {
        MOCK_SERVICES[idx] = service;
    } else {
        MOCK_SERVICES.push(service);
    }
    return service;
}

export async function deleteService(id: string): Promise<void> {
    await delay(300);
    const idx = MOCK_SERVICES.findIndex((s) => s.id === id);
    if (idx >= 0) MOCK_SERVICES.splice(idx, 1);
}

export async function saveSchedule(schedule: WorkSchedule): Promise<WorkSchedule> {
    await delay(400);
    const idx = MOCK_SCHEDULES.findIndex((s) => s.barberId === schedule.barberId);
    if (idx >= 0) MOCK_SCHEDULES[idx] = schedule;
    return schedule;
}
