import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { TEXT } from '@/config/constants';
import { apiClient } from '@/services/apiClient';
import type { LoginResponse } from '@/types';

export function AdminLoginPage() {
    const [username, setUsername] = useState('');
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
                email: username, // Assuming username input acts as email based on API doc
                password,
            });

            if (response.data.role === 'ROLE_ADMIN') {
                login(response.data);
                addToast('success', 'Login realizado com sucesso!');
                navigate('/admin/dashboard');
            } else {
                setError('Acesso restrito apenas para administradores.');
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                setError(TEXT.admin.invalidCredentials);
            } else {
                setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-bg-primary">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center font-heading font-bold text-bg-primary text-2xl mx-auto mb-4">
                        AB
                    </div>
                    <h1 className="font-heading text-2xl font-bold mb-1">{TEXT.admin.login}</h1>
                    <p className="text-text-secondary text-sm">{TEXT.admin.loginSubtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-bg-card card-surface border border-border rounded-2xl p-6 space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <User size={16} className="text-accent" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-bg-input input-surface border border-border rounded-xl px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Lock size={16} className="text-accent" />
                            {TEXT.admin.password}
                        </label>
                        <div className="relative">
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-bg-input input-surface border border-border rounded-xl px-4 py-3 pr-10 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition"
                                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error text-sm text-center">
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !username || !password}
                        className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-bg-primary font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                        ) : (
                            TEXT.admin.enter
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
