import { Link, useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';

export function FloatingBookingButton() {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();
    
    // Show ONLY on /meus-agendamentos for authenticated users
    const shouldShow = isAuthenticated && location.pathname === '/meus-agendamentos';

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    className="fixed bottom-[90px] right-4 sm:right-6 z-40 mb-safe"
                >
                    <Link
                        to="/agendar"
                        className="flex items-center justify-center w-14 h-14 bg-accent text-bg-primary rounded-full shadow-lg shadow-accent/30 hover:bg-accent-hover transition-colors group relative"
                        title="Agendar Novo Horário"
                    >
                        <Calendar size={24} />
                        <span className="absolute right-full mr-3 px-3 py-1.5 bg-bg-card border border-border rounded-lg text-xs font-bold text-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                            Agendar Horário
                        </span>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
