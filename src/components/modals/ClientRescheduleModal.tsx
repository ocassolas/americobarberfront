import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, Info, Loader2 } from 'lucide-react';
import { format, getDay } from 'date-fns';
import { useToastStore } from '@/stores/useToastStore';
import { apiClient } from '@/services/apiClient';
import { getBarberAvailability, getTimeSlots } from '@/services/api';
import type { TimeSlot } from '@/types';

interface ClientRescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { newDate: string; newStartTime: string; observation: string }) => Promise<void>;
    appointmentDate: string;
    appointmentTime: string;
    services: string[];
    barberId: number;
    serviceIds: number[];
}

export function ClientRescheduleModal({
    isOpen,
    onClose,
    onConfirm,
    appointmentDate,
    appointmentTime,
    services,
    barberId,
    serviceIds,
}: ClientRescheduleModalProps) {
    const [date, setDate] = useState(appointmentDate);
    const [time, setTime] = useState(appointmentTime);
    const [observation, setObservation] = useState('');
    const [loading, setLoading] = useState(false);
    const [workDays, setWorkDays] = useState<number[]>([]);
    const [daysOff, setDaysOff] = useState<string[]>([]);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingAvail, setLoadingAvail] = useState(true);
    const addToast = useToastStore((s) => s.addToast);

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = format(maxDate, 'yyyy-MM-dd');

    // Carrega disponibilidade e datas bloqueadas do barbeiro
    useEffect(() => {
        if (!isOpen || !barberId) return;
        setLoadingAvail(true);
        Promise.all([
            apiClient.get<string[]>(`/clients/barbers/${barberId}/date-off`).then(r => r.data).catch(() => []),
            getBarberAvailability(barberId),
        ]).then(([off, avail]) => {
            setDaysOff(off);
            // BE dayOfWeek (1=Mon..7=Sun) → JS dayOfWeek (0=Sun..6=Sat)
            setWorkDays(avail.map(a => a.dayOfWeek === 7 ? 0 : a.dayOfWeek));
        }).finally(() => setLoadingAvail(false));
    }, [isOpen, barberId]);

    // Carrega horários disponíveis para a data escolhida
    useEffect(() => {
        if (!isOpen || !date || !barberId || serviceIds.length === 0) return;
        setLoadingSlots(true);
        getTimeSlots(barberId, date, serviceIds)
            .then(setSlots)
            .finally(() => setLoadingSlots(false));
    }, [isOpen, date, barberId, serviceIds]);

    const isDateInvalid = (d: string): string | null => {
        if (!d) return 'Selecione uma data.';
        if (d < todayStr) return 'Data no passado.';
        if (d > maxDateStr) return 'Apenas até 30 dias a partir de hoje.';
        if (daysOff.includes(d)) return 'O barbeiro não atende nesta data.';
        const jsDay = getDay(new Date(d + 'T12:00:00'));
        if (workDays.length > 0 && !workDays.includes(jsDay)) {
            return 'O barbeiro não trabalha neste dia da semana.';
        }
        return null;
    };

    const dateError = loadingAvail ? null : isDateInvalid(date);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (dateError) {
            addToast('error', dateError);
            return;
        }
        if (!time || !slots.some(s => s.time === time)) {
            addToast('error', 'Selecione um horário disponível da lista.');
            return;
        }
        setLoading(true);
        try {
            await onConfirm({ newDate: date, newStartTime: time, observation });
            addToast('success', 'Agendamento reagendado com sucesso!');
            onClose();
        } catch {
            addToast('error', 'Horário indisponível ou erro ao reagendar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-heading font-bold text-xl">Reagendar</h3>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition">
                                <X size={20} className="text-text-secondary" />
                            </button>
                        </div>

                        <div className="bg-accent/5 rounded-2xl p-4 mb-6 border border-accent/10">
                            <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Serviços</p>
                            <p className="text-sm font-medium">{services.join(', ')}</p>
                            <p className="text-sm font-mono text-accent">Atual: {appointmentDate} às {appointmentTime}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5 ml-1">Nova Data</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent" size={18} />
                                    <input
                                        type="date"
                                        required
                                        min={todayStr}
                                        max={maxDateStr}
                                        value={date}
                                        onChange={(e) => { setDate(e.target.value); setTime(''); }}
                                        className={`w-full bg-bg-input border rounded-xl pl-11 pr-4 py-3 text-sm focus:border-accent outline-none transition ${dateError ? 'border-error' : 'border-border'}`}
                                    />
                                </div>
                                {dateError && <p className="text-error text-xs mt-1 ml-1">{dateError}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5 ml-1">Novo Horário</label>
                                {loadingSlots || loadingAvail ? (
                                    <div className="flex items-center justify-center py-6 text-text-secondary">
                                        <Loader2 size={18} className="animate-spin" />
                                    </div>
                                ) : dateError ? (
                                    <p className="text-xs text-text-disabled text-center py-4">Selecione uma data válida para ver os horários.</p>
                                ) : slots.length === 0 ? (
                                    <p className="text-xs text-text-disabled text-center py-4">Nenhum horário disponível nesta data.</p>
                                ) : (
                                    <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
                                        {slots.map((s) => {
                                            const selected = s.time === time;
                                            return (
                                                <button
                                                    type="button"
                                                    key={s.time}
                                                    onClick={() => setTime(s.time)}
                                                    className={`py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                                                        selected
                                                            ? 'bg-accent text-bg-primary shadow-lg shadow-accent/20'
                                                            : 'bg-bg-input text-text-primary hover:bg-accent/20 hover:text-accent'
                                                    }`}
                                                >
                                                    <Clock size={10} className="inline mr-1" />
                                                    {s.time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5 ml-1">Motivo (opcional)</label>
                                <textarea
                                    value={observation}
                                    onChange={(e) => setObservation(e.target.value)}
                                    placeholder="Ex: Tive um imprevisto"
                                    rows={2}
                                    className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition resize-none"
                                />
                            </div>

                            <div className="flex items-start gap-2 bg-info/5 p-3 rounded-xl border border-info/10 mb-2">
                                <Info size={16} className="text-info shrink-0 mt-0.5" />
                                <p className="text-[10px] text-text-secondary">
                                    O reagendamento está sujeito à disponibilidade do profissional.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3.5 rounded-2xl border border-border text-sm font-bold hover:bg-white/5 transition"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !!dateError || !time}
                                    className="flex-1 py-3.5 rounded-2xl bg-accent text-bg-primary text-sm font-bold hover:bg-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processando...' : 'Confirmar'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
