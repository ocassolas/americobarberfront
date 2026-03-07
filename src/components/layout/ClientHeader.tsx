import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Menu, X, LogIn, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuthStore } from '@/stores/useAuthStore';
import { BUSINESS } from '@/config/constants';

export function ClientHeader() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';
    const { isAuthenticated, user, logout } = useAuthStore();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => setMenuOpen(false), [location]);

    const headerBg = isHome && !scrolled
        ? 'bg-transparent'
        : 'bg-bg-primary/60 backdrop-blur-xl border-b border-white/5';

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5 group" aria-label="Página inicial">
                    <img
                        src="/logo.png"
                        alt={BUSINESS.name}
                        className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link to="/agendar" className="text-sm font-medium text-text-secondary hover:text-accent transition">
                        Agendar
                    </Link>
                    <Link to="/meus-agendamentos" className="text-sm font-medium text-text-secondary hover:text-accent transition">
                        Meus Agendamentos
                    </Link>
                    
                    <div className="h-4 w-px bg-white/10 mx-1" />

                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <Link to="/configuracoes" className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-accent transition">
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                    <UserIcon size={14} />
                                </div>
                                <span>{user?.name.split(' ')[0]}</span>
                            </Link>
                            <button 
                                onClick={() => logout()}
                                className="p-2 text-text-secondary hover:text-error transition"
                                title="Sair"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/entrar" className="text-sm font-medium text-text-secondary hover:text-accent transition flex items-center gap-1.5">
                                <LogIn size={16} />
                                Entrar
                            </Link>
                            <Link to="/cadastrar" className="bg-accent hover:bg-accent-hover text-bg-primary text-xs font-bold px-4 py-2 rounded-lg transition">
                                Cadastrar
                            </Link>
                        </div>
                    )}

                    <ThemeToggle />
                </nav>

                <div className="flex md:hidden items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-bg-card/50 backdrop-blur-lg border-b border-border overflow-hidden"
                    >
                        <div className="px-4 py-4 flex flex-col gap-3">
                            <Link to="/agendar" className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-accent/10 transition">
                                Agendar Horário
                            </Link>
                            <Link to="/meus-agendamentos" className="text-sm font-medium py-2.5 px-3 rounded-xl hover:bg-accent/10 transition">
                                Meus Agendamentos
                            </Link>

                            <div className="h-px bg-white/5 mx-3 my-1" />

                            {isAuthenticated ? (
                                <>
                                    <Link to="/configuracoes" className="text-sm font-medium py-2.5 px-3 rounded-xl hover:bg-accent/10 transition flex items-center gap-2">
                                        <UserIcon size={16} className="text-accent" />
                                        Perfil / Configurações
                                    </Link>
                                    <button 
                                        onClick={() => logout()}
                                        className="text-sm font-medium py-2.5 px-3 rounded-xl hover:bg-error/10 text-error transition flex items-center gap-2 text-left"
                                    >
                                        <LogOut size={16} />
                                        Sair da Conta
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/entrar" className="text-sm font-medium py-2.5 px-3 rounded-xl hover:bg-accent/10 transition flex items-center gap-2">
                                        <LogIn size={16} className="text-accent" />
                                        Entrar
                                    </Link>
                                    <Link to="/cadastrar" className="text-sm font-bold py-3 px-3 rounded-xl bg-accent text-bg-primary transition text-center">
                                        Criar Conta
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
