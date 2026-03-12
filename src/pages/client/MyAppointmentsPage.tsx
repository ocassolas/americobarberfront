import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Search, Calendar, Clock, Scissors, XCircle, AlertTriangle, User, CheckCircle2, X, History } from 'lucide-react';
import { getAppointments, cancelAppointment, acceptProposal, rejectProposal, rescheduleAppointment } from '@/services/api';
import { useToastStore } from '@/stores/useToastStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { TEXT } from '@/config/constants';
import type { Appointment } from '@/types';
import { ClientRescheduleModal } from '@/components/modals/ClientRescheduleModal';

const STATUS_MAP = {
    AGENDADO: { label: 'Confirmado', color: 'bg-success/15 text-success' },
    CONCLUIDO: { label: 'Concluído', color: 'bg-info/15 text-info' },
    FINALIZADO: { label: 'Finalizado', color: 'bg-success/15 text-success' },
    CANCELADO_POR_CLIENTE: { label: 'Cancelado', color: 'bg-error/15 text-error' },
    CANCELADO_POR_BARBEIRO: { label: 'Cancelado (Barbearia)', color: 'bg-error/15 text-error' },
    PROPOSTA_REAGENDAMENTO: { label: 'Pendência de Reagendamento', color: 'bg-warning/15 text-warning' }
} as const;

