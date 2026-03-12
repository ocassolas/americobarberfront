import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Clock, Scissors, User } from 'lucide-react';
import { getServices, saveService, deleteService, getBarbers } from '@/services/api';
import { useToastStore } from '@/stores/useToastStore';
import { maskCurrency, parseCurrencyToNumber, onlyNumbers } from '@/utils/masks';
import type { Service, Barber } from '@/types';

export function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Service | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        Promise.all([getServices(), getBarbers()]).then(([sData, bData]) => {
            setServices(sData);
            setBarbers(bData);
            setLoading(false);
        });
    }, []);

    const formatPrice = (p: number) => p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const handleSave = async () => {
        if (!editing) return;
        if (!editing.barberId) {
            addToast('error', 'Selecione um barbeiro para este serviço.');
            return;
        }

        const saved = await saveService(editing);
        if (isNew) {
            setServices((prev) => [...prev, saved]);
        } else {
            setServices((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
        }
        setEditing(null);
        addToast('success', isNew ? 'Serviço criado!' : 'Serviço atualizado!');
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteService(deleteId);
        setServices((prev) => prev.filter((s) => s.id !== deleteId));
        setDeleteId(null);
        addToast('success', 'Serviço removido!');
    };

    const openNew = () => {
        setIsNew(true);
        setEditing({
            id: 0,
            name: '',
            durationMinutes: 30,
            price: 0,
            icon: 'scissors',
            description: '',
            active: true,
            barberId: barbers.length === 1 ? barbers[0].id : 0,
        });
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">Serviços</h1>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-bg-primary font-semibold px-4 py-2.5 rounded-xl transition text-sm"
                >
                    <Plus size={16} />
                    Novo Serviço
                </button>
            </div>

            <div className="space-y-2">
                {services.map((service) => (
                    <motion.div
                        key={service.id}
                        layout
                        className="bg-bg-card card-surface border border-border rounded-2xl p-4 flex items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                            <Scissors size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm">{service.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-[10px] text-text-secondary flex items-center gap-1">
                                    <Clock size={10} /> {service.durationMinutes}min
                                </p>
                                <p className="text-[10px] text-accent flex items-center gap-1">
                                    <User size={10} /> {barbers.find(b => b.id === service.barberId)?.name || 'Sem barbeiro'}
                                </p>
                            </div>
                        </div>
                        <span className="font-mono font-semibold text-accent text-sm">{formatPrice(service.price)}</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => { setIsNew(false); setEditing({ ...service }); }}
                                className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-accent transition"
                                aria-label="Editar serviço"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => setDeleteId(service.id)}
                                className="p-2 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition"
                                aria-label="Excluir serviço"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {editing && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-bg-card border border-border rounded-2xl p-6 max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-heading font-semibold">{isNew ? 'Novo Serviço' : 'Editar Serviço'}</h3>
                                <button onClick={() => setEditing(null)} className="p-1 hover:bg-white/10 rounded-lg transition" aria-label="Fechar">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium mb-1 block">Nome</label>
                                    <input
                                        value={editing.name}
                                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                        className="w-full bg-bg-input input-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:border-accent outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-1 block uppercase tracking-wider text-text-secondary">Barbeiro Responsável</label>
                                    <select
                                        value={editing.barberId}
                                        onChange={(e) => setEditing({ ...editing, barberId: parseInt(e.target.value, 10) })}
                                        className="w-full bg-bg-input input-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:border-accent outline-none transition"
                                    >
                                        <option value={0}>Selecione um barbeiro...</option>
                                        {barbers.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-1 block uppercase tracking-wider text-text-secondary">Descrição (opcional)</label>
                                    <input
                                        value={editing.description}
                                        onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                        className="w-full bg-bg-input input-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:border-accent outline-none transition"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Duração (min)</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={editing.durationMinutes}
                                            onChange={(e) => setEditing({ ...editing, durationMinutes: parseInt(onlyNumbers(e.target.value), 10) || 0 })}
                                            className="w-full bg-bg-input input-surface border border-border rounded-xl px-3 py-2.5 text-sm font-mono focus:border-accent outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Preço (R$)</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={maskCurrency(editing.price)}
                                            onChange={(e) => setEditing({ ...editing, price: parseCurrencyToNumber(e.target.value) })}
                                            className="w-full bg-bg-input input-surface border border-border rounded-xl px-3 py-2.5 text-sm font-mono focus:border-accent outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={!editing.name}
                                className="w-full mt-4 bg-accent hover:bg-accent-hover disabled:opacity-40 text-bg-primary font-semibold py-2.5 rounded-xl transition text-sm"
                            >
                                Salvar
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteId && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-bg-card border border-border rounded-2xl p-6 max-w-sm w-full text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Trash2 size={40} className="text-error mx-auto mb-3" />
                            <h3 className="font-heading font-semibold mb-1">Excluir Serviço</h3>
                            <p className="text-text-secondary text-sm mb-4">Esta ação não pode ser desfeita.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-white/5 transition">
                                    Cancelar
                                </button>
                                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-error text-white text-sm font-medium hover:bg-error/90 transition">
                                    Excluir
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
