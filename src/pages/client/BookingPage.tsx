import { useState, useEffect } from 'react';
import { apiClient } from '@/services/apiClient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, ChevronLeft, ChevronRight, Scissors, Star, Dices,
    Clock, Sun, CloudSun, Moon, Calendar, User, Phone, FileText,
    PenTool, Sparkles, Eye, Palette, Droplets, CheckCircle, CreditCard, X,
} from 'lucide-react';
import { useBookingStore } from '@/stores/useBookingStore';
import { useToastStore } from '@/stores/useToastStore';
import { getTimeSlots, createAppointment, getBarbers, getServices, getBarberAvailability } from '@/services/api';
import { TEXT } from '@/config/constants';
import type { TimeSlot, Service, Barber } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval,
    getDay, isBefore, startOfDay, isToday, isSameMonth, isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
    scissors: <Scissors size={20} />,
    'pen-tool': <PenTool size={20} />,
    sparkles: <Sparkles size={20} />,
    eye: <Eye size={20} />,
    palette: <Palette size={20} />,
    droplets: <Droplets size={20} />,
};

const STEPS = TEXT.booking.steps;

const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 }),
};

function StepSuccess() {
    const store = useBookingStore();
    const navigate = useNavigate();

    return (
        <div className="text-center py-8">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6"
            >
                <Check size={40} />
            </motion.div>
            <h2 className="font-heading text-2xl font-bold mb-2 text-text-primary">Agendamento Realizado!</h2>
            <p className="text-text-secondary mb-8">Seu horário foi reservado com sucesso.</p>

            <div className="space-y-3 px-4 max-w-sm mx-auto">
                <button
                    onClick={() => {
                        store.reset();
                        navigate('/meus-agendamentos');
                    }}
                    className="w-full py-3.5 rounded-xl border border-border text-text-secondary font-medium hover:bg-white/5 transition"
                >
                    Meus Agendamentos
                </button>
            </div>
        </div>
    );
}

