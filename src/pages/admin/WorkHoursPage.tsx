import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Save, Plus, X, Calendar } from 'lucide-react';
import type { WorkSchedule, DayOff, UserResponse } from '@/types';
import { updateSlotInterval, getBarbers, getSchedules, saveSchedule } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function WorkHoursPage() {
    const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newDayOff, setNewDayOff] = useState<{ barberId: number; date: string; reason: string } | null>(null);
    const [slotInterval, setSlotInterval] = useState(30);
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        getSchedules().then((data) => { setSchedules(data); setLoading(false); });
        
        // Fetch current slot interval
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
            getBarbers().then(barbers => {
                const me = barbers.find(b => b.id === userId);
                if (me) setSlotInterval(me.slotIntervalMinutes);
            });
        }
    }, []);

    const handleToggleDay = (barberIdx: number, dayOfWeek: number) => {
        setSchedules((prev) => {
            const copy = [...prev];
            const schedule = { ...copy[barberIdx] };
            schedule.workDays = schedule.workDays.map((wd) =>
                wd.dayOfWeek === dayOfWeek ? { ...wd, enabled: !wd.enabled } : wd
            );
            copy[barberIdx] = schedule;
            return copy;
        });
    };

    const handleTimeChange = (barberIdx: number, dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
        setSchedules((prev) => {
            const copy = [...prev];
            const schedule = { ...copy[barberIdx] };
            schedule.workDays = schedule.workDays.map((wd) =>
                wd.dayOfWeek === dayOfWeek ? { ...wd, [field]: value } : wd
            );
            copy[barberIdx] = schedule;
            return copy;
        });
    };

    const handleSave = async (schedule: WorkSchedule) => {
        setSaving(true);
        try {
            await saveSchedule(schedule);
            await updateSlotInterval(slotInterval);
            addToast('success', `Configurações de ${schedule.barberName} salvas!`);
        } catch (err) {
            addToast('error', 'Erro ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddDayOff = (barberId: number) => {
        setNewDayOff({ barberId, date: '', reason: '' });
    };

    const confirmDayOff = () => {
        if (!newDayOff || !newDayOff.date) return;
        setSchedules((prev) =>
            prev.map((s) => {
                if (s.barberId !== newDayOff.barberId) return s;
                return {
                    ...s,
                    daysOff: [...s.daysOff, { id: `off-${Date.now()}`, barberId: newDayOff.barberId, date: newDayOff.date, reason: newDayOff.reason }],
                };
            })
        );
        setNewDayOff(null);
        addToast('success', 'Folga adicionada!');
    };

    const removeDayOff = (barberId: number, offId: string | number) => {
        setSchedules((prev) =>
            prev.map((s) => {
                if (s.barberId !== barberId) return s;
                return { ...s, daysOff: s.daysOff.filter((d) => d.id !== offId) };
            })
        );
    };

    if (loading) {
        return <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="font-heading text-2xl font-bold">Horários de Trabalho</h1>

            {schedules.map((schedule, barberIdx) => (
                <div key={schedule.barberId} className="bg-bg-card card-surface border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading font-semibold">{schedule.barberName}</h2>
                        <button
                            onClick={() => handleSave(schedule)}
                            disabled={saving}
                            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-bg-primary font-semibold px-4 py-2 rounded-xl transition text-sm"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={14} />
                                    Salvar
                                </>
                            )}
                        </button>
                    </div>

                    {/* Slot Interval */}
                    <div className="mb-6 pb-6 border-b border-border">
                        <label className="flex items-center gap-2 text-sm font-medium mb-3">
                            <Clock size={16} className="text-accent" />
                            Intervalo de Agendamento
                            <span className="text-xs text-text-disabled font-normal">(Tempo entre um horário e outro)</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[15, 30, 45, 60].map((mins) => (
                                <button
                                    key={mins}
                                    onClick={() => setSlotInterval(mins)}
                                    className={`py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                                        slotInterval === mins 
                                            ? 'border-accent bg-accent/10 text-accent font-bold' 
                                            : 'border-border hover:border-accent/30'
                                    }`}
                                >
                                    {mins} min
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Work days */}
                    <div className="space-y-2 mb-6">
                        {schedule.workDays.map((wd) => (
                            <div key={wd.dayOfWeek} className="flex items-center gap-3 py-2">
                                <button
                                    onClick={() => handleToggleDay(barberIdx, wd.dayOfWeek)}
                                    className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${wd.enabled ? 'bg-accent' : 'bg-border'}`}
                                    role="switch"
                                    aria-checked={wd.enabled}
                                    aria-label={`${DAY_NAMES[wd.dayOfWeek]} ativo`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${wd.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                </button>
                                <span className={`text-sm w-20 ${wd.enabled ? '' : 'text-text-disabled'}`}>{DAY_NAMES[wd.dayOfWeek]}</span>
                                {wd.enabled && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="time"
                                            value={wd.openTime}
                                            onChange={(e) => handleTimeChange(barberIdx, wd.dayOfWeek, 'openTime', e.target.value)}
                                            className="bg-bg-input input-surface border border-border rounded-lg px-2 py-1 text-xs font-mono focus:border-accent outline-none transition"
                                        />
                                        <span className="text-text-secondary text-xs">até</span>
                                        <input
                                            type="time"
                                            value={wd.closeTime}
                                            onChange={(e) => handleTimeChange(barberIdx, wd.dayOfWeek, 'closeTime', e.target.value)}
                                            className="bg-bg-input input-surface border border-border rounded-lg px-2 py-1 text-xs font-mono focus:border-accent outline-none transition"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Days off */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-text-secondary">Folgas</h3>
                            <button
                                onClick={() => handleAddDayOff(schedule.barberId)}
                                className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition"
                            >
                                <Plus size={14} />
                                Adicionar folga
                            </button>
                        </div>
                        {schedule.daysOff.length === 0 && (
                            <p className="text-xs text-text-disabled">Nenhuma folga cadastrada</p>
                        )}
                        <div className="space-y-1">
                            {schedule.daysOff.map((off) => (
                                <div key={off.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-bg-input">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={12} className="text-text-secondary" />
                                        <span className="text-xs font-mono">{off.date.split('-').reverse().join('/')}</span>
                                        {off.reason && <span className="text-xs text-text-secondary">— {off.reason}</span>}
                                    </div>
                                    <button
                                        onClick={() => removeDayOff(schedule.barberId, off.id)}
                                        className="p-1 hover:bg-error/10 rounded text-text-secondary hover:text-error transition"
                                        aria-label="Remover folga"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            {/* Add day off modal */}
            {newDayOff && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setNewDayOff(null)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-bg-card border border-border rounded-2xl p-6 max-w-xs w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-heading font-semibold mb-4">Adicionar Folga</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium mb-1 block">Data</label>
                                <input
                                    type="date"
                                    value={newDayOff.date}
                                    onChange={(e) => setNewDayOff({ ...newDayOff, date: e.target.value })}
                                    className="w-full bg-bg-input input-surface border border-border rounded-xl px-3 py-2.5 text-sm font-mono focus:border-accent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">Motivo (opcional)</label>
                                <input
                                    value={newDayOff.reason}
                                    onChange={(e) => setNewDayOff({ ...newDayOff, reason: e.target.value })}
                                    className="w-full bg-bg-input input-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:border-accent outline-none transition"
                                    placeholder="Ex: consulta médica"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setNewDayOff(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-white/5 transition">
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDayOff}
                                disabled={!newDayOff.date}
                                className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 text-bg-primary text-sm font-medium transition"
                            >
                                Adicionar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
