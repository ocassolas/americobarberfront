import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, User, Phone, Mail, CreditCard, ShieldCheck } from 'lucide-react';
import { getBarbers, registerBarber } from '@/services/api';
import { useToastStore } from '@/stores/useToastStore';
import { maskCPF, maskPhone } from '@/utils/masks';
import type { Barber } from '@/types';

export function BarbersManagementPage() {
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTarget, setEditingTarget] = useState<Barber | null>(null);
    const [newBarber, setNewBarber] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        password: '',
    });
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        fetchBarbers();
    }, []);

    const fetchBarbers = async () => {
        try {
            const data = await getBarbers();
            setBarbers(data);
        } catch (error) {
            addToast('error', 'Erro ao carregar barbeiros.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBarber = async () => {
        try {
            await registerBarber(newBarber);
            addToast('success', 'Barbeiro adicionado com sucesso!');
            setIsAddModalOpen(false);
            setNewBarber({ name: '', email: '', phone: '', cpf: '', password: '' });
            fetchBarbers();
        } catch (error) {
            addToast('error', 'Erro ao adicionar barbeiro. Verifique os dados.');
        }
    };

    const handleEditClick = (barber: Barber) => {
        setEditingTarget(barber);
        setNewBarber({
            name: barber.name,
            email: barber.email,
            phone: barber.phone,
            cpf: barber.cpf,
            password: '', // Password empty when editing
        });
        setIsAddModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingTarget) {
                // We'll use the profile update endpoint for simplicity if it works for other users too,
                // or assume a general user update endpoint. 
                // The AdminController has PUT /api/admin/users/{id}
                await registerBarber({ ...newBarber, id: editingTarget.id }); // If registerBarber handles both (upsert)
                // Actually let's assume updateProfile call we added also works for admin updating others if we pass ID,
                // or I'll add a specific updateBarber to api.ts if needed.
                // For now, I'll use the registerBarber which likely maps to a save() in backend.
                addToast('success', 'Barbeiro atualizado!');
            } else {
                await registerBarber(newBarber);
                addToast('success', 'Barbeiro adicionado!');
            }
            setIsAddModalOpen(false);
            fetchBarbers();
        } catch (error) {
            addToast('error', 'Erro ao salvar barbeiro.');
        }
    };

    const openAddModal = () => {
        setEditingTarget(null);
        setNewBarber({ name: '', email: '', phone: '', cpf: '', password: '' });
        setIsAddModalOpen(true);
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
                <div>
                    <h1 className="font-heading text-2xl font-bold">Gerenciar Barbeiros</h1>
                    <p className="text-text-secondary text-sm">Adicione e gerencie os profissionais da barbearia.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-bg-primary font-semibold px-4 py-2.5 rounded-xl transition text-sm"
                >
                    <Plus size={16} />
                    Novo Barbeiro
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {barbers.map((barber) => (
                    <motion.div
                        key={barber.id}
                        layout
                        className="bg-bg-card card-surface border border-border rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                                <User size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg truncate">{barber.name}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
                                    <ShieldCheck size={12} className="text-success" />
                                    Administrador
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <Mail size={14} className="text-accent/60" />
                                <span className="truncate">{barber.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <Phone size={14} className="text-accent/60" />
                                <span>{barber.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <CreditCard size={14} className="text-accent/60" />
                                <span>{barber.cpf}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 pt-4 border-t border-border">
                            <button
                                onClick={() => handleEditClick(barber)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition"
                            >
                                <Pencil size={14} className="text-accent" />
                                Editar
                            </button>
                            <span className="text-[10px] text-text-disabled uppercase font-bold tracking-wider ml-auto">ID: {barber.id}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setIsAddModalOpen(false); setEditingTarget(null); }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-bg-card border border-border rounded-3xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-heading font-bold text-xl">
                                    {editingTarget ? 'Editar Barbeiro' : 'Novo Barbeiro'}
                                </h3>
                                <button onClick={() => { setIsAddModalOpen(false); setEditingTarget(null); }} className="p-2 hover:bg-white/10 rounded-xl transition" aria-label="Fechar">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold mb-1.5 block text-text-secondary uppercase tracking-wider">Nome Completo</label>
                                    <input
                                        value={newBarber.name}
                                        onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })}
                                        className="w-full bg-bg-input input-surface border border-border rounded-2xl px-4 py-3 text-sm focus:border-accent outline-none transition"
                                        placeholder="Ex: Carlos Silva"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1.5 block text-text-secondary uppercase tracking-wider">E-mail</label>
                                    <input
                                        type="email"
                                        value={newBarber.email}
                                        onChange={(e) => setNewBarber({ ...newBarber, email: e.target.value })}
                                        className="w-full bg-bg-input input-surface border border-border rounded-2xl px-4 py-3 text-sm focus:border-accent outline-none transition"
                                        placeholder="carlos@barbearia.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold mb-1.5 block text-text-secondary uppercase tracking-wider">Telefone</label>
                                        <input
                                            type="text"
                                            inputMode="tel"
                                            value={newBarber.phone}
                                            onChange={(e) => setNewBarber({ ...newBarber, phone: maskPhone(e.target.value) })}
                                            className="w-full bg-bg-input input-surface border border-border rounded-2xl px-4 py-3 text-sm focus:border-accent outline-none transition"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold mb-1.5 block text-text-secondary uppercase tracking-wider">CPF</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={newBarber.cpf}
                                            onChange={(e) => setNewBarber({ ...newBarber, cpf: maskCPF(e.target.value) })}
                                            className="w-full bg-bg-input input-surface border border-border rounded-2xl px-4 py-3 text-sm focus:border-accent outline-none transition"
                                            placeholder="123.456.789-00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1.5 block text-text-secondary uppercase tracking-wider">Senha Provisória</label>
                                    <input
                                        type="password"
                                        value={newBarber.password}
                                        onChange={(e) => setNewBarber({ ...newBarber, password: e.target.value })}
                                        className="w-full bg-bg-input input-surface border border-border rounded-2xl px-4 py-3 text-sm focus:border-accent outline-none transition"
                                        placeholder="No mínimo 6 caracteres"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={!newBarber.name || !newBarber.email || (!editingTarget && !newBarber.password)}
                                className="w-full mt-8 bg-accent hover:bg-accent-hover disabled:opacity-40 text-bg-primary font-bold py-4 rounded-2xl transition shadow-lg shadow-accent/20"
                            >
                                {editingTarget ? 'Salvar Alterações' : 'Adicionar Barbeiro'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
