import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, User, Scissors, Search, X, Filter,
    ChevronDown, CheckCircle2, XCircle, AlertTriangle, History,
} from 'lucide-react';
import { getAppointments } from '@/services/api';
import { useToastStore } from '@/stores/useToastStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Appointment } from '@/types';

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    AGENDADO: { label: 'Confirmado', color: 'bg-success/15 text-success', icon: <CheckCircle2 size={12} /> },
    CONCLUIDO: { label: 'Concluído', color: 'bg-info/15 text-info', icon: <CheckCircle2 size={12} /> },
    FINALIZADO: { label: 'Finalizado', color: 'bg-success/15 text-success', icon: <CheckCircle2 size={12} /> },
    CANCELADO_POR_CLIENTE: { label: 'Cancelado', color: 'bg-error/15 text-error', icon: <XCircle size={12} /> },
    CANCELADO_POR_BARBEIRO: { label: 'Cancelado (Barbearia)', color: 'bg-error/15 text-error', icon: <XCircle size={12} /> },
    PROPOSTA_REAGENDAMENTO: { label: 'Reagendamento', color: 'bg-warning/15 text-warning', icon: <AlertTriangle size={12} /> },
};

export function ClientHistoryPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<Appointment | null>(null);

    // Filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedServiceFilter, setSelectedServiceFilter] = useState('');

    const addToast = useToastStore((s) => s.addToast);
    const { user } = useAuthStore();

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const results = await getAppointments();
            setAppointments(results);
        } catch {
            addToast('error', 'Erro ao carregar seu histórico.');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Get unique service names for filter dropdown
    const allServiceNames = useMemo(() => {
        const names = new Set<string>();
        appointments.forEach(apt => {
            apt.services?.forEach(s => names.add(s.name));
        });
        return Array.from(names).sort();
    }, [appointments]);

    // Filter & sort appointments
    const filteredAppointments = useMemo(() => {
        let result = [...appointments];

        // Date range filter
        if (dateFrom) {
            result = result.filter(a => a.date >= dateFrom);
        }
        if (dateTo) {
            result = result.filter(a => a.date <= dateTo);
        }

        // Service filter
        if (selectedServiceFilter) {
            result = result.filter(a =>
                a.services?.some(s => s.name === selectedServiceFilter)
            );
        }

        // Sort by date descending (most recent first)
        result.sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            return (b.startTime || '').localeCompare(a.startTime || '');
        });

        return result;
    }, [appointments, dateFrom, dateTo, selectedServiceFilter]);

    const activeFiltersCount = [dateFrom, dateTo, selectedServiceFilter].filter(Boolean).length;

    const clearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setSelectedServiceFilter('');
    };

    const formatDate = (d: string) => {
        const [y, m, day] = d.split('-');
        return `${day}/${m}/${y}`;
    };

    const formatPrice = (p: number) =>
        p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Group by month
    const groupedByMonth = useMemo(() => {
        const groups: Record<string, Appointment[]> = {};
        filteredAppointments.forEach(apt => {
            const [y, m] = apt.date.split('-');
            const key = `${y}-${m}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(apt);
        });
        return groups;
    }, [filteredAppointments]);

    const formatMonthLabel = (key: string) => {
        const [y, m] = key.split('-');
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${months[parseInt(m) - 1]} ${y}`;
    };


    return (
        <div className="pt-20 pb-8 min-h-screen px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <header className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-4">
                        <History size={28} className="text-accent" />
                    </div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">Histórico</h1>
                    <div className="flex items-center justify-center gap-2 text-accent">
                        <User size={16} />
                        <span className="text-sm font-medium">{user?.name}</span>
                    </div>
                </header>


                {/* Filter Button */}
                {!loading && appointments.length > 0 && (
                    <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition mb-4 ${
                            filterOpen || activeFiltersCount > 0
                                ? 'bg-accent/5 border-accent/30 text-accent'
                                : 'bg-bg-card border-border text-text-secondary hover:border-accent/20'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <Filter size={16} />
                            <span className="text-sm font-medium">Filtros</span>
                            {activeFiltersCount > 0 && (
                                <span className="bg-accent text-bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </div>
                        <ChevronDown
                            size={16}
                            className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                )}

                {/* Filter Panel */}
                <AnimatePresence>
                    {filterOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden mb-4"
                        >
                            <div className="card-premium p-4 space-y-4">
                                {/* Date Filters */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                                            Data inicial
                                        </label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={e => setDateFrom(e.target.value)}
                                            className="w-full bg-bg-input border border-border rounded-xl px-3 py-2.5 text-sm focus:border-accent outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                                            Data final
                                        </label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={e => setDateTo(e.target.value)}
                                            className="w-full bg-bg-input border border-border rounded-xl px-3 py-2.5 text-sm focus:border-accent outline-none transition"
                                        />
                                    </div>
                                </div>

                                {/* Service Filter */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                                        Serviço
                                    </label>
                                    <select
                                        value={selectedServiceFilter}
                                        onChange={e => setSelectedServiceFilter(e.target.value)}
                                        className="w-full bg-bg-input border border-border rounded-xl px-3 py-2.5 text-sm focus:border-accent outline-none transition appearance-none"
                                    >
                                        <option value="">Todos os serviços</option>
                                        {allServiceNames.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                {activeFiltersCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1.5 text-xs text-error hover:text-error/80 transition font-medium"
                                    >
                                        <X size={12} />
                                        Limpar filtros
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading */}
                {loading && (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="skeleton h-24 rounded-2xl" />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && appointments.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-bg-card border border-border mx-auto mb-5 flex items-center justify-center">
                            <History size={36} className="text-text-disabled" />
                        </div>
                        <p className="text-text-secondary text-sm mb-1">Nenhum agendamento encontrado.</p>
                        <p className="text-text-disabled text-xs">Seu histórico aparecerá aqui após seus primeiros agendamentos.</p>
                    </div>
                )}

                {/* No results with filters */}
                {!loading && appointments.length > 0 && filteredAppointments.length === 0 && (
                    <div className="text-center py-12">
                        <Search size={36} className="text-text-disabled mx-auto mb-4" />
                        <p className="text-text-secondary text-sm">Nenhum agendamento encontrado com os filtros selecionados.</p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-accent text-sm font-medium hover:underline"
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}

                {/* Results grouped by month */}
                {!loading && filteredAppointments.length > 0 && (
                    <div className="space-y-6">
                        {Object.entries(groupedByMonth).map(([monthKey, monthApts]) => (
                            <div key={monthKey}>
                                {/* Month Header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-sm font-semibold text-text-secondary capitalize">
                                        {formatMonthLabel(monthKey)}
                                    </h3>
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-xs text-text-disabled font-mono">
                                        {monthApts.length}
                                    </span>
                                </div>

                                {/* Appointments */}
                                <div className="space-y-2.5">
                                    <AnimatePresence>
                                        {monthApts.map((apt) => {
                                            const statusInfo = STATUS_MAP[apt.status] || {
                                                label: apt.status,
                                                color: 'bg-border/50 text-text-secondary',
                                                icon: null,
                                            };
                                            return (
                                                <motion.button
                                                    key={apt.id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="card-premium p-4 w-full text-left"
                                                    onClick={() => setSelectedDetail(apt)}
                                                >
                                                    <div className="flex items-start justify-between mb-2.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                                                <Calendar size={18} className="text-accent" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium font-mono">
                                                                        {formatDate(apt.date)}
                                                                    </span>
                                                                    <span className="text-xs text-text-secondary font-mono">
                                                                        {(apt.startTime as string).substring(0, 5)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-text-secondary mt-0.5">
                                                                    {apt.barberName}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${statusInfo.color}`}>
                                                            {statusInfo.icon}
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            {apt.services?.map((s) => (
                                                                <span
                                                                    key={s.id}
                                                                    className="px-2 py-0.5 bg-bg-input rounded-lg text-[10px] text-accent/80 border border-accent/10"
                                                                >
                                                                    {s.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="font-mono font-semibold text-sm text-accent ml-2 flex-shrink-0">
                                                            {formatPrice(apt.totalPrice)}
                                                        </span>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results count */}
                {!loading && filteredAppointments.length > 0 && (
                    <p className="text-center text-xs text-text-disabled mt-6 mb-2">
                        Mostrando {filteredAppointments.length} de {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setSelectedDetail(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Status badge */}
                            <div className="flex justify-center mb-5">
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_MAP[selectedDetail.status]?.color || 'bg-border/50 text-text-secondary'}`}>
                                    {STATUS_MAP[selectedDetail.status]?.icon}
                                    {STATUS_MAP[selectedDetail.status]?.label || selectedDetail.status}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-text-secondary flex items-center gap-2">
                                        <Calendar size={14} /> Data
                                    </span>
                                    <span className="font-mono font-medium">{formatDate(selectedDetail.date)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-text-secondary flex items-center gap-2">
                                        <Clock size={14} /> Horário
                                    </span>
                                    <span className="font-mono font-medium">
                                        {(selectedDetail.startTime as string).substring(0, 5)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-text-secondary flex items-center gap-2">
                                        <Scissors size={14} /> Barbeiro
                                    </span>
                                    <span className="font-medium">{selectedDetail.barberName}</span>
                                </div>

                                <div className="h-px bg-border my-1" />

                                {/* Services */}
                                <div>
                                    <span className="text-text-secondary text-xs uppercase tracking-wider font-semibold block mb-2">
                                        Serviços
                                    </span>
                                    <div className="space-y-1.5">
                                        {selectedDetail.services?.map(s => (
                                            <div key={s.id} className="flex justify-between text-sm">
                                                <span>{s.name}</span>
                                                <span className="font-mono text-accent text-xs">{formatPrice(s.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-border my-1" />

                                {/* Total */}
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">Total</span>
                                    <span className="font-mono font-bold text-accent text-lg">
                                        {formatPrice(selectedDetail.totalPrice)}
                                    </span>
                                </div>

                                {/* Observation */}
                                {selectedDetail.observation && (
                                    <div className="bg-bg-input rounded-xl p-3 mt-2">
                                        <p className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold mb-1">Observações</p>
                                        <p className="text-xs text-text-primary italic">"{selectedDetail.observation}"</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedDetail(null)}
                                className="w-full mt-5 py-3 rounded-2xl border border-border text-sm font-bold hover:bg-white/5 transition"
                            >
                                Fechar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
