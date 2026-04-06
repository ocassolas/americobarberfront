import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarPlus, X, ChevronRight, ChevronLeft, Check,
    User, Scissors, Calendar, Clock, Search, Sun, CloudSun, Moon,
} from 'lucide-react';
import {
    getAdminClients, getBarbers, getServices, getTimeSlots,
    createAdminAppointment, getBarberAvailability,
} from '@/services/api';
import { apiClient } from '@/services/apiClient';
import { useToastStore } from '@/stores/useToastStore';
import type { Barber, Service, TimeSlot } from '@/types';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval,
    getDay, isBefore, startOfDay, isToday, isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ADMIN_STEPS = ['Cliente', 'Barbeiro', 'Serviço', 'Data', 'Horário', 'Confirmar'];

export function AdminBookingFAB() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const addToast = useToastStore((s) => s.addToast);

    // Selection state
    const [clients, setClients] = useState<Barber[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [services, setAllServices] = useState<Service[]>([]);
    const [slots, setSlots] = useState<TimeSlot[]>([]);

    const [selectedClient, setSelectedClient] = useState<Barber | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [observation, setObservation] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Calendar state
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [workDays, setWorkDays] = useState<number[]>([]);
    const [daysOff, setDaysOff] = useState<string[]>([]);

    useEffect(() => {
        if (open && step === 0) {
            getAdminClients().then(setClients);
        }
        if (open && step === 1) {
            getBarbers().then(setBarbers);
        }
        if (open && step === 2 && selectedBarber) {
            getServices(selectedBarber.id).then(setAllServices);
        }
    }, [open, step, selectedBarber]);

    // Fetch barber availability for date step
    useEffect(() => {
        if (step === 3 && selectedBarber) {
            Promise.all([
                apiClient.get<string[]>(`/admin/barbers/${selectedBarber.id}/date-off`).then(r => r.data).catch(() => []),
                getBarberAvailability(selectedBarber.id),
            ]).then(([off, avail]) => {
                setDaysOff(off);
                const active = avail.map(a => a.dayOfWeek === 7 ? 0 : a.dayOfWeek);
                setWorkDays(active);
            });
        }
    }, [step, selectedBarber]);

    // Fetch time slots
    useEffect(() => {
        if (step === 4 && selectedBarber && selectedDate && selectedServices.length > 0) {
            setLoadingSlots(true);
            getTimeSlots(selectedBarber.id, selectedDate, selectedServices.map(s => s.id))
                .then(setSlots)
                .finally(() => setLoadingSlots(false));
        }
    }, [step, selectedBarber, selectedDate, selectedServices]);

    const reset = () => {
        setStep(0);
        setSelectedClient(null);
        setSelectedBarber(null);
        setSelectedServices([]);
        setSelectedDate(null);
        setSelectedTime(null);
        setObservation('');
        setSearchQuery('');
    };

    const handleClose = () => {
        setOpen(false);
        reset();
    };

    const toggleService = (s: Service) => {
        setSelectedServices(prev =>
            prev.some(ss => ss.id === s.id)
                ? prev.filter(ss => ss.id !== s.id)
                : [...prev, s]
        );
    };

    const handleConfirm = async () => {
        if (!selectedClient || !selectedBarber || !selectedDate || !selectedTime) return;
        setLoading(true);
        try {
            await createAdminAppointment({
                clientId: selectedClient.id,
                barberId: selectedBarber.id,
                serviceIds: selectedServices.map(s => s.id),
                date: selectedDate,
                startTime: selectedTime.substring(0, 5),
                observation: observation || undefined,
            });
            addToast('success', `Agendamento criado para ${selectedClient.name}!`);
            handleClose();
        } catch {
            addToast('error', 'Erro ao criar agendamento. Verifique os dados.');
        } finally {
            setLoading(false);
        }
    };

    const canNext = (): boolean => {
        switch (step) {
            case 0: return selectedClient !== null;
            case 1: return selectedBarber !== null;
            case 2: return selectedServices.length > 0;
            case 3: return selectedDate !== null;
            case 4: return selectedTime !== null;
            default: return true;
        }
    };

    const formatPrice = (p: number) => p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const totalPrice = () => selectedServices.reduce((t, s) => t + s.price, 0);
    const totalDuration = () => selectedServices.reduce((t, s) => t + s.durationMinutes, 0);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    // Date helpers
    const today = startOfDay(new Date());
    const formatDateStr = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const isUnavailable = (d: Date) => {
        if (isBefore(d, today)) return true;
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 60);
        if (d > maxDate) return true;
        const dateStr = formatDateStr(d);
        if (daysOff.includes(dateStr)) return true;
        if (workDays.length > 0 && !workDays.includes(getDay(d))) return true;
        return false;
    };

    const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    const firstDayOffset = getDay(startOfMonth(currentMonth));
    const parsedSelectedDate = selectedDate ? new Date(selectedDate + 'T12:00:00') : null;

    const getPeriod = (t: string) => {
        const h = parseInt(t.split(':')[0], 10);
        if (h < 12) return 'morning';
        if (h < 18) return 'afternoon';
        return 'evening';
    };
    const periodLabels: Record<string, { icon: React.ReactNode; label: string }> = {
        morning: { icon: <Sun size={14} />, label: 'Manhã' },
        afternoon: { icon: <CloudSun size={14} />, label: 'Tarde' },
        evening: { icon: <Moon size={14} />, label: 'Noite' },
    };

    return (
        <>
            {/* FAB */}
            <motion.button
                onClick={() => setOpen(true)}
                className="fixed bottom-2 right-6 z-40 w-14 h-14 bg-accent hover:bg-accent-hover text-bg-primary rounded-full shadow-xl shadow-accent/30 flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Novo Agendamento"
            >
                <CalendarPlus size={24} />
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {open && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={handleClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-bg-card border border-border rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
                                <div>
                                    <h3 className="font-heading font-bold text-lg">Novo Agendamento</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        {ADMIN_STEPS.map((label, i) => (
                                            <div key={i} className="flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full transition-colors ${i < step ? 'bg-accent' : i === step ? 'bg-accent ring-2 ring-accent/30' : 'bg-border'
                                                    }`} />
                                            </div>
                                        ))}
                                        <span className="text-xs text-text-secondary ml-2">{ADMIN_STEPS[step]}</span>
                                    </div>
                                </div>
                                <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl transition">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-5">
                                {/* Step 0: Select Client */}
                                {step === 0 && (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                            <input
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                placeholder="Buscar cliente por nome, email ou telefone..."
                                                className="w-full bg-bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-accent outline-none transition"
                                            />
                                        </div>
                                        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                                            {filteredClients.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => setSelectedClient(c)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selectedClient?.id === c.id ? 'border-accent bg-accent/5' : 'border-border bg-bg-card hover:border-accent/30'
                                                        }`}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                                                        <User size={18} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">{c.name}</p>
                                                        <p className="text-xs text-text-secondary truncate">{c.phone} • {c.email}</p>
                                                    </div>
                                                    {selectedClient?.id === c.id && (
                                                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                                                            <Check size={12} className="text-bg-primary" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                            {filteredClients.length === 0 && (
                                                <p className="text-center text-text-secondary text-sm py-8">Nenhum cliente encontrado.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step 1: Select Barber */}
                                {step === 1 && (
                                    <div className="space-y-2">
                                        {barbers.map(b => (
                                            <button
                                                key={b.id}
                                                onClick={() => { setSelectedBarber(b); setSelectedServices([]); }}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selectedBarber?.id === b.id ? 'border-accent bg-accent/5' : 'border-border bg-bg-card hover:border-accent/30'
                                                    }`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {b.profilePicture ? (
                                                        <img src={b.profilePicture} alt={b.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Scissors size={18} className="text-accent" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{b.name}</p>
                                                </div>
                                                {selectedBarber?.id === b.id && (
                                                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                                                        <Check size={12} className="text-bg-primary" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Step 2: Select Services */}
                                {step === 2 && (
                                    <div className="space-y-2">
                                        {services.map(s => {
                                            const selected = selectedServices.some(ss => ss.id === s.id);
                                            return (
                                                <button
                                                    key={s.id}
                                                    onClick={() => toggleService(s)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selected ? 'border-accent bg-accent/5' : 'border-border bg-bg-card hover:border-accent/30'
                                                        }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-accent/20 text-accent' : 'bg-bg-input text-text-secondary'}`}>
                                                        <Scissors size={18} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm">{s.name}</p>
                                                        <p className="text-xs text-text-secondary"><Clock size={10} className="inline mr-1" />{s.durationMinutes}min</p>
                                                    </div>
                                                    <span className="font-mono text-sm font-semibold text-accent">{formatPrice(s.price)}</span>
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${selected ? 'bg-accent border-accent' : 'border-border'}`}>
                                                        {selected && <Check size={12} className="text-bg-primary" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        {selectedServices.length > 0 && (
                                            <div className="bg-bg-input border border-border rounded-xl p-3 flex justify-between items-center mt-3">
                                                <span className="text-xs text-text-secondary">{selectedServices.length} serviço{selectedServices.length > 1 ? 's' : ''} • {totalDuration()}min</span>
                                                <span className="font-mono font-bold text-accent text-sm">{formatPrice(totalPrice())}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 3: Select Date */}
                                {step === 3 && (
                                    <div className="bg-bg-input border border-border rounded-2xl p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                                                <ChevronLeft size={18} />
                                            </button>
                                            <h4 className="font-heading font-semibold text-sm capitalize">
                                                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                                            </h4>
                                            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 mb-1">
                                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                                <div key={i} className="text-center text-[10px] font-medium text-text-secondary py-1">{d}</div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} />)}
                                            {daysInMonth.map(d => {
                                                const unavailable = isUnavailable(d);
                                                const selected = parsedSelectedDate ? isSameDay(d, parsedSelectedDate) : false;
                                                const todayMark = isToday(d);
                                                return (
                                                    <button
                                                        key={d.toISOString()}
                                                        disabled={unavailable}
                                                        onClick={() => setSelectedDate(formatDateStr(d))}
                                                        className={`h-9 rounded-lg text-xs font-medium transition-all ${selected ? 'bg-accent text-bg-primary font-bold'
                                                                : unavailable ? 'opacity-30 cursor-not-allowed text-text-disabled'
                                                                    : 'hover:bg-accent/10 text-text-primary'
                                                            } ${todayMark && !selected ? 'ring-1 ring-accent/40' : ''}`}
                                                    >
                                                        {d.getDate()}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Select Time */}
                                {step === 4 && (
                                    <div>
                                        {loadingSlots ? (
                                            <div className="grid grid-cols-4 gap-2">
                                                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
                                            </div>
                                        ) : slots.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Calendar size={40} className="text-text-disabled mx-auto mb-3" />
                                                <p className="text-text-secondary text-sm">Nenhum horário disponível nesta data.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {Object.entries(
                                                    slots.reduce<Record<string, TimeSlot[]>>((acc, s) => {
                                                        const p = getPeriod(s.time);
                                                        if (!acc[p]) acc[p] = [];
                                                        acc[p].push(s);
                                                        return acc;
                                                    }, {})
                                                ).map(([period, periodSlots]) => (
                                                    <div key={period}>
                                                        <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-text-secondary">
                                                            {periodLabels[period]?.icon}
                                                            {periodLabels[period]?.label}
                                                        </div>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {periodSlots.map(slot => (
                                                                <button
                                                                    key={slot.time}
                                                                    disabled={!slot.available}
                                                                    onClick={() => setSelectedTime(slot.time)}
                                                                    className={`py-2 rounded-lg text-xs font-mono font-medium transition-all ${selectedTime === slot.time
                                                                            ? 'bg-accent text-bg-primary shadow-lg shadow-accent/20'
                                                                            : slot.available
                                                                                ? 'bg-bg-input text-text-primary hover:bg-accent/10'
                                                                                : 'bg-bg-card text-text-disabled line-through cursor-not-allowed opacity-50'
                                                                        }`}
                                                                >
                                                                    {slot.time}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 5: Confirm */}
                                {step === 5 && (
                                    <div className="space-y-4">
                                        <div className="bg-bg-input border border-border rounded-2xl p-4 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-text-secondary">Cliente</span>
                                                <span className="font-medium">{selectedClient?.name}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-text-secondary">Barbeiro</span>
                                                <span className="font-medium">{selectedBarber?.name}</span>
                                            </div>
                                            <div className="border-t border-border pt-3">
                                                <span className="text-xs text-text-secondary uppercase tracking-wider">Serviços</span>
                                                {selectedServices.map(s => (
                                                    <div key={s.id} className="flex justify-between text-sm mt-1.5">
                                                        <span>{s.name}</span>
                                                        <span className="font-mono text-accent">{formatPrice(s.price)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="border-t border-border pt-3 flex justify-between text-sm">
                                                <span className="text-text-secondary">Data</span>
                                                <span className="font-medium">{selectedDate?.split('-').reverse().join('/')}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-text-secondary">Horário</span>
                                                <span className="font-mono font-medium">{selectedTime}</span>
                                            </div>
                                            <div className="border-t border-border pt-3 flex justify-between">
                                                <span className="font-bold">Total</span>
                                                <span className="font-mono font-bold text-accent text-lg">{formatPrice(totalPrice())}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold mb-1.5 block text-text-secondary uppercase tracking-wider">Observações (opcional)</label>
                                            <textarea
                                                value={observation}
                                                onChange={e => setObservation(e.target.value.slice(0, 200))}
                                                placeholder="Ex: cliente pediu degradê baixo..."
                                                rows={2}
                                                className="w-full bg-bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:border-accent outline-none transition resize-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t border-border flex gap-3 flex-shrink-0">
                                {step > 0 && (
                                    <button
                                        onClick={() => setStep(s => s - 1)}
                                        className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-white/5 transition text-sm font-medium"
                                    >
                                        <ChevronLeft size={14} /> Voltar
                                    </button>
                                )}
                                {step < 5 ? (
                                    <button
                                        onClick={() => setStep(s => s + 1)}
                                        disabled={!canNext()}
                                        className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 text-bg-primary font-semibold py-2.5 rounded-xl transition text-sm"
                                    >
                                        Próximo <ChevronRight size={14} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleConfirm}
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-bg-primary font-semibold py-2.5 rounded-xl transition text-sm shadow-lg shadow-accent/20"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Check size={14} /> Confirmar Agendamento
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
