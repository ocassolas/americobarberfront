import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useToastStore } from '@/stores/useToastStore';

interface ClientRescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { newDate: string; newStartTime: string; observation: string }) => Promise<void>;
    appointmentDate: string;
    appointmentTime: string;
    services: string[];
}

export function ClientRescheduleModal({
    isOpen,
    onClose,
    onConfirm,
    appointmentDate,
    appointmentTime,
    services
}: ClientRescheduleModalProps) {
    const [date, setDate] = useState(appointmentDate);
    const [time, setTime] = useState(appointmentTime);
    const [observation, setObservation] = useState('');
    const [loading, setLoading] = useState(false);
    const addToast = useToastStore((s) => s.addToast);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onConfirm({
                newDate: date,
                newStartTime: time,
                observation
            });
            addToast('success', 'Agendamento reagendado com sucesso!');
            onClose();
        } catch (error) {
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
                        className="bg-bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl"
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
                                        min={format(new Date(), 'yyyy-MM-dd')}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-bg-input border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:border-accent outline-none transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5 ml-1">Novo Horário</label>
                                <div className="relative">
                                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent" size={18} />
                                    <input
                                        type="time"
                                        required
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full bg-bg-input border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:border-accent outline-none transition"
                                    />
                                </div>
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
                                    disabled={loading}
                                    className="flex-1 py-3.5 rounded-2xl bg-accent text-bg-primary text-sm font-bold hover:bg-accent-hover transition disabled:opacity-50"
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
