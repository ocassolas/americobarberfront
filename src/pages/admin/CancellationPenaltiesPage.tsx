import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, CheckCircle2, XCircle, X, User, Calendar, Clock, Copy, Save, Maximize2,
} from 'lucide-react';
import {
    getCancellationPenalties,
    approveCancellationPenalty,
    rejectCancellationPenalty,
    getPaymentSettings,
    updatePaymentSettings,
} from '@/services/api';
import type { CancellationPenalty, PenaltyStatus } from '@/types';
import { useToastStore } from '@/stores/useToastStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatPenaltyAmount } from '@/utils/cancellationPolicy';

const STATUS_MAP: Record<PenaltyStatus, { label: string; color: string }> = {
    PENDING_PAYMENT: { label: 'Aguardando pagamento', color: 'bg-warning/15 text-warning' },
    PROOF_SUBMITTED: { label: 'Comprovante enviado', color: 'bg-info/15 text-info' },
    APPROVED: { label: 'Aprovado', color: 'bg-success/15 text-success' },
    REJECTED: { label: 'Rejeitado (bloqueado)', color: 'bg-error/15 text-error' },
};

export function CancellationPenaltiesPage() {
    const [penalties, setPenalties] = useState<CancellationPenalty[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [reviewTarget, setReviewTarget] = useState<CancellationPenalty | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [pixKey, setPixKey] = useState('');
    const [savingPixKey, setSavingPixKey] = useState(false);
    const addToast = useToastStore((s) => s.addToast);
    const lastUpdateTimestamp = useAuthStore((s) => s.lastUpdateTimestamp);
    const skipRealtimeRefresh = useRef(true);

    const fetchPixKey = useCallback(async () => {
        try {
            const settings = await getPaymentSettings();
            setPixKey(settings.pixKey);
        } catch {
            addToast('error', 'Erro ao carregar chave PIX.');
        }
    }, [addToast]);

    const fetchPenalties = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCancellationPenalties();
            setPenalties(data);
        } catch {
            addToast('error', 'Erro ao carregar comprovantes.');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchPenalties();
        fetchPixKey();
    }, [fetchPenalties, fetchPixKey]);

    useEffect(() => {
        if (skipRealtimeRefresh.current) {
            skipRealtimeRefresh.current = false;
            return;
        }
        getCancellationPenalties()
            .then(setPenalties)
            .catch(() => addToast('error', 'Erro ao atualizar comprovantes.'));
    }, [lastUpdateTimestamp, addToast]);

    const handleSavePixKey = async () => {
        if (!pixKey.trim()) {
            addToast('warning', 'Informe a chave PIX.');
            return;
        }
        setSavingPixKey(true);
        try {
            const settings = await updatePaymentSettings(pixKey.trim());
            setPixKey(settings.pixKey);
            addToast('success', 'Chave PIX atualizada!');
        } catch {
            addToast('error', 'Erro ao salvar chave PIX.');
        } finally {
            setSavingPixKey(false);
        }
    };

    const handleCopyPixKey = async () => {
        if (!pixKey) return;
        try {
            await navigator.clipboard.writeText(pixKey);
            addToast('success', 'Chave PIX copiada!');
        } catch {
            addToast('error', 'Não foi possível copiar.');
        }
    };

    const handleReview = async (action: 'approve' | 'reject') => {
        if (!reviewTarget) return;
        setActionLoading(true);
        try {
            if (action === 'approve') {
                await approveCancellationPenalty(reviewTarget.id, reviewNotes || undefined);
                addToast('success', 'Comprovante aprovado.');
            } else {
                await rejectCancellationPenalty(reviewTarget.id, reviewNotes || undefined);
                addToast('success', 'Comprovante rejeitado. Cliente bloqueado novamente.');
            }
            setReviewTarget(null);
            setReviewNotes('');
            setPreviewImage(null);
            fetchPenalties();
        } catch {
            addToast('error', 'Erro ao revisar comprovante.');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (d: string) => {
        const [y, m, day] = d.split('-');
        return `${day}/${m}/${y}`;
    };

    const formatTime = (t: string) => (t.length >= 5 ? t.substring(0, 5) : t);

    const closeReviewModal = () => {
        setReviewTarget(null);
        setReviewNotes('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 lg:p-6 max-w-6xl mx-auto"
        >
            <div className="mb-8">
                <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
                    <ShieldAlert size={24} className="text-accent" />
                    Comprovantes de Cancelamento
                </h1>
                <p className="text-text-secondary text-sm mt-1">
                    Penalidades por cancelamento com menos de 12 horas de antecedência
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-bg-card border border-border rounded-2xl p-5"
            >
                <h2 className="font-heading font-bold text-lg mb-1">Chave PIX para pagamentos</h2>
                <p className="text-text-secondary text-sm mb-4">
                    Esta chave aparece na tela de pagamento pendente dos clientes bloqueados.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder="Chave PIX (CPF, e-mail, telefone ou aleatória)"
                        className="flex-1 bg-bg-input border border-border rounded-xl px-4 py-3 text-sm font-mono focus:border-accent outline-none"
                    />
                    <button
                        onClick={handleCopyPixKey}
                        disabled={!pixKey}
                        className="px-4 py-3 rounded-xl border border-border hover:bg-white/5 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                        <Copy size={16} />
                        Copiar
                    </button>
                    <button
                        onClick={handleSavePixKey}
                        disabled={savingPixKey || !pixKey.trim()}
                        className="px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-bg-primary font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save size={16} />
                        {savingPixKey ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </motion.div>

            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                >
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton h-28 rounded-2xl" />
                    ))}
                </motion.div>
            )}

            {!loading && penalties.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-bg-card border border-border rounded-2xl"
                >
                    <ShieldAlert size={48} className="text-text-disabled mx-auto mb-4" />
                    <p className="text-text-secondary">Nenhuma penalidade registrada ainda.</p>
                </motion.div>
            )}

            {!loading && penalties.length > 0 && (
                <div className="space-y-3">
                    <AnimatePresence>
                        {penalties.map((penalty) => {
                            const statusInfo = STATUS_MAP[penalty.status];
                            return (
                                <motion.div
                                    key={penalty.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-bg-card border border-border rounded-2xl p-4 lg:p-5"
                                >
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col lg:flex-row lg:items-center gap-4"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex-1 min-w-0"
                                        >
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex items-center gap-2 flex-wrap mb-2"
                                            >
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                                <span className="font-mono font-semibold text-accent">
                                                    {formatPenaltyAmount(penalty.amount)}
                                                </span>
                                            </motion.div>

                                            <div className="flex items-center gap-2 text-sm text-text-primary mb-1">
                                                <User size={14} className="text-accent shrink-0" />
                                                <span className="truncate">{penalty.clientName}</span>
                                                <span className="text-text-secondary">· {penalty.clientEmail}</span>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    Agendamento: {formatDate(penalty.appointmentDate)} às {formatTime(penalty.appointmentStartTime)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    Penalidade: {new Date(penalty.createdAt).toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                        </motion.div>

                                        <motion.div className="flex items-center gap-2 shrink-0">
                                            {penalty.proofImage && (
                                                <button
                                                    onClick={() => {
                                                        setReviewTarget(penalty);
                                                        setReviewNotes(penalty.adminNotes || '');
                                                    }}
                                                    className="px-3 py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition"
                                                >
                                                    Revisar
                                                </button>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Fullscreen proof preview (from review modal) */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
                        onClick={() => setPreviewImage(null)}
                    >
                        <button
                            type="button"
                            className="absolute top-4 right-4 p-2 rounded-full bg-bg-card text-text-primary hover:bg-white/10 transition"
                            onClick={() => setPreviewImage(null)}
                            aria-label="Fechar visualização"
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={previewImage}
                            alt="Comprovante em tela cheia"
                            className="max-w-full max-h-[90vh] rounded-xl object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Review modal */}
            <AnimatePresence>
                {reviewTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={closeReviewModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={closeReviewModal}
                                className="absolute top-4 right-4 p-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/10 transition"
                                aria-label="Fechar"
                            >
                                <X size={18} />
                            </button>

                            <h3 className="font-heading font-bold text-lg mb-1 pr-8">Revisar comprovante</h3>
                            <p className="text-text-secondary text-sm mb-4">{reviewTarget.clientName}</p>

                            {reviewTarget.proofImage && (
                                <div className="relative mb-4 rounded-xl border border-border overflow-hidden bg-bg-input">
                                    <img
                                        src={reviewTarget.proofImage}
                                        alt="Comprovante"
                                        className="w-full max-h-48 object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPreviewImage(reviewTarget.proofImage!)}
                                        className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 text-white hover:bg-black/80 transition"
                                        aria-label="Ver em tela cheia"
                                    >
                                        <Maximize2 size={16} />
                                    </button>
                                </div>
                            )}

                            <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Observação interna (opcional)"
                                rows={3}
                                className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none resize-none mb-4"
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3"
                            >
                                <button
                                    onClick={() => handleReview('reject')}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 rounded-xl bg-error/10 text-error font-bold text-sm hover:bg-error/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    <XCircle size={16} />
                                    Bloquear
                                </button>
                                <button
                                    onClick={() => handleReview('approve')}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 rounded-xl bg-success text-white font-bold text-sm hover:bg-success/90 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    <CheckCircle2 size={16} />
                                    Liberar
                                </button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
