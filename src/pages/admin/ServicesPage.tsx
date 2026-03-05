import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Clock, Scissors } from 'lucide-react';
import { getServices, saveService, deleteService } from '@/services/api';
import { useToastStore } from '@/stores/useToastStore';
import type { Service } from '@/types';

export function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Service | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        getServices().then((data) => { setServices(data); setLoading(false); });
    }, []);

    const formatPrice = (p: number) => p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const handleSave = async () => {
        if (!editing) return;
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
            id: `service-${Date.now()}`,
            name: '',
            duration: 30,
            price: 0,
            icon: 'scissors',
            description: '',
            active: true,
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
                            <p className="text-xs text-text-secondary">
                                <Clock size={10} className="inline mr-1" />{service.duration}min
                            </p>
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
                                    <label className="text-xs font-medium mb-1 block">Descrição</label>
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
                                            type="number"
                                            value={editing.duration}
                                            onChange={(e) => setEditing({ ...editing, duration: parseInt(e.target.value, 10) || 0 })}
                                            className="w-full bg-bg-input input-surface border border-border rounded-xl px-3 py-2.5 text-sm font-mono focus:border-accent outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Preço (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editing.price}
                                            onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
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
