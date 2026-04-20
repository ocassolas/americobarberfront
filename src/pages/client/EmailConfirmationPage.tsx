import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/services/apiClient';

export function EmailConfirmationPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const hasAttempted = React.useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token de confirmação não encontrado.');
            return;
        }

        if (hasAttempted.current) return;
        hasAttempted.current = true;

        const confirmEmail = async () => {
            try {
                await apiClient.get(`/auth/confirm-email?token=${token}`);
                setStatus('success');
            } catch (err: any) {
                console.error(err);
                setStatus('error');
                setMessage(err.response?.data?.message || 'Erro ao confirmar email. O token pode ser inválido ou expirado.');
            }
        };

        confirmEmail();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-bg-primary py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-bg-card card-surface border border-border/50 rounded-3xl p-8 shadow-2xl shadow-black/20 text-center"
            >
                {status === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 size={48} className="animate-spin text-accent mb-4" />
                        <h2 className="text-xl font-bold font-heading mb-2">Confirmando seu email...</h2>
                        <p className="text-text-secondary text-sm">Por favor, aguarde um momento.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center py-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                        >
                            <CheckCircle size={64} className="text-green-500 mb-6" />
                        </motion.div>
                        <h2 className="text-2xl font-bold font-heading mb-3 text-text-primary">Email Confirmado!</h2>
                        <p className="text-text-secondary mb-8">
                            Sua conta foi ativada com sucesso. Agora você já pode acessar todos os nossos serviços.
                        </p>
                        
                        <Link 
                            to="/entrar"
                            className="w-full bg-accent hover:bg-accent-hover text-bg-primary font-bold py-3.5 rounded-2xl transition shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                        >
                            Acessar Minha Conta
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center py-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                        >
                            <XCircle size={64} className="text-error mb-6" />
                        </motion.div>
                        <h2 className="text-2xl font-bold font-heading mb-3 text-text-primary">Ops, ocorreu um erro</h2>
                        <p className="text-text-secondary mb-8">
                            {message}
                        </p>
                        
                        <Link 
                            to="/entrar"
                            className="w-full bg-bg-input border border-border hover:bg-white/5 text-text-primary font-semibold py-3.5 rounded-2xl transition flex items-center justify-center gap-2"
                        >
                            Voltar para o Login
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
