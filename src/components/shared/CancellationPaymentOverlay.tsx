import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Copy, Check, Upload, MessageCircle, Clock, Info, X, Send } from 'lucide-react';
import { getClientPendingPenalty, submitPenaltyProof, getPublicPixKey } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { BUSINESS } from '@/config/constants';
import type { CancellationPenalty } from '@/types';

export function CancellationPaymentOverlay() {
    const { user, isAuthenticated } = useAuthStore();
    const addToast = useToastStore((s) => s.addToast);
    const [penalty, setPenalty] = useState<CancellationPenalty | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [pixKey, setPixKey] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const isClient = user?.role === 'ROLE_CLIENT';

    const checkPenalty = useCallback(async () => {
        if (!isAuthenticated || !isClient) return;
        try {
            setLoading(true);
            const p = await getClientPendingPenalty();
            setPenalty(p);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, isClient]);

    useEffect(() => {
        checkPenalty();
        const interval = setInterval(checkPenalty, 30000);
        return () => clearInterval(interval);
    }, [checkPenalty]);

    useEffect(() => {
        if (penalty) {
            getPublicPixKey().then(setPixKey).catch(() => {});
        }
    }, [penalty]);

    const copyPix = async () => {
        await navigator.clipboard.writeText(pixKey);
        setCopied(true);
        addToast('success', 'Chave PIX copiada!');
        setTimeout(() => setCopied(false), 3000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            addToast('error', 'Imagem muito grande. Máximo 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setProofPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitProof = async () => {
        if (!penalty || !proofPreview) return;
        try {
            setUploading(true);
            const updated = await submitPenaltyProof(penalty.id, proofPreview);
            setPenalty(updated);
            setShowUpload(false);
            addToast('success', 'Comprovante enviado! Aguarde a aprovação.');
        } catch {
            addToast('error', 'Erro ao enviar comprovante. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    const openWhatsApp = () => {
        const msg = encodeURIComponent(
            `Olá! Sou ${user?.name}. Estou enviando o comprovante de pagamento referente à multa de cancelamento do agendamento #${penalty?.appointmentId}.`
        );
        window.open(`${BUSINESS.whatsapp}?text=${msg}`, '_blank');
    };

    if (!penalty || loading) return null;

    const isAwaitingReview = penalty.status === 'AWAITING_REVIEW';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="cancellation-overlay"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', damping: 25 }}
                    className="cancellation-card"
                >
                    {/* Header */}
                    <div className="cancellation-header">
                        <AlertTriangle size={28} className="cancellation-icon-warn" />
                        <h2 className="cancellation-title">
                            {isAwaitingReview ? 'Comprovante enviado!' : 'Você tem um pagamento pendente!'}
                        </h2>
                    </div>

                    {/* Info do agendamento */}
                    <div className="cancellation-details">
                        <div className="cancellation-detail-row">
                            <span className="cancellation-label">Serviço:</span>
                            <span className="cancellation-value">{penalty.serviceNames}</span>
                        </div>
                        <div className="cancellation-detail-row">
                            <span className="cancellation-label">Barbeiro:</span>
                            <span className="cancellation-value">{penalty.barberName}</span>
                        </div>
                        <div className="cancellation-detail-row">
                            <span className="cancellation-label">Data:</span>
                            <span className="cancellation-value">
                                {new Date(penalty.appointmentDate + 'T00:00:00').toLocaleDateString('pt-BR')} às {penalty.appointmentTime}
                            </span>
                        </div>
                        <div className="cancellation-detail-row cancellation-amount">
                            <span className="cancellation-label">Valor da multa:</span>
                            <span className="cancellation-value-amount">
                                R$ {Number(penalty.amount).toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    </div>

                    {isAwaitingReview ? (
                        /* Status: aguardando revisão */
                        <div className="cancellation-awaiting">
                            <Clock size={40} className="cancellation-icon-clock" />
                            <p className="cancellation-awaiting-text">
                                Seu comprovante está sendo analisado pelo administrador. 
                                Aguarde a confirmação para continuar usando o sistema.
                            </p>
                            <button onClick={openWhatsApp} className="cancellation-btn-whatsapp">
                                <MessageCircle size={18} />
                                Falar no WhatsApp
                            </button>
                        </div>
                    ) : (
                        /* Status: pendente — mostrar PIX */
                        <>
                            {/* QR Code PIX area */}
                            <div className="cancellation-pix-area">
                                <p className="cancellation-pix-label">Chave PIX (copia e cola)</p>
                                <div className="cancellation-pix-key">
                                    <code>{pixKey || 'Chave PIX não configurada'}</code>
                                </div>
                                <button onClick={copyPix} className="cancellation-btn-copy">
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? 'Copiado!' : 'Copiar chave PIX'}
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="cancellation-actions">
                                <button onClick={() => setShowUpload(true)} className="cancellation-btn-upload">
                                    <Upload size={18} />
                                    Enviar comprovante
                                </button>
                                <button onClick={openWhatsApp} className="cancellation-btn-whatsapp">
                                    <MessageCircle size={18} />
                                    Abrir WhatsApp
                                </button>
                            </div>

                            {/* Info link */}
                            <button onClick={() => setShowInfo(!showInfo)} className="cancellation-info-toggle">
                                <Info size={14} />
                                Por que preciso pagar agora?
                            </button>

                            <AnimatePresence>
                                {showInfo && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="cancellation-info-box"
                                    >
                                        <h3>Leia com atenção</h3>
                                        <p>
                                            Para assegurar a qualidade e a exclusividade do seu atendimento, adotamos o sistema de reserva mediante o pagamento integral do serviço. Este procedimento garante que o horário escolhido seja dedicado inteiramente a você, impedindo que outros clientes ocupem essa vaga.
                                        </p>
                                        <p>
                                            Ressaltamos que, <u>em caso de não comparecimento ou cancelamento sem aviso prévio (conforme nossa política)</u>, este valor será retido para cobrir os custos operacionais da reserva do profissional. Agradecemos a compreensão e o compromisso com nossa agenda.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </motion.div>

                {/* Upload Modal */}
                <AnimatePresence>
                    {showUpload && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="cancellation-upload-overlay"
                            onClick={() => setShowUpload(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="cancellation-upload-modal"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button onClick={() => setShowUpload(false)} className="cancellation-upload-close">
                                    <X size={20} />
                                </button>
                                <h3>Enviar comprovante de pagamento</h3>
                                <p>Selecione a imagem do comprovante PIX</p>

                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {proofPreview ? (
                                    <div className="cancellation-proof-preview">
                                        <img src={proofPreview} alt="Comprovante" />
                                        <button onClick={() => { setProofPreview(null); if (fileRef.current) fileRef.current.value = ''; }}>
                                            Remover
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => fileRef.current?.click()} className="cancellation-btn-select-file">
                                        <Upload size={24} />
                                        Selecionar imagem
                                    </button>
                                )}

                                <button
                                    onClick={handleSubmitProof}
                                    disabled={!proofPreview || uploading}
                                    className="cancellation-btn-send"
                                >
                                    <Send size={18} />
                                    {uploading ? 'Enviando...' : 'Enviar comprovante'}
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
}
