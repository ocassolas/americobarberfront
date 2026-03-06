import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    MapPin, Phone, Clock, Star, Scissors, PenTool, Sparkles,
    Eye, Palette, Droplets, ChevronRight, Calendar, Instagram, MessageCircle,
    ArrowRight,
} from 'lucide-react';
import { MOCK_BARBERS } from '@/mocks/barbers';
import { MOCK_SERVICES } from '@/mocks/services';
import { BUSINESS, TEXT } from '@/config/constants';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
    scissors: <Scissors size={22} />,
    'pen-tool': <PenTool size={22} />,
    sparkles: <Sparkles size={22} />,
    eye: <Eye size={22} />,
    palette: <Palette size={22} />,
    droplets: <Droplets size={22} />,
};

/* ── Shared scroll-reveal wrapper ── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ── Staggered children wrapper ── */
function StaggerContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

const staggerChild = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ── Section title component ── */
function SectionTitle({ subtitle, title }: { subtitle: string; title: string }) {
    return (
        <Reveal className="text-center mb-16">
            <span className="landing-section-subtitle">{subtitle}</span>
            <h2 className="landing-section-title">{title}</h2>
            <div className="landing-title-underline" />
        </Reveal>
    );
}

export function LandingPage() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    const formatPrice = (price: number) =>
        price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="landing-page">
            {/* ═══════════ HERO ═══════════ */}
            <section ref={heroRef} className="landing-hero">
                {/* Parallax background */}
                <motion.div className="landing-hero-bg" style={{ y: heroY }}>
                    <img src="/hero-bg.png" alt="" className="landing-hero-bg-img" />
                    <div className="landing-hero-overlay" />
                </motion.div>

                {/* Floating particles */}
                <div className="landing-hero-particles">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="landing-particle"
                            animate={{
                                y: [0, -30 - Math.random() * 40, 0],
                                x: [0, (Math.random() - 0.5) * 20, 0],
                                opacity: [0, 0.6, 0],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 4,
                                repeat: Infinity,
                                delay: Math.random() * 5,
                                ease: 'easeInOut',
                            }}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${40 + Math.random() * 50}%`,
                                width: `${2 + Math.random() * 3}px`,
                                height: `${2 + Math.random() * 3}px`,
                            }}
                        />
                    ))}
                </div>

                <motion.div className="landing-hero-content" style={{ opacity: heroOpacity }}>
                    {/* Logo */}
                    <motion.img
                        src="/logo.png"
                        alt="Américo Barber Club"
                        className="landing-hero-logo"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />

                    {/* Tagline */}
                    <motion.p
                        className="landing-hero-tagline"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        {TEXT.hero.subtitle}
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                        className="landing-hero-cta-wrapper"
                    >
                        <Link to="/agendar" className="landing-cta-button">
                            <Calendar size={20} />
                            <span>{TEXT.hero.cta}</span>
                            <ArrowRight size={18} className="landing-cta-arrow" />
                        </Link>
                    </motion.div>

                    {/* Social proof */}
                    <motion.div
                        className="landing-hero-social-proof"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                    >
                        <div className="landing-hero-stat">
                            <Star size={14} className="text-accent fill-accent" />
                            <span>4.9</span>
                            <span className="text-text-secondary">Avaliação</span>
                        </div>
                        <div className="landing-hero-stat-divider" />
                        <div className="landing-hero-stat">
                            <span className="font-semibold">500+</span>
                            <span className="text-text-secondary">Clientes</span>
                        </div>
                        <div className="landing-hero-stat-divider" />
                        <div className="landing-hero-stat">
                            <span className="font-semibold">5+</span>
                            <span className="text-text-secondary">Anos</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="landing-scroll-indicator"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="landing-scroll-line" />
                    <span>Role para baixo</span>
                </motion.div>
            </section>

            {/* ═══════════ BARBEIROS ═══════════ */}
            <section className="landing-section">
                <div className="max-w-6xl mx-auto px-4">
                    <SectionTitle subtitle="Nossa Equipe" title="Nossos Barbeiros" />
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {MOCK_BARBERS.map((barber) => (
                            <motion.div key={barber.id} variants={staggerChild} className="landing-barber-card group">
                                <div className="landing-barber-avatar-wrapper">
                                    <div className="landing-barber-avatar">
                                        <span>{barber.name.charAt(0)}</span>
                                    </div>
                                    <div className="landing-barber-avatar-ring" />
                                </div>
                                <div className="landing-barber-info">
                                    <h3 className="landing-barber-name">{barber.name}</h3>
                                    <p className="landing-barber-specialty">{barber.specialty}</p>
                                    <p className="landing-barber-bio">{barber.bio}</p>
                                    <div className="landing-barber-rating">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                className={i < Math.round(barber.rating) ? 'text-accent fill-accent' : 'text-text-disabled'}
                                            />
                                        ))}
                                        <span className="font-mono text-sm text-text-secondary ml-1.5">{barber.rating}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* ═══════════ SERVIÇOS ═══════════ */}
            <section className="landing-section landing-section-alt">
                <div className="max-w-6xl mx-auto px-4">
                    <SectionTitle subtitle="O Que Oferecemos" title="Nossos Serviços" />
                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {MOCK_SERVICES.map((service) => (
                            <motion.div key={service.id} variants={staggerChild} className="landing-service-card group">
                                <div className="landing-service-icon">
                                    {SERVICE_ICONS[service.icon] ?? <Scissors size={22} />}
                                </div>
                                <h3 className="landing-service-name">{service.name}</h3>
                                <p className="landing-service-desc">{service.description}</p>
                                <div className="landing-service-footer">
                                    <span className="landing-service-duration">
                                        <Clock size={13} />
                                        {service.duration}min
                                    </span>
                                    <span className="landing-service-price">{formatPrice(service.price)}</span>
                                </div>
                                <div className="landing-service-glow" />
                            </motion.div>
                        ))}
                    </StaggerContainer>

                    {/* CTA inline */}
                    <Reveal className="text-center mt-12">
                        <Link to="/agendar" className="landing-cta-button landing-cta-secondary">
                            <Calendar size={18} />
                            <span>Ver Todos e Agendar</span>
                            <ArrowRight size={16} className="landing-cta-arrow" />
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════ INFORMAÇÕES ═══════════ */}
            <section className="landing-section">
                <div className="max-w-5xl mx-auto px-4">
                    <SectionTitle subtitle="Encontre-nos" title="Informações" />
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.a
                            variants={staggerChild}
                            href={BUSINESS.addressLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="landing-info-card group"
                        >
                            <div className="landing-info-icon">
                                <MapPin size={24} />
                            </div>
                            <h3 className="landing-info-title">Endereço</h3>
                            <p className="landing-info-text">{BUSINESS.address}</p>
                            <span className="landing-info-link">Ver no mapa <ChevronRight size={14} /></span>
                        </motion.a>

                        <motion.a
                            variants={staggerChild}
                            href={`tel:${BUSINESS.phone.replace(/\D/g, '')}`}
                            className="landing-info-card group"
                        >
                            <div className="landing-info-icon">
                                <Phone size={24} />
                            </div>
                            <h3 className="landing-info-title">Telefone</h3>
                            <p className="landing-info-text font-mono">{BUSINESS.phone}</p>
                            <span className="landing-info-link">Ligar agora <ChevronRight size={14} /></span>
                        </motion.a>

                        <motion.div variants={staggerChild} className="landing-info-card">
                            <div className="landing-info-icon">
                                <Clock size={24} />
                            </div>
                            <h3 className="landing-info-title">Horários</h3>
                            <p className="landing-info-text">{BUSINESS.workingHours}</p>
                        </motion.div>
                    </StaggerContainer>
                </div>
            </section>

            {/* ═══════════ SOCIAL / FINAL CTA ═══════════ */}
            <section className="landing-final-cta">
                <Reveal>
                    <img src="/logo.png" alt="Américo Barber Club" className="landing-final-logo" />
                    <h2 className="landing-final-title">Pronto para o seu novo visual?</h2>
                    <p className="landing-final-subtitle">
                        Agende agora e viva a experiência Américo Barber Club.
                    </p>
                    <div className="landing-final-buttons">
                        <Link to="/agendar" className="landing-cta-button">
                            <Calendar size={20} />
                            <span>{TEXT.hero.cta}</span>
                            <ArrowRight size={18} className="landing-cta-arrow" />
                        </Link>
                        <div className="landing-final-social">
                            <a
                                href={BUSINESS.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="landing-social-btn"
                                aria-label="Instagram"
                            >
                                <Instagram size={20} />
                            </a>
                            <a
                                href={BUSINESS.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="landing-social-btn"
                                aria-label="WhatsApp"
                            >
                                <MessageCircle size={20} />
                            </a>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ═══════════ FLOATING MOBILE CTA ═══════════ */}
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
