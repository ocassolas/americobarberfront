import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { apiClient } from '@/services/apiClient';
import type { LoginResponse } from '@/types';

export function ClientLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const login = useAuthStore((s) => s.login);
    const addToast = useToastStore((s) => s.addToast);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiClient.post<LoginResponse>('/auth/login', {
                email,
                password,
            });

            login(response.data);
            addToast('success', 'Bem-vindo(a) de volta!');
            
            // If it's a client, redirect to my appointments or booking
            if (response.data.role === 'ROLE_CLIENT') {
                navigate('/meus-agendamentos');
            } else {
                // If an admin logs in through here by mistake, still let them in
                navigate('/admin/dashboard');
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                setError('E-mail ou senha incorretos.');
            } else {
                setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-bg-primary py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="mb-8 flex items-center justify-between">
                    <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-secondary hover:text-text-primary">
                        <ArrowLeft size={20} />
                    </Link>
                </div>

                <div className="text-center mb-10">
                    <img src="/logo.png" alt="Américo Barber Club" className="h-24 w-auto mx-auto mb-6" />
                    <h1 className="font-heading text-3xl font-bold mb-2">Bem-vindo(a)</h1>
                    <p className="text-text-secondary">Faça login para gerenciar seus agendamentos</p>
                </div>

                <div className="bg-bg-card card-surface border border-border/50 rounded-3xl p-8 shadow-2xl shadow-black/20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary ml-1">E-mail</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full bg-bg-input input-surface border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary ml-1">Senha</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-bg-input input-surface border border-border/50 rounded-2xl pl-12 pr-12 py-3.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition"
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error text-sm text-center bg-error/10 py-2 rounded-lg">
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent hover:bg-accent-hover text-bg-primary font-bold py-4 rounded-2xl transition shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Entrar na Conta</span>
                                    <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-border/30 text-center">
                        <p className="text-text-secondary text-sm">
                            Ainda não tem uma conta?{' '}
                            <Link to="/cadastrar" className="text-accent font-semibold hover:underline">
                                Criar conta agora
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
