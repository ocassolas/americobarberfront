import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';
import { motion } from 'framer-motion';

export function ThemeToggle() {
    const { isDark, toggle } = useThemeStore();

    return (
        <button
            onClick={toggle}
            className="relative p-2 rounded-lg transition-colors hover:bg-white/10 dark:hover:bg-white/10"
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
            <motion.div
                initial={false}
                animate={{ rotate: isDark ? 0 : 180 }}
                transition={{ duration: 0.3 }}
            >
                {isDark ? <Moon size={20} className="text-accent" /> : <Sun size={20} className="text-amber-600" />}
            </motion.div>
        </button>
    );
}
