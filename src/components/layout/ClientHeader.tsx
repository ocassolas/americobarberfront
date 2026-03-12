import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Settings, ChevronDown, Scissors } from 'lucide-react';
import { BUSINESS } from '@/config/constants';
import { useAuthStore } from '@/stores/useAuthStore';

export function ClientHeader() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';
    const { isAuthenticated, user, logout } = useAuthStore();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/');
    };

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

                {isAuthenticated && user && (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition text-sm"
                        >
                            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden sm:block text-text-primary font-medium max-w-[120px] truncate">
                                {user.name.split(' ')[0]}
                            </span>
                            <ChevronDown size={14} className={`text-text-secondary transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-border">
                                    <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                                    <p className="text-xs text-text-secondary truncate">{user.email}</p>
                                </div>
                                <div className="py-1">
                                    <Link
                                        to="/agendar"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition"
                                    >
                                        <Calendar size={16} />
                                        Agendar Horário
                                    </Link>
                                    <Link
                                        to="/meus-agendamentos"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition"
                                    >
                                        <Scissors size={16} />
                                        Meus Agendamentos
                                    </Link>
                                    <Link
                                        to="/configuracoes"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition"
                                    >
                                        <Settings size={16} />
                                        Configurações
                                    </Link>
                                </div>
                                <div className="border-t border-border py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error hover:bg-error/10 transition"
                                    >
                                        <LogOut size={16} />
                                        Sair da conta
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
