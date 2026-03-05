import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, Scissors, Clock, BarChart3,
    Settings, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { PageTransition } from '@/components/shared/PageTransition';
import { BUSINESS, TEXT } from '@/config/constants';

const NAV = [
    { path: '/admin/dashboard', label: TEXT.admin.dashboard, icon: LayoutDashboard },
    { path: '/admin/agenda', label: TEXT.admin.agenda, icon: Calendar },
    { path: '/admin/servicos', label: TEXT.admin.services, icon: Scissors },
    { path: '/admin/historico', label: TEXT.admin.history, icon: BarChart3 },
    { path: '/admin/horarios', label: TEXT.admin.workHours, icon: Clock },
    { path: '/admin/configuracoes', label: TEXT.admin.settings, icon: Settings },
] as const;

export function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    return (
        <div className="min-h-screen flex">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-bg-card border-r border-border fixed inset-y-0 left-0 z-40">
                <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-heading font-bold text-bg-primary text-xs">
                        AB
                    </div>
                    <span className="font-heading font-semibold text-sm">{BUSINESS.name}</span>
                </div>
                <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
                    {NAV.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                                    ? 'bg-accent/15 text-accent'
                                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-3 border-t border-border">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition"
                    >
                        <LogOut size={18} />
                        {TEXT.admin.logout}
                    </button>
                </div>
            </aside>

            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 w-72 bg-bg-card border-r border-border z-50 lg:hidden flex flex-col"
                        >
                            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-heading font-bold text-bg-primary text-xs">
                                        AB
                                    </div>
                                    <span className="font-heading font-semibold text-sm">{BUSINESS.name}</span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition"
                                    aria-label="Fechar menu"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
                                {NAV.map((item) => {
                                    const active = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                                                ? 'bg-accent/15 text-accent'
                                                : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                                                }`}
                                        >
                                            <item.icon size={18} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="p-3 border-t border-border">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition"
                                >
                                    <LogOut size={18} />
                                    {TEXT.admin.logout}
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main content area */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                <header className="h-16 bg-bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-white/10 transition lg:hidden"
                            aria-label="Abrir menu"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="flex items-center gap-2 ml-auto">
                            <ThemeToggle />
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        <PageTransition>
                            <Outlet />
                        </PageTransition>
                    </div>
                </main>
            </div>
            <ToastContainer />
        </div>
    );
}
