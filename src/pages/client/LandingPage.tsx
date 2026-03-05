import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
    MapPin, Phone, Clock, Star, Scissors, PenTool, Sparkles,
    Eye, Palette, Droplets, ChevronRight, Calendar,
} from 'lucide-react';
import { MOCK_BARBERS } from '@/mocks/barbers';
import { MOCK_SERVICES } from '@/mocks/services';
import { BUSINESS, TEXT } from '@/config/constants';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
    scissors: <Scissors size={24} />,
    'pen-tool': <PenTool size={24} />,
    sparkles: <Sparkles size={24} />,
    eye: <Eye size={24} />,
    palette: <Palette size={24} />,
    droplets: <Droplets size={24} />,
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.section>
    );
}

export function LandingPage() {
    const formatPrice = (price: number) =>
        price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-bg-primary z-0" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 z-0" />

                <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 mb-6">
                            <Scissors size={14} className="text-accent" />
                            <span className="text-xs font-medium text-accent tracking-wider uppercase">{BUSINESS.name}</span>
                        </div>

                        <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4 leading-tight">
                            {TEXT.hero.title.split(' ').map((word, i) => (
                                <span key={i} className={i === 1 ? 'text-accent' : ''}>
                                    {word}{i === 0 ? ' ' : ''}
                                </span>
                            ))}
                        </h1>

                        <p className="text-text-secondary text-lg md:text-xl mb-8 max-w-xl mx-auto leading-relaxed">
                            {TEXT.hero.subtitle}
                        </p>

                        <Link
                            to="/agendar"
                            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-bg-primary font-semibold px-10 py-4.5 rounded-2xl text-lg transition-all hover:scale-[1.02] active:scale-[0.98] pulse-cta shadow-lg shadow-accent/20"
                        >
                            <Calendar size={20} />
                            {TEXT.hero.cta}
                        </Link>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <ChevronRight size={24} className="text-text-secondary rotate-90" />
                </motion.div>
            </section>

            {/* Barbers */}
            <AnimatedSection className="py-20 px-4 max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
                    {TEXT.sections.barbers}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {MOCK_BARBERS.map((barber) => (
                        <motion.div
                            key={barber.id}
                            whileHover={{ y: -4 }}
                            className="card-premium p-6"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent font-heading font-bold text-xl">
                                    {barber.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-heading font-semibold text-lg">{barber.name}</h3>
                                    <p className="text-accent text-sm">{barber.specialty}</p>
                                </div>
                            </div>
                            <p className="text-text-secondary text-sm leading-relaxed mb-3">{barber.bio}</p>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className={i < Math.round(barber.rating) ? 'text-accent fill-accent' : 'text-text-disabled'}
                                    />
                                ))}
                                <span className="text-sm text-text-secondary ml-1 font-mono">{barber.rating}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </AnimatedSection>

            {/* Services */}
            <AnimatedSection className="py-20 px-4 bg-bg-card/50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
                        {TEXT.sections.services}
                    </h2>
                    <div className="card-premium p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MOCK_SERVICES.map((service) => (
                            <motion.div
                                key={service.id}
                                whileHover={{ y: -4 }}
                                className="p-4 flex items-start gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                                    {SERVICE_ICONS[service.icon] ?? <Scissors size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold mb-1">{service.name}</h3>
                                    <p className="text-text-secondary text-sm mb-2">{service.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-text-secondary">
                                            <Clock size={12} className="inline mr-1" />
                                            {service.duration}min
                                        </span>
                                        <span className="font-mono font-semibold text-accent">
                                            {formatPrice(service.price)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* Info */}
            <AnimatedSection className="py-20 px-4 max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
                    {TEXT.sections.info}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <a
                        href={BUSINESS.addressLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-premium p-6 text-center group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-4 group-hover:scale-110 transition">
                            <MapPin size={24} />
                        </div>
                        <h3 className="font-semibold mb-1">Endereço</h3>
                        <p className="text-text-secondary text-sm">{BUSINESS.address}</p>
                    </a>

                    <a
                        href={`tel:${BUSINESS.phone.replace(/\D/g, '')}`}
                        className="card-premium p-6 text-center group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-4 group-hover:scale-110 transition">
                            <Phone size={24} />
                        </div>
                        <h3 className="font-semibold mb-1">Telefone</h3>
                        <p className="text-text-secondary text-sm font-mono">{BUSINESS.phone}</p>
                    </a>

                    <div className="card-premium p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-4">
                            <Clock size={24} />
                        </div>
                        <h3 className="font-semibold mb-1">Horário</h3>
                        <p className="text-text-secondary text-sm">{BUSINESS.workingHours}</p>
                    </div>
                </div>
            </AnimatedSection>

            {/* Floating CTA on mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg-primary via-bg-primary/95 to-transparent md:hidden z-40">
                <Link
                    to="/agendar"
                    className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-hover text-bg-primary font-semibold py-3.5 rounded-xl transition shadow-lg shadow-accent/20"
                >
                    <Calendar size={18} />
                    {TEXT.hero.cta}
                </Link>
            </div>
        </div>
    );
}
