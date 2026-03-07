import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, BarChart3, TrendingUp } from 'lucide-react';
import { getAppointments, getBarbers } from '@/services/api';
import type { Appointment, Barber } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function HistoryPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [barberFilter, setBarberFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        Promise.all([getAppointments(), getBarbers()]).then(([apts, bz]) => {
            setAppointments(apts);
            setBarbers(bz);
            setLoading(false);
        }).catch(console.error);
    }, []);

    const filtered = appointments.filter((a) => {
        if (barberFilter !== 'all' && a.barberId !== Number(barberFilter)) return false;
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        return true;
    });

    const totalRevenue = appointments
        .filter((a) => a.status === 'AGENDADO' || a.status === 'CONCLUIDO')
        .reduce((sum, a) => sum + (a.totalPrice || 0), 0);
    const formatPrice = (p: number) => p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (d: string) => { const [y, m, day] = d.split('-'); return `${day}/${m}/${y}`; };

    // Chart data — last 7 days
    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dayApts = appointments.filter((a) => a.date === dateStr && a.status !== 'CANCELADO_POR_CLIENTE' && a.status !== 'CANCELADO_POR_BARBEIRO');
        return {
            day: format(d, 'EEE', { locale: ptBR }),
            agendamentos: dayApts.length,
            receita: dayApts.reduce((sum, a) => sum + (a.totalPrice || 0), 0),
        };
    });

    const STATUS_MAP: Record<string, { label: string; color: string }> = {
        AGENDADO: { label: 'Confirmado', color: 'bg-success/15 text-success' },
        CONCLUIDO: { label: 'Concluído', color: 'bg-info/15 text-info' },
        CANCELADO_POR_CLIENTE: { label: 'Cancelado', color: 'bg-error/15 text-error' },
        CANCELADO_POR_BARBEIRO: { label: 'Cancelado (Barbearia)', color: 'bg-error/15 text-error' },
        PROPOSTA_REAGENDAMENTO: { label: 'Reagendamento Pendente', color: 'bg-warning/15 text-warning' }
    };

    const fmtTime = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    if (loading) {
        return <div className="space-y-4"><div className="skeleton h-12 rounded-xl w-48" /><div className="skeleton h-64 rounded-2xl" /><div className="skeleton h-96 rounded-2xl" /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="font-heading text-2xl font-bold">Histórico</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={barberFilter}
                    onChange={(e) => setBarberFilter(e.target.value)}
                    className="bg-bg-input input-surface border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition"
                    aria-label="Filtrar por barbeiro"
                >
                    <option value="all">Todos os barbeiros</option>
                    {barbers.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-bg-input input-surface border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition"
                    aria-label="Filtrar por status"
                >
                    <option value="all">Todos os status</option>
                    <option value="AGENDADO">Confirmado</option>
                    <option value="CONCLUIDO">Concluído</option>
                    <option value="CANCELADO_POR_CLIENTE">Cancelado</option>
                </select>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-bg-card card-surface border border-border rounded-2xl p-4">
                    <p className="text-xs text-text-secondary mb-1">Total Agendamentos</p>
                    <p className="text-xl font-bold font-mono">{filtered.length}</p>
                </div>
                <div className="bg-bg-card card-surface border border-border rounded-2xl p-4">
                    <p className="text-xs text-text-secondary mb-1">Receita Total</p>
                    <p className="text-xl font-bold font-mono text-accent">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="bg-bg-card card-surface border border-border rounded-2xl p-4">
                    <p className="text-xs text-text-secondary mb-1">Concluídos</p>
                    <p className="text-xl font-bold font-mono text-success">{filtered.filter((a) => a.status === 'CONCLUIDO').length}</p>
                </div>
                <div className="bg-bg-card card-surface border border-border rounded-2xl p-4">
                    <p className="text-xs text-text-secondary mb-1">Cancelados</p>
                    <p className="text-xl font-bold font-mono text-error">{filtered.filter((a) => a.status === 'CANCELADO_POR_CLIENTE' || a.status === 'CANCELADO_POR_BARBEIRO').length}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-bg-card card-surface border border-border rounded-2xl p-5">
                    <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
                        <BarChart3 size={16} className="text-accent" />
                        Agendamentos (7 dias)
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#A0A0A0' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#A0A0A0' }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, fontSize: 12 }}
                                labelStyle={{ color: '#F5F5F5' }}
                            />
                            <Bar dataKey="agendamentos" fill="#D4A853" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-bg-card card-surface border border-border rounded-2xl p-5">
                    <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-accent" />
                        Receita (7 dias)
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#A0A0A0' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#A0A0A0' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, fontSize: 12 }}
                                formatter={(val) => formatPrice(Number(val))}
                            />
                            <Line type="monotone" dataKey="receita" stroke="#D4A853" strokeWidth={2} dot={{ fill: '#D4A853' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Appointment list */}
            <div className="bg-bg-card card-surface border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Data</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Horário</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary hidden md:table-cell">Cliente</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary hidden md:table-cell">Barbeiro</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Valor</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((apt) => (
                                <tr key={apt.id} className="border-b border-border/50 hover:bg-white/[0.02] transition">
                                    <td className="px-4 py-3 font-mono text-xs">{formatDate(apt.date)}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{fmtTime(apt.startTime.hour, apt.startTime.minute)}</td>
                                    <td className="px-4 py-3 text-xs hidden md:table-cell">{apt.clientName}</td>
                                    <td className="px-4 py-3 text-xs hidden md:table-cell">{apt.barberName}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-accent">{formatPrice(apt.totalPrice)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${STATUS_MAP[apt.status]?.color || 'bg-gray-400'}`}>
                                            {STATUS_MAP[apt.status]?.label || apt.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
