import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Users, Clock, Scissors } from 'lucide-react';
import { getAppointments } from '@/services/api';
import type { Appointment } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DashboardPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAppointments().then((data) => {
            setAppointments(data);
            setLoading(false);
        });
    }, []);

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const todayAppointments = appointments.filter((a) => a.date === todayStr && a.status !== 'cancelled');
    const todayRevenue = todayAppointments.reduce((sum, a) => sum + a.totalPrice, 0);
    const nextApt = todayAppointments
        .filter((a) => a.time >= format(today, 'HH:mm'))
        .sort((a, b) => a.time.localeCompare(b.time))[0];

    const formatPrice = (p: number) => p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const stats = [
        { label: 'Agendamentos Hoje', value: todayAppointments.length.toString(), icon: Calendar, color: 'text-info bg-info/10' },
        { label: 'Receita do Dia', value: formatPrice(todayRevenue), icon: DollarSign, color: 'text-success bg-success/10' },
        { label: 'Clientes Atendidos', value: appointments.filter((a) => a.date === todayStr && a.status === 'completed').length.toString(), icon: Users, color: 'text-accent bg-accent/10' },
        { label: 'Próximo Horário', value: nextApt ? nextApt.time : '--:--', icon: Clock, color: 'text-warning bg-warning/10' },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton h-28 rounded-2xl" />
                    ))}
                </div>
                <div className="skeleton h-64 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold mb-1">Dashboard</h1>
                <p className="text-text-secondary text-sm capitalize">
                    {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-bg-card card-surface border border-border rounded-2xl p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-text-secondary text-xs font-medium">{stat.label}</span>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold font-mono">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Today's schedule */}
            <div className="bg-bg-card card-surface border border-border rounded-2xl p-5">
                <h2 className="font-heading font-semibold text-lg mb-4">Agenda de Hoje</h2>
                {todayAppointments.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar size={40} className="text-text-disabled mx-auto mb-3" />
                        <p className="text-text-secondary text-sm">Nenhum agendamento para hoje</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todayAppointments
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map((apt) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-bg-input hover:bg-accent/5 transition"
                                >
                                    <span className="font-mono font-semibold text-accent text-sm w-14">{apt.time}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{apt.clientName}</p>
                                        <p className="text-xs text-text-secondary truncate">
                                            {apt.services.map((s) => s.name).join(', ')}
                                        </p>
                                    </div>
                                    <span className="text-xs text-text-secondary">{apt.barberName.split(' ')[0]}</span>
                                    <span className="font-mono text-sm text-accent">{formatPrice(apt.totalPrice)}</span>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
