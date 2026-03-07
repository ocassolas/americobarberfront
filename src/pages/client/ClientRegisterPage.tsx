import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, Phone, FileText, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToastStore } from '@/stores/useToastStore';
import { apiClient } from '@/services/apiClient';

export function ClientRegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const addToast = useToastStore((s) => s.addToast);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            await apiClient.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                cpf: formData.cpf,
                phone: formData.phone,
                password: formData.password,
                role: 'ROLE_CLIENT'
            });

            addToast('success', 'Conta criada com sucesso! Agora você pode fazer login.');
            navigate('/entrar');
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || 'Erro ao criar conta. Verifique os dados e tente novamente.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-bg-primary py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg"
            >
                <div className="mb-6 flex items-center justify-between">
                    <Link to="/entrar" className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-secondary hover:text-text-primary">
                        <ArrowLeft size={20} />
                    </Link>
                </div>

                <div className="text-center mb-10">
                    <h1 className="font-heading text-3xl font-bold mb-2">Crie sua conta</h1>
                    <p className="text-text-secondary text-sm">Junte-se ao Américo Barber Club para uma experiência premium de cuidado pessoal.</p>
                </div>

                <div className="bg-bg-card card-surface border border-border/50 rounded-3xl p-8 shadow-2xl shadow-black/20">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-medium text-text-secondary ml-1 uppercase tracking-wider">Nome Completo</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors">
                                    <UserIcon size={18} />
                                </div>
                                <input
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-bg-input input-surface border border-border/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                                    placeholder="João Silva"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-text-secondary ml-1 uppercase tracking-wider">E-mail</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-bg-input input-surface border border-border/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-text-secondary ml-1 uppercase tracking-wider">WhatsApp/Telefone</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors">
                                    <Phone size={18} />
                                </div>
                                <input
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-bg-input input-surface border border-border/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-text-secondary ml-1 uppercase tracking-wider">CPF</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors">
                                    <FileText size={18} />
                                </div>
                                <input
                                    name="cpf"
                                    required
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    className="w-full bg-bg-input input-surface border border-border/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-text-secondary ml-1 uppercase tracking-wider">Senha</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    name="password"
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-bg-input input-surface border border-border/50 rounded-2xl pl-12 pr-10 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-medium text-text-secondary ml-1 uppercase tracking-wider">Confirmar Senha</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled group-focus-within:text-accent transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    name="confirmPassword"
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-bg-input input-surface border border-border/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2 text-error text-xs text-center bg-error/10 py-2 rounded-lg">
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="md:col-span-2 w-full bg-accent hover:bg-accent-hover text-bg-primary font-bold py-3.5 rounded-2xl transition shadow-lg shadow-accent/20 flex items-center justify-center gap-2 mt-4 transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Concluir Cadastro</span>
                                    <ArrowLeft size={18} className="rotate-180" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border/30 text-center">
                        <p className="text-text-secondary text-sm">
                            Já tem uma conta?{' '}
                            <Link to="/entrar" className="text-accent font-semibold hover:underline transition-all">
                                Fazer Login
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
