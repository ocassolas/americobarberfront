import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface Props {
    children: React.ReactNode;
}

export function PageTransition({ children }: Props) {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
