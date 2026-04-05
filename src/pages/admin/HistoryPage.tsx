import { useState, useEffect } from 'react';
import { getAppointments, getBarbers } from '@/services/api';
import type { Appointment, Barber } from '@/types';

export function HistoryPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [barberFilter, setBarberFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        Promise.all([getAppointments(), getBarbers()])
            .then(([apts, bz]) => {
                setAppointments(apts);
                setBarbers(bz);
            })
            .catch((err) => {
                console.error('Erro ao carregar histórico:', err);
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = appointments.filter((a) => {
        if (barberFilter !== 'all' && a.barberId !== Number(barberFilter)) return false;
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        return true;
    });

    const totalRevenue = appointments
        .filter((a) => a.status === 'AGENDADO' || a.status === 'CONCLUIDO')
        .reduce((sum, a) => sum + (a.totalPrice || 0), 0);
    const formatPrice = (p: number | null | undefined) => (p ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (d: string | null | undefined) => {
        if (!d) return '—';
        const [y, m, day] = d.split('-');
        return `${day}/${m}/${y}`;
    };
    const formatTime = (t: string | null | undefined) => (t ?? '').substring(0, 5);

    const STATUS_MAP: Record<string, { label: string; color: string }> = {
        AGENDADO: { label: 'Confirmado', color: 'bg-success/15 text-success' },
        CONCLUIDO: { label: 'Concluído', color: 'bg-info/15 text-info' },
        CANCELADO_POR_CLIENTE: { label: 'Cancelado', color: 'bg-error/15 text-error' },
        CANCELADO_POR_BARBEIRO: { label: 'Cancelado (Barbearia)', color: 'bg-error/15 text-error' },
        PROPOSTA_REAGENDAMENTO: { label: 'Reagendamento Pendente', color: 'bg-warning/15 text-warning' }
    };

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
                                    <td className="px-4 py-3 font-mono text-xs">{formatTime(apt.startTime as string)}</td>
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
