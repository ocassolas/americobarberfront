import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Upload, AlertTriangle } from 'lucide-react';
import { getClientPixKey, submitPenaltyProof } from '@/services/api';
import { useToastStore } from '@/stores/useToastStore';
import { formatPenaltyAmount } from '@/utils/cancellationPolicy';
import type { CancellationPenalty } from '@/types';

interface PaymentPendingOverlayProps {
    penalty: CancellationPenalty;
    onProofSubmitted: () => void;
}

export function PaymentPendingOverlay({ penalty, onProofSubmitted }: PaymentPendingOverlayProps) {
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [pixKey, setPixKey] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        getClientPixKey()
            .then((settings) => setPixKey(settings.pixKey))
            .catch(() => addToast('error', 'Erro ao carregar chave PIX.'));
    }, [addToast]);

    const handleCopyPix = async () => {
        if (!pixKey) return;
        try {
            await navigator.clipboard.writeText(pixKey);
            addToast('success', 'Chave PIX copiada!');
        } catch {
            addToast('error', 'Não foi possível copiar a chave PIX.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 15 * 1024 * 1024) {
            addToast('error', 'Arquivo muito grande. Máximo 15MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setProofPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmitProof = async () => {
        if (!proofPreview) {
            addToast('warning', 'Envie o comprovante de pagamento.');
            return;
        }

        setSubmitting(true);
        try {
            await submitPenaltyProof(proofPreview);
            addToast('success', 'Comprovante enviado! Seu acesso foi liberado.');
            onProofSubmitted();
        } catch {
            addToast('error', 'Erro ao enviar comprovante. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const isRejected = penalty.status === 'REJECTED';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <motion.div
                className="absolute inset-0 bg-black/70 backdrop-blur-xl"
                aria-hidden
            />

            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative w-full max-w-md max-h-[90vh] bg-bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
                <motion.div className="overflow-y-auto overscroll-contain p-6 payment-pending-scroll">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-5"
                >
                    <h2 className="font-heading text-xl font-bold text-accent mb-2">
                        Você tem um pagamento pendente!
                    </h2>
                    <p className="text-text-secondary text-sm">
                        Valor: <span className="text-text-primary font-semibold">{formatPenaltyAmount(penalty.amount)}</span>
                    </p>
                </motion.div>

                {isRejected && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2 text-sm text-error"
                    >
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <span>Seu comprovante foi rejeitado. Envie um comprovante válido para continuar usando o sistema.</span>
                    </motion.div>
                )}

                <div className="mb-5 p-4 rounded-2xl bg-bg-input border border-border/50 text-sm text-text-secondary leading-relaxed">
                    <p className="font-semibold text-accent mb-2 text-center">Leia com atenção</p>
                    <p className="mb-3">
                        Para assegurar a qualidade e a exclusividade do seu atendimento, adotamos o sistema de reserva mediante o pagamento integral do serviço.
                    </p>
                    <p>
                        <span className="underline text-text-primary">
                            Em caso de cancelamento com menos de 12 horas de antecedência, este valor será retido para cobrir os custos operacionais da reserva do profissional.
                        </span>
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center mb-4"
                >
                    <img
                        src="/Pix-QrCode.jpeg"
                        alt="QR Code PIX"
                        className="w-48 h-48 object-contain rounded-xl border border-border bg-white p-2"
                    />
                </motion.div>

                <div className="mb-4 p-3 rounded-xl bg-bg-input border border-border text-center">
                    <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">Chave PIX</p>
                    <p className="text-xs sm:text-sm font-mono text-text-primary break-all">{pixKey || 'Carregando...'}</p>
                </div>

                <button
                    onClick={handleCopyPix}
                    disabled={!pixKey}
                    className="w-full py-3.5 rounded-2xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-bg-primary font-bold text-sm transition mb-5 flex items-center justify-center gap-2"
                >
                    <Copy size={16} />
                    Copiar chave PIX
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t border-border pt-5"
                >
                    <p className="text-sm font-medium text-text-primary mb-3">Envie o comprovante de pagamento</p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 rounded-xl border border-dashed border-border hover:border-accent/50 text-text-secondary hover:text-text-primary transition flex items-center justify-center gap-2 text-sm mb-3"
                    >
                        <Upload size={16} />
                        {proofPreview ? 'Trocar comprovante' : 'Selecionar comprovante'}
                    </button>

                    {proofPreview && (
                        <img
                            src={proofPreview}
                            alt="Preview do comprovante"
                            className="w-full max-h-40 object-contain rounded-xl border border-border mb-3"
                        />
                    )}

                    <button
                        onClick={handleSubmitProof}
                        disabled={submitting || !proofPreview}
                        className="w-full py-3.5 rounded-2xl bg-success hover:bg-success/90 disabled:opacity-50 text-white font-bold text-sm transition"
                    >
                        {submitting ? 'Enviando...' : 'Enviar comprovante'}
                    </button>
                </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