export function BookingPage() {
    const store = useBookingStore();
    const addToast = useToastStore((s) => s.addToast);
    const navigate = useNavigate();
    const [direction, setDirection] = useState(1);
    const [loading, setLoading] = useState(false);
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && user) {
            if (!store.clientName) store.setClientName(user.name);
            if (!store.clientPhone && user.phone) store.setClientPhone(user.phone);
            if (!store.clientCpf && user.cpf) store.setClientCpf(user.cpf);
        }
    }, [isAuthenticated, user, store]);

    const canNext = (): boolean => {
        switch (store.step) {
            case 0: return store.barberId !== null;
            case 1: return store.services.length > 0;
            case 2: return store.date !== null;
            case 3: return store.time !== null;
            case 4: return store.clientName.trim().length >= 3 && 
                           /^\(\d{2}\) \d{5}-\d{4}$/.test(store.clientPhone) &&
                           store.clientCpf.replace(/\D/g, '').length === 11;
            default: return true;
        }
    };

    const goNext = () => {
        if (store.step < 5) {
            setDirection(1);
            store.setStep(store.step + 1);
        }
    };

    const goPrev = () => {
        if (store.step > 0) {
            setDirection(-1);
            store.setStep(store.step - 1);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const user = useAuthStore.getState().user;
            if (!user?.id) {
                addToast('error', 'Você precisa estar autenticado para agendar.');
                navigate('/entrar');
                return;
            }
            
            await createAppointment({
                clientId: user.id,
                barberId: store.barberId ?? 1,
                serviceIds: store.services.map(s => s.id),
                date: store.date ?? '',
                startTime: (store.time ?? '00:00').substring(0, 5),
                observation: store.notes
            });
            addToast('success', TEXT.booking.success);
            store.setStep(6);
        } catch (err) {
            console.error(err);
            addToast('error', 'Erro ao confirmar agendamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-20 pb-32 md:pb-16 min-h-screen px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="font-heading text-2xl md:text-3xl font-bold mb-6 text-center">{TEXT.booking.title}</h1>

                {/* Stepper */}
                <StepperHeader step={store.step} />

                {/* Step Content */}
                <div className="mt-8 overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={store.step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                            {store.step === 0 && <StepBarber />}
                            {store.step === 1 && <StepServices />}
                            {store.step === 2 && <StepDate />}
                            {store.step === 3 && <StepTime />}
                            {store.step === 4 && <StepInfo />}
                            {store.step === 5 && <StepConfirmation />}
                            {store.step === 6 && <StepSuccess />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur-xl border-t border-border p-4 pb-safe md:static md:bg-transparent md:border-0 md:mt-8 z-30">
                    <div className="max-w-2xl mx-auto flex gap-3">
                        {store.step > 0 && store.step < 6 && (
                            <button
                                onClick={goPrev}
                                disabled={store.step === 6}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-text-secondary hover:bg-white/5 transition text-sm font-medium disabled:hidden"
                            >
                                <ChevronLeft size={16} />
                                {TEXT.booking.prev}
                            </button>
                        )}
                        {store.step < 4 && (
                            <button
                                onClick={goNext}
                                disabled={!canNext()}
                                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-bg-primary font-semibold py-3 rounded-xl transition text-sm"
                            >
                                {TEXT.booking.next}
                                <ChevronRight size={16} />
                            </button>
                        )}
                        {store.step === 4 && (
                            <button
                                onClick={goNext}
                                disabled={!canNext()}
                                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-bg-primary font-semibold py-3 rounded-xl transition text-sm"
                            >
                                Revisar agendamento
                                <ChevronRight size={16} />
                            </button>
                        )}
                        {store.step === 5 && (
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-bg-primary font-semibold py-3 rounded-xl transition text-sm"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        {TEXT.booking.confirm}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ====================== STEPPER HEADER ====================== */
function StepperHeader({ step }: { step: number }) {
    return (
        <>
            {/* Desktop stepper */}
            <div className="hidden md:flex items-center justify-between max-w-lg mx-auto">
                {STEPS.map((label, i) => (
                    <div key={i} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step
                                    ? 'bg-accent text-bg-primary'
                                    : i === step
                                        ? 'bg-accent text-bg-primary ring-4 ring-accent/20'
                                        : 'bg-bg-input text-text-disabled'
                                    }`}
                            >
                                {i < step ? <Check size={14} /> : i + 1}
                            </div>
                            <span className={`text-[10px] mt-1 ${i <= step ? 'text-accent' : 'text-text-disabled'}`}>
                                {label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`w-8 h-0.5 mx-1 mt-[-12px] ${i < step ? 'bg-accent' : 'bg-border'}`} />
                        )}
                    </div>
                ))}
            </div>
            {/* Mobile stepper */}
            <div className="md:hidden text-center">
                <span className="text-sm text-text-secondary">
                    Etapa {step + 1} de {STEPS.length}
                </span>
                <span className="mx-2 text-text-disabled">•</span>
                <span className="text-sm font-medium text-accent">{STEPS[step]}</span>
                <div className="mt-3 h-1 bg-border rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-accent rounded-full"
                        animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>
        </>
    );
}

/* ====================== STEP 1: BARBER ====================== */
function StepBarber() {
    const { barberId, setBarber } = useBookingStore();
    const [barbers, setBarbers] = useState<Barber[]>([]);
    
    useEffect(() => {
        getBarbers().then(setBarbers);
    }, []);

    return (
        <div className="grid gap-4">
            {barbers.map((b) => {
                const selected = barberId === b.id;
                return (
                    <button
                        key={b.id}
                        onClick={() => setBarber(b.id, b.name)}
                        className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${selected ? 'border-accent bg-accent/5' : 'border-border bg-bg-card hover:border-accent/30'
                            }`}
                    >
                        <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {b.profilePicture ? (
                                <img src={b.profilePicture} alt={b.name} className="w-full h-full object-cover" />
                            ) : (
                                <img src="/logo.png" alt={b.name} className="w-full h-full object-cover p-2" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold">{b.name}</h3>
                            <p className="text-sm text-accent">{b.specialty}</p>
                            <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} size={12} className="text-accent fill-accent" />
                                ))}
                                <span className="text-xs text-text-secondary ml-1 font-mono">5.0</span>
                            </div>
                        </div>
                        {selected && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-7 h-7 rounded-full bg-accent flex items-center justify-center"
                            >
                                <Check size={14} className="text-bg-primary" />
                            </motion.div>
                        )}
                    </button>
                );
            })}

            {/* No preference */}
            <button
                onClick={() => setBarber(-1, TEXT.booking.noPreference)}
                className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${barberId === -1 ? 'border-accent bg-accent/5' : 'border-border bg-bg-card hover:border-accent/30'
                    }`}
            >
                <div className="w-14 h-14 rounded-full bg-bg-input flex items-center justify-center text-text-secondary flex-shrink-0">
                    <Dices size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold">{TEXT.booking.noPreference}</h3>
                    <p className="text-sm text-text-secondary">Deixe-nos escolher o melhor profissional disponível</p>
                </div>
                {barberId === -1 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                        <Check size={14} className="text-bg-primary" />
                    </motion.div>
                )}
            </button>
        </div>
    );
}

/* ====================== STEP 2: SERVICES ====================== */
function StepServices() {
    const { services: selectedServices, toggleService, totalDuration, totalPrice, barberId } = useBookingStore();
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getServices(barberId === -1 ? undefined : barberId || undefined)
            .then((list) => {
                setAllServices(list);
                // Remove serviços selecionados que não existem para o barbeiro atual
                const validIds = new Set(list.map((s) => s.id));
                const currentSelected = useBookingStore.getState().services;
                const hasInvalid = currentSelected.some((sv) => !validIds.has(sv.id));
                if (hasInvalid) {
                    useBookingStore.setState({ services: [] });
                }
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barberId]);

    const formatPrice = (price: number) => price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (!loading && allServices.length === 0) {
        return (
            <div className="p-6 rounded-2xl border-2 border-border bg-bg-card text-center">
                <p className="text-sm text-text-secondary">
                    O barbeiro selecionado não possui serviços disponíveis. Volte e escolha outro barbeiro.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid gap-3 mb-24 md:mb-0">
                {allServices.map((s) => {
                    const selected = selectedServices.some((sv) => sv.id === s.id);
                    return (
                        <button
                            key={s.id}
                            onClick={() => toggleService(s)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selected ? 'border-accent bg-accent/5' : 'border-border bg-bg-card hover:border-accent/30'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-accent/20 text-accent' : 'bg-bg-input text-text-secondary'
                                }`}>
                                {SERVICE_ICONS[s.icon || 'scissors'] ?? <Scissors size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm">{s.name}</h3>
                                <span className="text-xs text-text-secondary"><Clock size={10} className="inline mr-1" />{s.durationMinutes}min</span>
                            </div>
                            <span className="font-mono font-semibold text-sm text-accent">{formatPrice(s.price)}</span>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${selected ? 'bg-accent border-accent' : 'border-border'
                                }`}>
                                {selected && <Check size={12} className="text-bg-primary" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Summary bar */}
            <div className="fixed bottom-20 left-0 right-0 px-4 mb-safe md:static md:mt-6 z-20">
                <div className="max-w-2xl mx-auto bg-bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
                    {selectedServices.length > 0 ? (
                        <>
                            <span className="text-sm text-text-secondary">
                                {selectedServices.length} serviço{selectedServices.length > 1 ? 's' : ''} • {totalDuration()}min
                            </span>
                            <motion.span
                                key={totalPrice()}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className="font-mono font-bold text-accent"
                            >
                                {formatPrice(totalPrice())}
                            </motion.span>
                        </>
                    ) : (
                        <span className="text-sm text-text-disabled">{TEXT.booking.selectService}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ====================== STEP 3: DATE ====================== */
function StepDate() {
    const { barberId, date, setDate } = useBookingStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [daysOff, setDaysOff] = useState<string[]>([]);
    const [workDays, setWorkDays] = useState<number[]>([]); // days of week barber works (JS: 0=Sun..6=Sat)
    const [loadingAvail, setLoadingAvail] = useState(true);
    const today = startOfDay(new Date());

    useEffect(() => {
        if (!barberId || barberId === -1) return;
        setLoadingAvail(true);

        Promise.all([
            apiClient.get<any[]>(`/clients/barbers/${barberId}/date-off`).then(res => res.data).catch(() => []),
            getBarberAvailability(barberId),
        ]).then(([daysOffData, availability]) => {
            const normalizedDaysOff = daysOffData.map((d: any) => {
                if (Array.isArray(d) && d.length >= 3) {
                    return `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`;
                }
                return String(d);
            });
            setDaysOff(normalizedDaysOff);
            // Convert BE dayOfWeek (1=Mon..7=Sun) to JS dayOfWeek (0=Sun..6=Sat)
            const activeDays = availability.map(a => a.dayOfWeek === 7 ? 0 : a.dayOfWeek);
            setWorkDays(activeDays);
            setLoadingAvail(false);
        });
    }, [barberId]);

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const firstDayOffset = getDay(startOfMonth(currentMonth));

    const formatDateStr = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const isUnavailable = (d: Date) => {
        if (isBefore(d, today)) return true;

        // Limite de 30 dias a partir de hoje
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 30);
        if (d > maxDate) return true;

        const dateStr = formatDateStr(d);
        if (daysOff.includes(dateStr)) return true;
        // Disable days the barber doesn't work
        if (workDays.length > 0 && !workDays.includes(getDay(d))) return true;
        return false;
    };

    const handlePrevMonth = () => {
        const prev = subMonths(currentMonth, 1);
        if (!isBefore(endOfMonth(prev), today)) setCurrentMonth(prev);
    };

    const handleNextMonth = () => {
        const next = addMonths(currentMonth, 1);
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 30);

        // Bloqueia navegação de meses além do mês da data máxima permitida
        if (next.getFullYear() > maxDate.getFullYear()) return;
        if (next.getFullYear() === maxDate.getFullYear() && next.getMonth() > maxDate.getMonth()) return;

        setCurrentMonth(next);
    };

    const selectedDate = date ? new Date(date + 'T12:00:00') : null;

    return (
        <div className="bg-bg-card border border-border rounded-2xl p-4 md:p-6 max-w-md mx-auto">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-lg hover:bg-white/10 transition text-text-secondary"
                    aria-label="Mês anterior"
                >
                    <ChevronLeft size={20} />
                </button>
                <h3 className="font-heading font-semibold capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </h3>
                <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-lg hover:bg-white/10 transition text-text-secondary"
                    aria-label="Próximo mês"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-text-secondary py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {daysInMonth.map((d) => {
                    const unavailable = isUnavailable(d);
                    const todayMark = isToday(d);
                    const selected = selectedDate ? isSameDay(d, selectedDate) : false;

                    return (
                        <button
                            key={d.toISOString()}
                            disabled={unavailable}
                            onClick={() => setDate(formatDateStr(d))}
                            className={`h-10 rounded-xl text-sm font-medium transition-all ${selected
                                ? 'bg-accent text-bg-primary font-bold'
                                : unavailable
                                    ? 'opacity-30 cursor-not-allowed text-text-disabled'
                                    : 'hover:bg-accent/10 text-text-primary'
                                } ${todayMark && !selected ? 'ring-2 ring-accent/40 ring-dashed' : ''}`}
                        >
                            {d.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ====================== OTHER BARBER SLOTS MODAL ====================== */
function OtherBarberSlotsModal({
    barber,
    slots,
    loading,
    onSelectSlot,
    onClose,
    getPeriod,
    periodLabels,
}: {
    barber: Barber;
    slots: TimeSlot[];
    loading: boolean;
    onSelectSlot: (slotTime: string) => void;
    onClose: () => void;
    getPeriod: (t: string) => string;
    periodLabels: Record<string, { icon: React.ReactNode; label: string }>;
}) {
    const grouped = slots.reduce<Record<string, TimeSlot[]>>((acc, s) => {
        const p = getPeriod(s.time);
        if (!acc[p]) acc[p] = [];
        acc[p].push(s);
        return acc;
    }, {});

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {barber.profilePicture ? (
                                <img src={barber.profilePicture} alt={barber.name} className="w-full h-full object-cover" />
                            ) : (
                                <img src="/logo.png" alt={barber.name} className="w-full h-full object-cover p-1" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-heading font-semibold text-base">Horários de {barber.name}</h3>
                            <p className="text-xs text-text-secondary">Selecione um horário para agendar</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition text-text-secondary"
                    >
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="skeleton h-11 rounded-xl" />
                        ))}
                    </div>
                ) : slots.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar size={40} className="text-text-disabled mx-auto mb-3" />
                        <p className="text-text-secondary text-sm">
                            Nenhum horário disponível com {barber.name} nesta data.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {Object.entries(grouped).map(([period, periodSlots]) => (
                            <div key={period}>
                                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-text-secondary">
                                    {periodLabels[period]?.icon}
                                    {periodLabels[period]?.label}
                                </div>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                    {periodSlots.map((slot) => (
                                        <button
                                            key={slot.time}
                                            disabled={!slot.available}
                                            onClick={() => onSelectSlot(slot.time)}
                                            className={`py-2.5 rounded-xl text-sm font-mono font-medium transition-all ${
                                                slot.available
                                                    ? 'bg-bg-input text-text-primary hover:bg-accent hover:text-bg-primary hover:scale-[1.03] hover:shadow-lg hover:shadow-accent/20'
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

                {/* Info note */}
                <p className="text-xs text-text-disabled text-center mt-5">
                    Ao selecionar um horário, o agendamento será feito com {barber.name}
                </p>
            </motion.div>
        </motion.div>
    );
}

/* ====================== STEP 4: TIME ====================== */
function StepTime() {
    const store = useBookingStore();
    const { barberId, barberName, date, time, setTime, services } = store;
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [allBarbers, setAllBarbers] = useState<Barber[]>([]);
    const [showOtherBarberSlots, setShowOtherBarberSlots] = useState(false);
    const [otherBarberSlots, setOtherBarberSlots] = useState<TimeSlot[]>([]);
    const [loadingOtherSlots, setLoadingOtherSlots] = useState(false);
    const [selectedOtherBarber, setSelectedOtherBarber] = useState<Barber | null>(null);

    // Fetch all barbers to suggest alternatives
    useEffect(() => {
        getBarbers().then(setAllBarbers);
    }, []);

    useEffect(() => {
        if (!date || !barberId || services.length === 0) return;
        setLoadingSlots(true);

        if (barberId === -1) {
            // "Sem preferência": escolhe o barbeiro com mais horários disponíveis
            // que ofereça serviços equivalentes (mesmos nomes) aos selecionados.
            (async () => {
                const selectedNames = services.map(s => s.name.trim().toLowerCase());
                const barbers = await getBarbers();
                let best: { barberId: number; barberName: string; matchedServices: Service[]; slots: TimeSlot[] } | null = null;

                for (const b of barbers) {
                    const barberSvcs = await getServices(b.id).catch(() => [] as Service[]);
                    const matched: Service[] = [];
                    for (const name of selectedNames) {
                        const found = barberSvcs.find(bs => bs.name.trim().toLowerCase() === name && bs.active);
                        if (found) matched.push(found);
                    }
                    if (matched.length !== selectedNames.length) continue;
                    const matchedIds = matched.map(m => m.id);
                    const barberSlots = await getTimeSlots(b.id, date, matchedIds).catch(() => [] as TimeSlot[]);
                    if (!best || barberSlots.length > best.slots.length) {
                        best = { barberId: b.id, barberName: b.name, matchedServices: matched, slots: barberSlots };
                    }
                }

                if (best) {
                    // Troca para o barbeiro vencedor e ajusta os serviços selecionados
                    // para os equivalentes deste barbeiro (mesmos nomes, IDs diferentes).
                    // O efeito irá re-rodar com o novo barberId e carregar os slots normalmente.
                    useBookingStore.setState({
                        barberId: best.barberId,
                        barberName: best.barberName,
                        services: best.matchedServices,
                    });
                } else {
                    setSlots([]);
                    setLoadingSlots(false);
                }
            })();
            return;
        }

        const serviceIds = services.map(s => s.id);
        getTimeSlots(barberId, date, serviceIds).then((s) => {
            setSlots(s);
            setLoadingSlots(false);
        });
    }, [barberId, date, services]);

    // Get other barbers (not the currently selected one)
    const otherBarbers = allBarbers.filter(b => b.id !== barberId && barberId !== -1);

    const handleSeeOtherBarber = async (barber: Barber) => {
        if (!date || services.length === 0) return;
        setSelectedOtherBarber(barber);
        setShowOtherBarberSlots(true);
        setLoadingOtherSlots(true);
        const serviceIds = services.map(s => s.id);
        try {
            const otherSlots = await getTimeSlots(barber.id, date, serviceIds);
            setOtherBarberSlots(otherSlots);
        } catch {
            setOtherBarberSlots([]);
        }
        setLoadingOtherSlots(false);
    };

    const handleSelectOtherBarberSlot = (barber: Barber, slotTime: string) => {
        // Switch to the other barber and select the time
        store.setBarber(barber.id, barber.name);
        store.setTime(slotTime);
        setShowOtherBarberSlots(false);
    };

    const handleGoToAnotherDay = () => {
        store.setStep(2);
    };

    const getPeriod = (t: string) => {
        const h = parseInt(t.split(':')[0], 10);
        if (h < 12) return 'morning';
        if (h < 18) return 'afternoon';
        return 'evening';
    };

    const periodLabels: Record<string, { icon: React.ReactNode; label: string }> = {
        morning: { icon: <Sun size={16} />, label: 'Manhã' },
        afternoon: { icon: <CloudSun size={16} />, label: 'Tarde' },
        evening: { icon: <Moon size={16} />, label: 'Noite' },
    };

    if (loadingSlots) {
        return (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="text-center py-12">
                <Calendar size={48} className="text-text-disabled mx-auto mb-4" />
                <p className="text-text-secondary">{TEXT.booking.noSlots}</p>

                {/* Suggestions even when no slots */}
                <div className="mt-8 space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-bg-card">
                        <span className="text-sm text-text-primary font-medium">
                            Seu horário não está aparecendo?
                        </span>
                        <button
                            onClick={handleGoToAnotherDay}
                            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-bg-primary text-sm font-semibold rounded-xl transition whitespace-nowrap"
                        >
                            Agendar outro dia
                        </button>
                    </div>

                    {otherBarbers.map((otherBarber) => (
                        <div key={otherBarber.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-dashed border-border bg-bg-card">
                            <span className="text-sm text-text-primary">
                                Horários disponíveis de{' '}
                                <span className="font-semibold text-accent">{otherBarber.name}</span>
                            </span>
                            <button
                                onClick={() => handleSeeOtherBarber(otherBarber)}
                                className="px-5 py-2.5 border-2 border-dashed border-text-secondary/30 text-text-secondary text-sm font-medium rounded-xl hover:border-accent hover:text-accent transition whitespace-nowrap"
                            >
                                Ver
                            </button>
                        </div>
                    ))}
                </div>

                {/* Other barber slots modal */}
                <AnimatePresence>
                    {showOtherBarberSlots && selectedOtherBarber && (
                        <OtherBarberSlotsModal
                            barber={selectedOtherBarber}
                            slots={otherBarberSlots}
                            loading={loadingOtherSlots}
                            onSelectSlot={(slotTime) => handleSelectOtherBarberSlot(selectedOtherBarber, slotTime)}
                            onClose={() => setShowOtherBarberSlots(false)}
                            getPeriod={getPeriod}
                            periodLabels={periodLabels}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    const grouped = slots.reduce<Record<string, TimeSlot[]>>((acc, s) => {
        const p = getPeriod(s.time);
        if (!acc[p]) acc[p] = [];
        acc[p].push(s);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([period, periodSlots]) => (
                <div key={period}>
                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-text-secondary">
                        {periodLabels[period]?.icon}
                        {periodLabels[period]?.label}
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {periodSlots.map((slot) => (
                            <button
                                key={slot.time}
                                disabled={!slot.available}
                                onClick={() => setTime(slot.time)}
                                title={!slot.available ? 'Horário indisponível' : undefined}
                                className={`py-2.5 rounded-xl text-sm font-mono font-medium transition-all ${time === slot.time
                                    ? 'bg-accent text-bg-primary scale-[1.03] shadow-lg shadow-accent/20'
                                    : slot.available
                                        ? 'bg-bg-input text-text-primary hover:bg-accent/10 hover:text-accent'
                                        : 'bg-bg-card text-text-disabled line-through cursor-not-allowed opacity-50'
                                    }`}
                            >
                                {slot.time}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Suggestion section */}
            <div className="mt-4 pt-6 border-t border-border space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-bg-card">
                    <span className="text-sm text-text-primary font-medium">
                        Seu horário não está aparecendo?
                    </span>
                    <button
                        onClick={handleGoToAnotherDay}
                        className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-bg-primary text-sm font-semibold rounded-xl transition whitespace-nowrap"
                    >
                        Agendar outro dia
                    </button>
                </div>

                {otherBarbers.map((otherBarber) => (
                    <div key={otherBarber.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-dashed border-border bg-bg-card">
                        <span className="text-sm text-text-primary">
                            Horários disponíveis de{' '}
                            <span className="font-semibold text-accent">{otherBarber.name}</span>
                        </span>
                        <button
                            onClick={() => handleSeeOtherBarber(otherBarber)}
                            className="px-5 py-2.5 border-2 border-dashed border-text-secondary/30 text-text-secondary text-sm font-medium rounded-xl hover:border-accent hover:text-accent transition whitespace-nowrap"
                        >
                            Ver
                        </button>
                    </div>
                ))}
            </div>

            {/* Other barber slots modal */}
            <AnimatePresence>
                {showOtherBarberSlots && selectedOtherBarber && (
                    <OtherBarberSlotsModal
                        barber={selectedOtherBarber}
                        slots={otherBarberSlots}
                        loading={loadingOtherSlots}
                        onSelectSlot={(slotTime) => handleSelectOtherBarberSlot(selectedOtherBarber, slotTime)}
                        onClose={() => setShowOtherBarberSlots(false)}
                        getPeriod={getPeriod}
                        periodLabels={periodLabels}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

/* ====================== STEP 5: INFO ====================== */
function StepInfo() {
    const store = useBookingStore();
    const { isAuthenticated, user } = useAuthStore();
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [cpfError, setCpfError] = useState('');

    const hasRegisteredPhone = isAuthenticated && !!user?.phone;

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 2) return `(${digits}`;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    };

    const handleNameChange = (val: string) => {
        store.setClientName(val);
        if (val.length > 0 && val.length < 3) setNameError('Nome deve ter pelo menos 3 caracteres');
        else if (val && !/^[a-zA-ZÀ-ÿ\s]+$/.test(val)) setNameError('Nome deve conter apenas letras');
        else setNameError('');
    };

    const handlePhoneChange = (val: string) => {
        const formatted = formatPhone(val);
        store.setClientPhone(formatted);
        const digits = formatted.replace(/\D/g, '');
        if (digits.length > 0 && digits.length < 11) setPhoneError('Telefone deve ter 11 dígitos');
        else setPhoneError('');
    };

    const hasRegisteredCpf = isAuthenticated && !!user?.cpf;

    const formatCpf = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleCpfChange = (val: string) => {
        const formatted = formatCpf(val);
        store.setClientCpf(formatted);
        const digits = formatted.replace(/\D/g, '');
        if (digits.length > 0 && digits.length < 11) setCpfError('CPF inválido');
        else setCpfError('');
    };

    return (
        <div className="space-y-5 max-w-md mx-auto">
            <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <User size={16} className="text-accent" />
                    Nome completo
                </label>
                <input
                    type="text"
                    value={store.clientName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Seu nome completo"
                    className={`w-full bg-bg-input input-surface border rounded-xl px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none ${nameError ? 'border-error' : 'border-border'
                        }`}
                    aria-invalid={!!nameError}
                    aria-describedby={nameError ? 'name-error' : undefined}
                />
                {nameError && <p id="name-error" className="text-error text-xs mt-1">{nameError}</p>}
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <CreditCard size={16} className="text-accent" />
                    CPF
                </label>
                <input
                    type="text"
                    value={store.clientCpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    disabled={hasRegisteredCpf}
                    placeholder="000.000.000-00"
                    className={`w-full bg-bg-input input-surface border rounded-xl px-4 py-3 text-sm font-mono focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none disabled:opacity-60 disabled:cursor-not-allowed ${cpfError ? 'border-error' : 'border-border'
                        }`}
                    aria-invalid={!!cpfError}
                    aria-describedby={cpfError ? 'cpf-error' : undefined}
                />
                {cpfError && <p id="cpf-error" className="text-error text-xs mt-1">{cpfError}</p>}
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Phone size={16} className="text-accent" />
                    Telefone celular
                </label>
                <input
                    type="tel"
                    value={store.clientPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={hasRegisteredPhone}
                    placeholder="(11) 99999-9999"
                    className={`w-full bg-bg-input input-surface border rounded-xl px-4 py-3 text-sm font-mono focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none disabled:opacity-60 disabled:cursor-not-allowed ${phoneError ? 'border-error' : 'border-border'
                        }`}
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? 'phone-error' : undefined}
                />
                {phoneError && <p id="phone-error" className="text-error text-xs mt-1">{phoneError}</p>}
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <FileText size={16} className="text-accent" />
                    Observações
                    <span className="text-text-disabled text-xs ml-auto">{store.notes.length}/200</span>
                </label>
                <textarea
                    value={store.notes}
                    onChange={(e) => store.setNotes(e.target.value.slice(0, 200))}
                    placeholder="Ex: quero o degradê mais baixo"
                    rows={3}
                    className="w-full bg-bg-input input-surface border border-border rounded-xl px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none resize-none"
                />
            </div>
        </div>
    );
}

/* ====================== STEP 6: CONFIRMATION ====================== */
function StepConfirmation() {
    const store = useBookingStore();
    const formatPrice = (price: number) => price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const formatDisplayDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <div className="card-premium p-4 md:p-8 max-w-md mx-auto">
            <h3 className="font-heading font-semibold text-lg text-center mb-4">Resumo do Agendamento</h3>

            <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-text-secondary">Barbeiro</span>
                    <span className="text-sm font-medium">{store.barberName}</span>
                </div>
                <div className="py-2 border-b border-border">
                    <span className="text-sm text-text-secondary block mb-1">Serviços</span>
                    {store.services.map((s) => (
                        <div key={s.id} className="flex justify-between text-sm">
                            <span>{s.name}</span>
                            <span className="font-mono text-accent">{formatPrice(s.price)}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-text-secondary">Data</span>
                    <span className="text-sm font-mono">{store.date ? formatDisplayDate(store.date) : ''}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-text-secondary">Horário</span>
                    <span className="text-sm font-mono">{store.time}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-text-secondary">Duração total</span>
                    <span className="text-sm">{store.totalDuration()}min</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-text-secondary">Cliente</span>
                    <span className="text-sm">{store.clientName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-text-secondary">CPF</span>
                    <span className="text-sm font-mono">{store.clientCpf}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-text-secondary">Telefone</span>
                    <span className="text-sm font-mono">{store.clientPhone}</span>
                </div>
                {store.notes && (
                    <div className="py-2 border-b border-border">
                        <span className="text-sm text-text-secondary block mb-1">Observações</span>
                        <span className="text-sm">{store.notes}</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Total</span>
                <span className="font-mono font-bold text-lg text-accent">{formatPrice(store.totalPrice())}</span>
            </div>
        </div>
    );
}
