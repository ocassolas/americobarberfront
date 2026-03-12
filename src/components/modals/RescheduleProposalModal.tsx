import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MessageSquare, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToastStore } from '@/stores/useToastStore';

interface RescheduleProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { proposedDate: string; proposedStartTime: string; barberMessage: string }) => Promise<void>;
    appointmentDate: string;
    appointmentTime: string;
    clientName: string;
}

export function RescheduleProposalModal({
    isOpen,
    onClose,
    onConfirm,
    appointmentDate,
    appointmentTime,
    clientName
}: RescheduleProposalModalProps) {
    const [date, setDate] = useState(appointmentDate);
    const [time, setTime] = useState(appointmentTime);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const addToast = useToastStore((s) => s.addToast);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onConfirm({
                proposedDate: date,
                proposedStartTime: time,
                barberMessage: message
            });
            addToast('success', 'Proposta enviada com sucesso!');
            onClose();
        } catch (error) {
            addToast('error', 'Erro ao enviar proposta.');
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
                            <h3 className="font-heading font-bold text-xl">Propor Reagendamento</h3>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition">
                                <X size={20} className="text-text-secondary" />
                            </button>
                        </div>

                        <div className="bg-accent/5 rounded-2xl p-4 mb-6 border border-accent/10">
                            <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Agendamento Atual</p>
                            <p className="text-sm font-medium">{clientName}</p>
                            <p className="text-sm font-mono text-accent">{appointmentDate} às {appointmentTime}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5 ml-1">Nova Data</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent" size={18} />
                                    <input
                                        type="date"
                                        required
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
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5 ml-1">Mensagem para o Cliente</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3.5 top-3.5 text-accent" size={18} />
                                    <textarea
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Ex: Tivemos um imprevisto, pode ser nesse horário?"
                                        rows={3}
                                        className="w-full bg-bg-input border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:border-accent outline-none transition resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3.5 rounded-2xl border border-border text-sm font-bold hover:bg-white/5 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3.5 rounded-2xl bg-accent text-bg-primary text-sm font-bold hover:bg-accent-hover transition disabled:opacity-50"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Proposta'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
