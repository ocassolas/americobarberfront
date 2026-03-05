import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { getAppointments } from '@/services/api';
import type { Appointment } from '@/types';
import {
    format, addDays, subDays, startOfWeek, eachDayOfInterval,
    addWeeks, subWeeks, isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewMode = 'week' | 'day';

export function AgendaPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewMode>('week');
    const [selected, setSelected] = useState<Appointment | null>(null);

    useEffect(() => {
        getAppointments().then((data) => {
            setAppointments(data);
            setLoading(false);
        });
    }, []);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

    const fmtDate = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const getAptsForDay = (d: Date) =>
        appointments.filter((a) => a.date === fmtDate(d) && a.status !== 'cancelled');

    const navigate = (dir: number) => {
        if (view === 'week') setCurrentDate((p) => dir > 0 ? addWeeks(p, 1) : subWeeks(p, 1));
        else setCurrentDate((p) => dir > 0 ? addDays(p, 1) : subDays(p, 1));
    };

    const formatPrice = (p: number) => p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="skeleton h-12 rounded-xl w-48" />
                <div className="skeleton h-96 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">Agenda</h1>
                <div className="flex items-center gap-2">
                    <div className="bg-bg-card border border-border rounded-xl flex overflow-hidden">
                        <button
                            onClick={() => setView('week')}
                            className={`px-3 py-1.5 text-xs font-medium transition ${view === 'week' ? 'bg-accent text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setView('day')}
                            className={`px-3 py-1.5 text-xs font-medium transition ${view === 'day' ? 'bg-accent text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            Dia
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between bg-bg-card card-surface border border-border rounded-2xl px-4 py-3">
                <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-lg transition" aria-label="Anterior">
                    <ChevronLeft size={20} />
                </button>
                <span className="font-heading font-semibold text-sm capitalize">
                    {view === 'week'
                        ? `${format(weekDays[0], "dd MMM", { locale: ptBR })} — ${format(weekDays[6], "dd MMM yyyy", { locale: ptBR })}`
                        : format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
                    }
                </span>
                <button onClick={() => navigate(1)} className="p-1 hover:bg-white/10 rounded-lg transition" aria-label="Próximo">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Calendar content */}
            {view === 'week' ? (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                        const dayApts = getAptsForDay(day);
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div
                                key={day.toISOString()}
                                className={`bg-bg-card card-surface border rounded-2xl p-3 min-h-[120px] ${isToday ? 'border-accent/40' : 'border-border'
                                    }`}
                            >
                                <div className="text-center mb-2">
                                    <p className="text-xs text-text-secondary capitalize">{format(day, 'EEE', { locale: ptBR })}</p>
                                    <p className={`text-lg font-bold font-mono ${isToday ? 'text-accent' : ''}`}>{format(day, 'dd')}</p>
                                </div>
                                <div className="space-y-1">
                                    {dayApts.map((apt) => (
                                        <button
                                            key={apt.id}
                                            onClick={() => setSelected(apt)}
                                            className="w-full text-left p-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 transition text-xs"
                                        >
                                            <span className="font-mono text-accent font-medium">{apt.time}</span>
                                            <p className="truncate text-text-primary">{apt.clientName.split(' ')[0]}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-bg-card card-surface border border-border rounded-2xl p-4">
                    {getAptsForDay(currentDate).length === 0 ? (
                        <p className="text-center text-text-secondary py-8 text-sm">Nenhum agendamento neste dia</p>
                    ) : (
                        <div className="space-y-2">
                            {getAptsForDay(currentDate)
                                .sort((a, b) => a.time.localeCompare(b.time))
                                .map((apt) => (
                                    <button
                                        key={apt.id}
                                        onClick={() => setSelected(apt)}
                                        className="w-full flex items-center gap-4 p-3 rounded-xl bg-bg-input hover:bg-accent/5 transition text-left"
                                    >
                                        <span className="font-mono font-semibold text-accent w-14 text-sm">{apt.time}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{apt.clientName}</p>
                                            <p className="text-xs text-text-secondary">{apt.services.map((s) => s.name).join(', ')}</p>
                                        </div>
                                        <span className="text-xs text-text-secondary">{apt.barberName.split(' ')[0]}</span>
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Appointment detail modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-bg-card border border-border rounded-2xl p-6 max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-heading font-semibold text-lg mb-4">Detalhes do Agendamento</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-text-secondary">Cliente</span><span>{selected.clientName}</span></div>
                            <div className="flex justify-between"><span className="text-text-secondary">Telefone</span><span className="font-mono">{selected.clientPhone}</span></div>
                            <div className="flex justify-between"><span className="text-text-secondary">Barbeiro</span><span>{selected.barberName}</span></div>
                            <div className="flex justify-between"><span className="text-text-secondary">Horário</span><span className="font-mono">{selected.time}</span></div>
                            <div className="flex justify-between"><span className="text-text-secondary">Duração</span><span>{selected.totalDuration}min</span></div>
                            <div><span className="text-text-secondary block mb-1">Serviços</span>{selected.services.map((s) => s.name).join(', ')}</div>
                            <div className="flex justify-between font-semibold pt-2 border-t border-border"><span>Total</span><span className="text-accent font-mono">{formatPrice(selected.totalPrice)}</span></div>
                        </div>
                        <button
                            onClick={() => setSelected(null)}
                            className="w-full mt-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-white/5 transition"
                        >
                            Fechar
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
