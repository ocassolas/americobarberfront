import { motion, AnimatePresence } from 'framer-motion';
import { useLoadingStore } from '@/stores/useLoadingStore';

export function LoadingBar() {
    const loadingCount = useLoadingStore((s) => s.loadingCount);
    const isLoading = loadingCount > 0;

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ width: '0%', opacity: 1 }}
                    animate={{ 
                        width: '70%', 
                        opacity: 1,
                        transition: { duration: 10, ease: 'easeOut' } 
                    }}
                    exit={{ 
                        width: '100%', 
                        opacity: 0,
                        transition: { duration: 0.3 } 
                    }}
                    className="fixed top-0 left-0 h-[3px] bg-accent z-[9999] shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                />
            )}
        </AnimatePresence>
    );
}
