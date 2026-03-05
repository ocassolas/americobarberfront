import type { WorkSchedule } from '@/types';

export const MOCK_SCHEDULES: WorkSchedule[] = [
    {
        barberId: 'barber-1',
        barberName: 'Carlos Américo',
        workDays: [
            { dayOfWeek: 0, enabled: false, openTime: '08:00', closeTime: '20:00' },
            { dayOfWeek: 1, enabled: true, openTime: '08:00', closeTime: '20:00' },
            { dayOfWeek: 2, enabled: true, openTime: '08:00', closeTime: '20:00' },
            { dayOfWeek: 3, enabled: true, openTime: '08:00', closeTime: '20:00' },
            { dayOfWeek: 4, enabled: true, openTime: '08:00', closeTime: '20:00' },
            { dayOfWeek: 5, enabled: true, openTime: '08:00', closeTime: '20:00' },
            { dayOfWeek: 6, enabled: true, openTime: '09:00', closeTime: '18:00' },
        ],
        daysOff: [
            { id: 'off-1', barberId: 'barber-1', date: '2026-03-02', reason: 'Consulta médica' },
        ],
    },
    {
        barberId: 'barber-2',
        barberName: 'Rafael Santos',
        workDays: [
            { dayOfWeek: 0, enabled: false, openTime: '08:00', closeTime: '20:00' },
            { dayOfWeek: 1, enabled: true, openTime: '08:00', closeTime: '20:00' },
            { dayOfWeek: 2, enabled: true, openTime: '08:00', closeTime: '20:00' },
            { dayOfWeek: 3, enabled: true, openTime: '08:00', closeTime: '20:00' },
            { dayOfWeek: 4, enabled: true, openTime: '08:00', closeTime: '20:00' },
            { dayOfWeek: 5, enabled: true, openTime: '08:00', closeTime: '20:00' },
            { dayOfWeek: 6, enabled: true, openTime: '09:00', closeTime: '18:00' },
        ],
        daysOff: [
            { id: 'off-2', barberId: 'barber-2', date: '2026-03-09', reason: 'Folga pessoal' },
        ],
    },
];
