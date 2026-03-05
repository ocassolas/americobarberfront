import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Search, Calendar, Clock, Scissors, XCircle, AlertTriangle } from 'lucide-react';
import { getAppointmentsByPhone, cancelAppointment } from '@/services/api';
import { useToastStore } from '@/stores/useToastStore';
import { TEXT } from '@/config/constants';
import type { Appointment } from '@/types';

const STATUS_MAP = {
    confirmed: { label: 'Confirmado', color: 'bg-success/15 text-success' },
    completed: { label: 'Concluído', color: 'bg-info/15 text-info' },
    cancelled: { label: 'Cancelado', color: 'bg-error/15 text-error' },
} as const;

export function MyAppointmentsPage() {
    const [phone, setPhone] = useState('');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cancelId, setCancelId] = useState<string | null>(null);
    const addToast = useToastStore((s) => s.addToast);

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 2) return `(${digits}`;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    };

    const handleSearch = async () => {
        setLoading(true);
        const results = await getAppointmentsByPhone(phone);
        setAppointments(results);
        setSearched(true);
        setLoading(false);
    };

    const handleCancel = async (id: string) => {
        await cancelAppointment(id);
        setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'cancelled' as const } : a));
        setCancelId(null);
        addToast('success', TEXT.myAppointments.cancelled);
    };

    const formatDate = (d: string) => {
        const [y, m, day] = d.split('-');
        return `${day}/${m}/${y}`;
    };

    const formatPrice = (p: number) => p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="pt-20 pb-8 min-h-screen px-4">
            <div className="max-w-lg mx-auto">
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-center mb-2">{TEXT.myAppointments.title}</h1>
                <p className="text-text-secondary text-sm text-center mb-8">{TEXT.myAppointments.subtitle}</p>

                {/* Search form */}
                <div className="flex gap-2 mb-8">
                    <div className="flex-1 relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(formatPhone(e.target.value))}
                            placeholder="(11) 99999-9999"
                            className="w-full bg-bg-input input-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm font-mono focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={phone.replace(/\D/g, '').length < 11}
                        className="px-5 py-3 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-bg-primary font-semibold rounded-xl transition flex items-center gap-2 text-sm"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                        ) : (
                            <Search size={16} />
                        )}
                        {TEXT.myAppointments.search}
                    </button>
                </div>

                {/* Results */}
                {loading && (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="skeleton h-28 rounded-2xl" />
                        ))}
                    </div>
                )}

                {!loading && searched && appointments.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar size={48} className="text-text-disabled mx-auto mb-4" />
                        <p className="text-text-secondary">{TEXT.myAppointments.empty}</p>
                    </div>
                )}

                {!loading && (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {appointments.map((apt) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="card-premium p-4"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar size={14} className="text-accent" />
                                                <span className="text-sm font-mono">{formatDate(apt.date)}</span>
                                                <Clock size={14} className="text-accent ml-2" />
                                                <span className="text-sm font-mono">{apt.time}</span>
                                            </div>
                                            <p className="text-sm text-text-secondary">{apt.barberName}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_MAP[apt.status].color}`}>
                                            {STATUS_MAP[apt.status].label}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap mb-3">
                                        {apt.services.map((s) => (
                                            <span key={s.id} className="px-2 py-0.5 bg-bg-input rounded-lg text-xs text-text-secondary">
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="font-mono font-semibold text-accent">{formatPrice(apt.totalPrice)}</span>
                                        {apt.status === 'confirmed' && (
                                            <button
                                                onClick={() => setCancelId(apt.id)}
                                                className="text-xs text-error hover:text-error/80 transition flex items-center gap-1"
                                            >
                                                <XCircle size={14} />
                                                {TEXT.myAppointments.cancel}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Cancel confirmation dialog */}
                <AnimatePresence>
                    {cancelId && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                            onClick={() => setCancelId(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-bg-card border border-border rounded-2xl p-6 max-w-sm w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center mb-4">
                                    <AlertTriangle size={40} className="text-warning mx-auto mb-3" />
                                    <h3 className="font-heading font-semibold text-lg">{TEXT.myAppointments.cancel}</h3>
                                    <p className="text-text-secondary text-sm mt-1">{TEXT.myAppointments.cancelConfirm}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setCancelId(null)}
                                        className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-white/5 transition"
                                    >
                                        Não
                                    </button>
                                    <button
                                        onClick={() => cancelId && handleCancel(cancelId)}
                                        className="flex-1 py-2.5 rounded-xl bg-error text-white text-sm font-medium hover:bg-error/90 transition"
                                    >
                                        Sim, cancelar
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
