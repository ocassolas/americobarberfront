import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Users, Clock, CheckCircle2, History } from 'lucide-react';
import { getAppointments, finalizeAppointment, proposeReschedule } from '@/services/api';
import type { Appointment } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToastStore } from '@/stores/useToastStore';
import { RescheduleProposalModal } from '@/components/modals/RescheduleProposalModal';

export function DashboardPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [proposeTarget, setProposeTarget] = useState<Appointment | null>(null);
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getAppointments();
            setAppointments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async (id: number) => {
        try {
            await finalizeAppointment(id);
            addToast('success', 'Atendimento finalizado com sucesso!');
            fetchData();
        } catch (error) {
            addToast('error', 'Erro ao finalizar atendimento.');
        }
    };

    const handleConfirmPropose = async (data: any) => {
        if (!proposeTarget) return;
        try {
            await proposeReschedule(proposeTarget.id, data);
            fetchData();
        } catch (error) {
            throw error;
        }
    };

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    const fmtTime = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    const todayAppointments = appointments.filter((a) => a.date === todayStr && !a.status.startsWith('CANCELADO'));
    const todayRevenue = todayAppointments
        .filter(a => a.status === 'FINALIZADO' || a.status === 'CONCLUIDO')
        .reduce((sum, a) => sum + (a.totalPrice || 0), 0);
    
    const nextApt = todayAppointments
        .filter((a) => a.status === 'AGENDADO' && fmtTime(a.startTime.hour, a.startTime.minute) >= format(today, 'HH:mm'))
        .sort((a, b) => fmtTime(a.startTime.hour, a.startTime.minute).localeCompare(fmtTime(b.startTime.hour, b.startTime.minute)))[0];

    const formatPrice = (p: number) => p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const stats = [
        { label: 'Hoje', value: todayAppointments.length.toString(), icon: Calendar, color: 'text-info bg-info/10' },
        { label: 'Receita Hoje', value: formatPrice(todayRevenue), icon: DollarSign, color: 'text-success bg-success/10' },
        { label: 'Concluídos', value: todayAppointments.filter((a) => a.status === 'FINALIZADO' || a.status === 'CONCLUIDO').length.toString(), icon: Users, color: 'text-accent bg-accent/10' },
        { label: 'Próximo', value: nextApt ? fmtTime(nextApt.startTime.hour, nextApt.startTime.minute) : '--:--', icon: Clock, color: 'text-warning bg-warning/10' },
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold mb-1">Dashboard</h1>
                    <p className="text-text-secondary text-sm capitalize">
                        {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
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
                            .sort((a, b) => fmtTime(a.startTime.hour, a.startTime.minute).localeCompare(fmtTime(b.startTime.hour, b.startTime.minute)))
                            .map((apt) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-bg-input hover:bg-accent/5 transition group"
                                >
                                    <span className="font-mono font-semibold text-accent text-sm w-14">{fmtTime(apt.startTime.hour, apt.startTime.minute)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{apt.clientName}</p>
                                        <p className="text-xs text-text-secondary truncate">
                                            {apt.services?.map(s => s.name).join(', ') || 'Nenhum serviço'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-text-secondary hidden sm:inline">{apt.barberName.split(' ')[0]}</span>
                                        {apt.status === 'AGENDADO' ? (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                                <button 
                                                    onClick={() => setProposeTarget(apt)}
                                                    className="bg-bg-card border border-border text-text-primary p-1.5 rounded-lg hover:bg-white/5 transition flex items-center gap-1.5 text-xs"
                                                    title="Propor Reagendamento"
                                                >
                                                    <History size={14} className="text-accent" />
                                                </button>
                                                <button 
                                                    onClick={() => handleFinalize(apt.id)}
                                                    className="bg-success text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-success/20"
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Finalizar
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${apt.status === 'FINALIZADO' || apt.status === 'CONCLUIDO' ? 'text-success' : 'text-warning'}`}>
                                                {apt.status === 'FINALIZADO' || apt.status === 'CONCLUIDO' ? <CheckCircle2 size={12} /> : <History size={12} />}
                                                {apt.status === 'PROPOSTA_REAGENDAMENTO' ? 'Aguardando Cliente' : apt.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {proposeTarget && (
                <RescheduleProposalModal
                    isOpen={!!proposeTarget}
                    onClose={() => setProposeTarget(null)}
                    onConfirm={handleConfirmPropose}
                    appointmentDate={proposeTarget.date}
                    appointmentTime={fmtTime(proposeTarget.startTime.hour, proposeTarget.startTime.minute)}
                    clientName={proposeTarget.clientName}
                />
            )}
        </div>
    );
}