export function MyAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelId, setCancelId] = useState<number | null>(null);
    const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const addToast = useToastStore((s) => s.addToast);
    const { user } = useAuthStore();

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const results = await getAppointments();
            setAppointments(results);
        } catch (err) {
            console.error(err);
            addToast('error', 'Erro ao carregar seus agendamentos.');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleCancel = async (id: number) => {
        try {
            await cancelAppointment(id, cancelReason);
            setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'CANCELADO_POR_CLIENTE' as const, observation: cancelReason } : a));
            setCancelId(null);
            setCancelReason('');
            addToast('success', TEXT.myAppointments.cancelled);
        } catch {
            addToast('error', 'Erro ao cancelar o agendamento.');
        }
    };

    const handleAccept = async (id: number) => {
        try {
            await acceptProposal(id);
            addToast('success', 'Agendamento atualizado com sucesso!');
            fetchAppointments();
        } catch {
            addToast('error', 'Erro ao aceitar proposta.');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await rejectProposal(id);
            addToast('success', 'Proposta rejeitada (agendamento cancelado).');
            fetchAppointments();
        } catch {
            addToast('error', 'Erro ao rejeitar proposta.');
        }
    };

    const handleConfirmReschedule = async (data: any) => {
        if (!rescheduleTarget) return;
        try {
            await rescheduleAppointment(rescheduleTarget.id, data);
            fetchAppointments();
        } catch (error) {
            throw error;
        }
    };

    const formatDate = (d: string) => {
        const [y, m, day] = d.split('-');
        return `${day}/${m}/${y}`;
    };

    const formatPrice = (p: number) => p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="pt-20 pb-8 min-h-screen px-4">
            <div className="max-w-lg mx-auto">
                <header className="text-center mb-8">
                    <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">{TEXT.myAppointments.title}</h1>
                    <div className="flex items-center justify-center gap-2 text-accent">
                        <User size={16} />
                        <span className="text-sm font-medium">{user?.name}</span>
                    </div>
                </header>

                {/* Results */}
                {loading && (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="skeleton h-28 rounded-2xl" />
                        ))}
                    </div>
                )}

                {!loading && appointments.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar size={48} className="text-text-disabled mx-auto mb-4" />
                        <p className="text-text-secondary">{TEXT.myAppointments.empty}</p>
                    </div>
                )}

                {!loading && appointments.length > 0 && (
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
                                                <span className="text-sm font-mono">{String(apt.startTime.hour).padStart(2, '0')}:{String(apt.startTime.minute).padStart(2, '0')}</span>
                                            </div>
                                            <p className="text-sm text-text-secondary">{apt.barberName}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_MAP[apt.status]?.color || 'bg-border/50 text-text-secondary'}`}>
                                            {STATUS_MAP[apt.status]?.label || apt.status}
                                        </span>
                                    </div>

                                    {apt.status === 'PROPOSTA_REAGENDAMENTO' && apt.proposedDate && (
                                        <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 mb-3">
                                            <p className="text-xs font-bold text-warning uppercase mb-2">Proposta do Barbeiro</p>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar size={12} className="text-warning" />
                                                <span className="text-xs font-mono">{formatDate(apt.proposedDate)} às {String(apt.proposedStartTime?.hour).padStart(2, '0')}:{String(apt.proposedStartTime?.minute).padStart(2, '0')}</span>
                                            </div>
                                            {apt.barberMessage && (
                                                <p className="text-xs italic text-text-secondary mb-3">"{apt.barberMessage}"</p>
                                            )}
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleAccept(apt.id)}
                                                    className="flex-1 py-2 bg-success text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-success/90 transition"
                                                >
                                                    <CheckCircle2 size={12} />
                                                    Aceitar
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(apt.id)}
                                                    className="flex-1 py-2 border border-error text-error rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-error/5 transition"
                                                >
                                                    <X size={12} />
                                                    Rejeitar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 flex-wrap mb-3">
                                        {apt.services?.map((s) => (
                                            <span key={s.id} className="px-2 py-0.5 bg-bg-input rounded-lg text-xs text-accent/80 border border-accent/10">
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="font-mono font-semibold text-accent">{formatPrice(apt.totalPrice)}</span>
                                        {(apt.status === 'AGENDADO' || apt.status === 'PROPOSTA_REAGENDAMENTO') && (
                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={`https://wa.me/55${apt.barberPhone?.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-success hover:text-success/80 transition flex items-center gap-1"
                                                >
                                                    <Phone size={14} />
                                                    WhatsApp
                                                </a>
                                                {apt.status === 'AGENDADO' && (
                                                    <>
                                                        <button
                                                            onClick={() => setRescheduleTarget(apt)}
                                                            className="text-xs text-accent hover:text-accent/80 transition flex items-center gap-1"
                                                        >
                                                            <History size={14} />
                                                            Reagendar
                                                        </button>
                                                        <button
                                                            onClick={() => setCancelId(apt.id)}
                                                            className="text-xs text-error hover:text-error/80 transition flex items-center gap-1"
                                                        >
                                                            <XCircle size={14} />
                                                            {TEXT.myAppointments.cancel}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {cancelId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setCancelId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4 text-error">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="font-heading font-bold text-xl">{TEXT.myAppointments.cancel}</h3>
                                <p className="text-text-secondary text-sm mt-2">{TEXT.myAppointments.cancelConfirm}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5 ml-1">Motivo (opcional)</label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition resize-none"
                                    placeholder="Ex: Tive um imprevisto"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCancelId(null)}
                                    className="flex-1 py-3.5 rounded-2xl border border-border text-sm font-bold hover:bg-white/5 transition"
                                >
                                    Não
                                </button>
                                <button
                                    onClick={() => cancelId && handleCancel(cancelId)}
                                    className="flex-1 py-3.5 rounded-2xl bg-error text-white text-sm font-bold hover:bg-error/90 transition shadow-lg shadow-error/20"
                                >
                                    Sim, cancelar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {rescheduleTarget && (
                <ClientRescheduleModal
                    isOpen={!!rescheduleTarget}
                    onClose={() => setRescheduleTarget(null)}
                    onConfirm={handleConfirmReschedule}
                    appointmentDate={rescheduleTarget.date}
                    appointmentTime={`${String(rescheduleTarget.startTime.hour).padStart(2, '0')}:${String(rescheduleTarget.startTime.minute).padStart(2, '0')}`}
                    services={rescheduleTarget.services.map(s => s.name)}
                />
            )}
        </div>
    );
}
