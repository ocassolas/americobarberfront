import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToastStore } from '@/stores/useToastStore';
import type { ToastType } from '@/types';

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
};

const colors: Record<ToastType, string> = {
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
    info: 'bg-info',
};

export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    return (
        <>
            {/* Mobile: bottom-center */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90vw] max-w-sm md:hidden">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
            {/* Desktop: top-right */}
            <div className="fixed top-4 right-4 z-[100] flex-col gap-2 w-80 hidden md:flex">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
}

function ToastItem({ toast, onClose }: { toast: { id: string; type: ToastType; message: string }; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${colors[toast.type]}`}
        >
            {icons[toast.type]}
            <span className="flex-1">{toast.message}</span>
            <button onClick={onClose} className="opacity-70 hover:opacity-100 transition" aria-label="Fechar notificação">
                <X size={16} />
            </button>
        </motion.div>
    );
}
