import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, X, Ban, Unlock, MessageCircle, Eye, Filter, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getAdminPenalties, confirmPenalty, rejectPenalty, blockClient, unblockClient } from '@/services/api';
import { useToastStore } from '@/stores/useToastStore';
import { BUSINESS } from '@/config/constants';
import type { CancellationPenalty, CancellationPenaltyStatus } from '@/types';

const STATUS_LABELS: Record<CancellationPenaltyStatus, string> = {
    PENDING: 'Pendente',
    AWAITING_REVIEW: 'Aguardando Revisão',
    CONFIRMED: 'Confirmado',
    REJECTED: 'Rejeitado',
};

const STATUS_COLORS: Record<CancellationPenaltyStatus, string> = {
    PENDING: 'var(--color-warning)',
    AWAITING_REVIEW: 'var(--color-accent)',
    CONFIRMED: '#22c55e',
    REJECTED: '#ef4444',
};

export function CancellationPaymentsPage() {
    const addToast = useToastStore((s) => s.addToast);
    const [penalties, setPenalties] = useState<CancellationPenalty[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<CancellationPenaltyStatus | 'ALL'>('AWAITING_REVIEW');
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ id: number; action: 'confirm' | 'reject' | 'block' } | null>(null);

    const fetchPenalties = useCallback(async () => {
        try {
            setLoading(true);
            const data = filter === 'ALL'
                ? await getAdminPenalties()
                : await getAdminPenalties(filter);
            setPenalties(data);
        } catch {
            addToast('error', 'Erro ao carregar penalidades');
        } finally {
            setLoading(false);
        }
    }, [filter, addToast]);

    useEffect(() => {
        fetchPenalties();
    }, [fetchPenalties]);

    const handleConfirm = async (id: number) => {
        try {
            await confirmPenalty(id);
            addToast('success', 'Pagamento confirmado! Cliente liberado.');
            fetchPenalties();
        } catch {
            addToast('error', 'Erro ao confirmar pagamento');
        }
        setConfirmDialog(null);
    };

    const handleReject = async (id: number) => {
        try {
            await rejectPenalty(id);
            addToast('warning', 'Comprovante rejeitado.');
            fetchPenalties();
        } catch {
            addToast('error', 'Erro ao rejeitar');
        }
        setConfirmDialog(null);
    };

    const handleBlock = async (clientId: number) => {
        try {
            await blockClient(clientId);
            addToast('warning', 'Cliente bloqueado com sucesso.');
            fetchPenalties();
        } catch {
            addToast('error', 'Erro ao bloquear cliente');
        }
        setConfirmDialog(null);
    };

    const handleUnblock = async (clientId: number) => {
        try {
            await unblockClient(clientId);
            addToast('success', 'Cliente desbloqueado.');
            fetchPenalties();
        } catch {
            addToast('error', 'Erro ao desbloquear');
        }
    };

    const openWhatsApp = (phone: string, name: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const msg = encodeURIComponent(`Olá ${name}, entramos em contato referente ao seu pagamento de cancelamento na ${BUSINESS.name}.`);
        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    };

    const tabs: { value: CancellationPenaltyStatus | 'ALL'; label: string; icon: React.ReactNode }[] = [
        { value: 'AWAITING_REVIEW', label: 'Aguardando', icon: <Clock size={16} /> },
        { value: 'PENDING', label: 'Pendentes', icon: <AlertTriangle size={16} /> },
        { value: 'CONFIRMED', label: 'Confirmados', icon: <CheckCircle size={16} /> },
        { value: 'REJECTED', label: 'Rejeitados', icon: <XCircle size={16} /> },
        { value: 'ALL', label: 'Todos', icon: <Filter size={16} /> },
    ];

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <h1 className="admin-page-title">
                    <AlertTriangle size={24} />
                    Pagamentos por Cancelamento
                </h1>
                <p className="admin-page-subtitle">
                    Gerencie comprovantes de pagamento de clientes que cancelaram ou não compareceram.
                </p>
            </div>

            {/* Tabs */}
            <div className="penalty-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`penalty-tab ${filter === tab.value ? 'penalty-tab-active' : ''}`}
                    >
                        {tab.icon}
                        {tab.label}
                        {filter === tab.value && penalties.length > 0 && (
                            <span className="penalty-tab-badge">{penalties.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Lista */}
            {loading ? (
                <div className="penalty-loading">Carregando...</div>
            ) : penalties.length === 0 ? (
                <div className="penalty-empty">
                    <CheckCircle size={48} />
                    <p>Nenhuma penalidade {filter !== 'ALL' ? `com status "${STATUS_LABELS[filter as CancellationPenaltyStatus]}"` : ''}</p>
                </div>
            ) : (
                <div className="penalty-list">
                    {penalties.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="penalty-card"
                        >
                            <div className="penalty-card-header">
                                <div className="penalty-client-info">
                                    <h3>{p.clientName}</h3>
                                    <span className="penalty-phone">{p.clientPhone}</span>
                                </div>
                                <span
                                    className="penalty-status-badge"
                                    style={{ background: STATUS_COLORS[p.status] + '22', color: STATUS_COLORS[p.status], borderColor: STATUS_COLORS[p.status] }}
                                >
                                    {STATUS_LABELS[p.status]}
                                </span>
                            </div>

                            <div className="penalty-card-body">
                                <div className="penalty-info-grid">
                                    <div>
                                        <span className="penalty-info-label">Serviço</span>
                                        <span className="penalty-info-value">{p.serviceNames}</span>
                                    </div>
                                    <div>
                                        <span className="penalty-info-label">Barbeiro</span>
                                        <span className="penalty-info-value">{p.barberName}</span>
                                    </div>
                                    <div>
                                        <span className="penalty-info-label">Data</span>
                                        <span className="penalty-info-value">
                                            {new Date(p.appointmentDate + 'T00:00:00').toLocaleDateString('pt-BR')} {p.appointmentTime}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="penalty-info-label">Valor</span>
                                        <span className="penalty-info-value penalty-amount">
                                            R$ {Number(p.amount).toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                </div>

                                {p.reviewedByName && (
                                    <div className="penalty-reviewed">
                                        Revisado por: {p.reviewedByName} em {p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString('pt-BR') : ''}
                                    </div>
                                )}
                            </div>

                            <div className="penalty-card-actions">
                                {p.proofImageData && (
                                    <button onClick={() => setSelectedProof(p.proofImageData!)} className="penalty-btn penalty-btn-view">
                                        <Eye size={16} /> Ver comprovante
                                    </button>
                                )}
                                <button onClick={() => openWhatsApp(p.clientPhone, p.clientName)} className="penalty-btn penalty-btn-whatsapp">
                                    <MessageCircle size={16} /> WhatsApp
                                </button>
                                {p.status === 'AWAITING_REVIEW' && (
                                    <>
                                        <button onClick={() => setConfirmDialog({ id: p.id, action: 'confirm' })} className="penalty-btn penalty-btn-confirm">
                                            <Check size={16} /> Confirmar
                                        </button>
                                        <button onClick={() => setConfirmDialog({ id: p.id, action: 'reject' })} className="penalty-btn penalty-btn-reject">
                                            <X size={16} /> Rejeitar
                                        </button>
                                    </>
                                )}
                                {(p.status === 'REJECTED') && (
                                    <button onClick={() => setConfirmDialog({ id: p.clientId, action: 'block' })} className="penalty-btn penalty-btn-block">
                                        <Ban size={16} /> Bloquear Cliente
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Proof modal */}
            <AnimatePresence>
                {selectedProof && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="penalty-proof-overlay"
                        onClick={() => setSelectedProof(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            className="penalty-proof-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedProof(null)} className="penalty-proof-close">
                                <X size={24} />
                            </button>
                            <img src={selectedProof} alt="Comprovante de pagamento" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm dialog */}
            <AnimatePresence>
                {confirmDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="penalty-proof-overlay"
                        onClick={() => setConfirmDialog(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="penalty-confirm-dialog"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>
                                {confirmDialog.action === 'confirm' && 'Confirmar pagamento?'}
                                {confirmDialog.action === 'reject' && 'Rejeitar comprovante?'}
                                {confirmDialog.action === 'block' && 'Bloquear este cliente?'}
                            </h3>
                            <p>
                                {confirmDialog.action === 'confirm' && 'O cliente será liberado para usar o sistema normalmente.'}
                                {confirmDialog.action === 'reject' && 'O comprovante será marcado como rejeitado. Você poderá bloquear o cliente depois.'}
                                {confirmDialog.action === 'block' && 'O cliente não conseguirá acessar o sistema. Esta ação pode ser revertida.'}
                            </p>
                            <div className="penalty-dialog-actions">
                                <button onClick={() => setConfirmDialog(null)} className="penalty-btn penalty-btn-cancel-dialog">
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirmDialog.action === 'confirm') handleConfirm(confirmDialog.id);
                                        else if (confirmDialog.action === 'reject') handleReject(confirmDialog.id);
                                        else handleBlock(confirmDialog.id);
                                    }}
                                    className={`penalty-btn ${confirmDialog.action === 'block' ? 'penalty-btn-block' : confirmDialog.action === 'reject' ? 'penalty-btn-reject' : 'penalty-btn-confirm'}`}
                                >
                                    {confirmDialog.action === 'confirm' && 'Confirmar'}
                                    {confirmDialog.action === 'reject' && 'Rejeitar'}
                                    {confirmDialog.action === 'block' && 'Bloquear'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
