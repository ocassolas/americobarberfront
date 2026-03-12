import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, Scissors, Clock, BarChart3,
    Settings, LogOut, Menu, X, ChevronLeft, ChevronRight,
    HelpCircle, User, Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { PageTransition } from '@/components/shared/PageTransition';
import { BUSINESS, TEXT } from '@/config/constants';

const NAV_MAIN = [
    { path: '/admin/dashboard', label: TEXT.admin.dashboard, icon: LayoutDashboard },
    { path: '/admin/agenda', label: TEXT.admin.agenda, icon: Calendar },
    { path: '/admin/servicos', label: TEXT.admin.services, icon: Scissors },
    { path: '/admin/barbeiros', label: TEXT.admin.barbers, icon: Scissors },
    { path: '/admin/clientes', label: TEXT.admin.clients, icon: Users },
    { path: '/admin/historico', label: TEXT.admin.history, icon: BarChart3 },
    { path: '/admin/horarios', label: TEXT.admin.workHours, icon: Clock },
] as const;

const NAV_BOTTOM = [
    { path: '/admin/configuracoes', label: TEXT.admin.settings, icon: Settings },
] as const;

export function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    const sidebarWidth = collapsed ? 'w-[72px]' : 'w-64';
    const mainMargin = collapsed ? 'lg:ml-[72px]' : 'lg:ml-64';

    return (
        <div className="min-h-screen flex">
            {/* ─── Desktop sidebar ─── */}
            <aside
                className={`admin-sidebar hidden lg:flex flex-col ${sidebarWidth} fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out`}
            >
                {/* Logo / Brand */}
                <div className="admin-sidebar-header">
                    <div className="admin-sidebar-logo">
                        AB
                    </div>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            className="font-heading font-semibold text-sm text-text-primary whitespace-nowrap"
                        >
                            {BUSINESS.name}
                        </motion.span>
                    )}
                </div>

                {/* Main navigation */}
                <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto admin-sidebar-nav">
                    {!collapsed && (
                        <span className="admin-sidebar-section-label">
                            Menu Principal
                        </span>
                    )}
                    {NAV_MAIN.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={collapsed ? item.label : undefined}
                                className={`admin-sidebar-item ${active ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
                            >
                                <span className="admin-sidebar-icon-wrapper">
                                    <item.icon size={19} strokeWidth={1.8} />
                                </span>
                                {!collapsed && (
                                    <span className="admin-sidebar-item-label">{item.label}</span>
                                )}
                                {active && <span className="admin-sidebar-active-indicator" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="admin-sidebar-footer">
                    {/* Collapse toggle */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="admin-sidebar-item justify-center mb-1"
                        title={collapsed ? 'Expandir menu' : 'Recolher menu'}
                    >
                        {collapsed ? <ChevronRight size={18} strokeWidth={1.8} /> : <ChevronLeft size={18} strokeWidth={1.8} />}
                        {!collapsed && (
                            <span className="admin-sidebar-item-label text-xs">Recolher</span>
                        )}
                    </button>

                    <div className="admin-sidebar-divider" />

                    {/* Settings */}
                    {NAV_BOTTOM.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={collapsed ? item.label : undefined}
                                className={`admin-sidebar-item ${active ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
                            >
                                <span className="admin-sidebar-icon-wrapper">
                                    <item.icon size={19} strokeWidth={1.8} />
                                </span>
                                {!collapsed && (
                                    <span className="admin-sidebar-item-label">{item.label}</span>
                                )}
                                {active && <span className="admin-sidebar-active-indicator" />}
                            </Link>
                        );
                    })}

                    {/* Help */}
                    <button
                        className={`admin-sidebar-item ${collapsed ? 'justify-center' : ''}`}
                        title="Ajuda"
                    >
                        <span className="admin-sidebar-icon-wrapper">
                            <HelpCircle size={19} strokeWidth={1.8} />
                        </span>
                        {!collapsed && (
                            <span className="admin-sidebar-item-label">Ajuda</span>
                        )}
                    </button>

                    <div className="admin-sidebar-divider" />

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className={`admin-sidebar-item admin-sidebar-logout ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? TEXT.admin.logout : undefined}
                    >
                        <span className="admin-sidebar-icon-wrapper">
                            <LogOut size={19} strokeWidth={1.8} />
                        </span>
                        {!collapsed && (
                            <span className="admin-sidebar-item-label">{TEXT.admin.logout}</span>
                        )}
                    </button>

                    {/* User avatar */}
                    <div className={`admin-sidebar-user ${collapsed ? 'justify-center' : ''}`}>
                        <div className="admin-sidebar-avatar">
                            <User size={16} strokeWidth={1.8} />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-text-primary">Admin</span>
                                <span className="text-[10px] text-text-secondary">Administrador</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* ─── Mobile sidebar overlay ─── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                            className="admin-sidebar fixed inset-y-0 left-0 w-72 z-50 lg:hidden flex flex-col"
                        >
                            {/* Mobile header */}
                            <div className="admin-sidebar-header">
                                <div className="flex items-center gap-2.5">
                                    <div className="admin-sidebar-logo">
                                        AB
                                    </div>
                                    <span className="font-heading font-semibold text-sm text-text-primary">
                                        {BUSINESS.name}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition"
                                    aria-label="Fechar menu"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Mobile navigation */}
                            <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto admin-sidebar-nav">
                                <span className="admin-sidebar-section-label">
                                    Menu Principal
                                </span>
                                {NAV_MAIN.map((item) => {
                                    const active = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`admin-sidebar-item ${active ? 'active' : ''}`}
                                        >
                                            <span className="admin-sidebar-icon-wrapper">
                                                <item.icon size={19} strokeWidth={1.8} />
                                            </span>
                                            <span className="admin-sidebar-item-label">{item.label}</span>
                                            {active && <span className="admin-sidebar-active-indicator" />}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Mobile footer */}
                            <div className="admin-sidebar-footer">
                                <div className="admin-sidebar-divider" />

                                {NAV_BOTTOM.map((item) => {
                                    const active = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`admin-sidebar-item ${active ? 'active' : ''}`}
                                        >
                                            <span className="admin-sidebar-icon-wrapper">
                                                <item.icon size={19} strokeWidth={1.8} />
                                            </span>
                                            <span className="admin-sidebar-item-label">{item.label}</span>
                                            {active && <span className="admin-sidebar-active-indicator" />}
                                        </Link>
                                    );
                                })}

                                <button
                                    onClick={handleLogout}
                                    className="admin-sidebar-item admin-sidebar-logout"
                                >
                                    <span className="admin-sidebar-icon-wrapper">
                                        <LogOut size={19} strokeWidth={1.8} />
                                    </span>
                                    <span className="admin-sidebar-item-label">{TEXT.admin.logout}</span>
                                </button>

                                <div className="admin-sidebar-divider" />

                                <div className="admin-sidebar-user">
                                    <div className="admin-sidebar-avatar">
                                        <User size={16} strokeWidth={1.8} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-text-primary">Admin</span>
                                        <span className="text-[10px] text-text-secondary">Administrador</span>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ─── Main content area ─── */}
            <div className={`flex-1 ${mainMargin} flex flex-col min-h-screen transition-all duration-300`}>
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
