import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { BUSINESS } from '@/config/constants';

export function ClientHeader() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';

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
                            <Link to="/meus-agendamentos" className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-accent/10 transition">
                                Meus Agendamentos
                            </Link>
                            <Link to="/configuracoes" className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-accent/10 transition">
                                Configurações
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
