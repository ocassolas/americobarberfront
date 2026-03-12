import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BUSINESS } from '@/config/constants';

export function ClientHeader() {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

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

                {/* Navigation and Actions removed per user request */}
            </div>
        </header>
    );
}
