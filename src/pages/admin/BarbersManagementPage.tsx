import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, User, Phone, Mail, CreditCard, ShieldCheck } from 'lucide-react';
import { getBarbers, registerBarber, updateUser, deleteBarber } from '@/services/api';
import { useToastStore } from '@/stores/useToastStore';
import { maskCPF, maskPhone } from '@/utils/masks';
import type { Barber } from '@/types';

export function BarbersManagementPage() {
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTarget, setEditingTarget] = useState<Barber | null>(null);
    const [deletingTarget, setDeletingTarget] = useState<Barber | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newBarber, setNewBarber] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        password: '',
        description: '',
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
            addToast('error', 'Erro ao carregar Colaboradores.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBarber = async () => {
        try {
            await registerBarber(newBarber);
            addToast('success', 'Colaborador adicionado com sucesso!');
            setIsAddModalOpen(false);
            setNewBarber({ name: '', email: '', phone: '', cpf: '', password: '', description: '' });
            fetchBarbers();
        } catch (error) {
            addToast('error', 'Erro ao adicionar Colaborador. Verifique os dados.');
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
            description: barber.description || '',
        });
        setIsAddModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingTarget) {
                const updatePayload = { 
                    ...newBarber,
                    password: newBarber.password ? newBarber.password : undefined
                };
                await updateUser(editingTarget.id, updatePayload);
                addToast('success', 'Colaborador atualizado!');
            } else {
                await registerBarber(newBarber);
                addToast('success', 'Colaborador adicionado!');
            }
            setIsAddModalOpen(false);
            fetchBarbers();
        } catch (error) {
            addToast('error', 'Erro ao salvar Colaborador.');
        }
    };

    const handleDeleteClick = (barber: Barber) => {
        setDeletingTarget(barber);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingTarget) return;
        try {
            await deleteBarber(deletingTarget.id);
            addToast('success', 'Colaborador excluído com sucesso!');
            setIsDeleteModalOpen(false);
            setDeletingTarget(null);
            fetchBarbers();
        } catch (error) {
            addToast('error', 'Erro ao excluir colaborador.');
        }
    };

    const openAddModal = () => {
        setEditingTarget(null);
        setNewBarber({ name: '', email: '', phone: '', cpf: '', password: '', description: '' });
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
                    <h1 className="font-heading text-2xl font-bold">Gerenciar Colaboradores</h1>
                    <p className="text-text-secondary text-sm">Adicione e gerencie os profissionais da barbearia.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-bg-primary font-semibold px-4 py-2.5 rounded-xl transition text-sm"
                >
                    <Plus size={16} />
                    Novo Colaborador
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
                            <button
                                onClick={() => handleDeleteClick(barber)}
                                className="w-10 h-[34px] flex items-center justify-center rounded-xl bg-error/10 hover:bg-error/20 text-error transition"
                                title="Excluir Colaborador"
                            >
                                <Trash2 size={14} />
                            </button>
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
                                    {editingTarget ? 'Editar Colaborador' : 'Novo Colaborador'}
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
                                <div>
                                    <label className="text-xs font-semibold mb-1.5 block text-text-secondary uppercase tracking-wider">Breve Descrição / Bio</label>
                                    <textarea
                                        value={newBarber.description}
                                        onChange={(e) => setNewBarber({ ...newBarber, description: e.target.value })}
                                        className="w-full bg-bg-input input-surface border border-border rounded-2xl px-4 py-3 text-sm focus:border-accent outline-none transition resize-none h-24"
                                        placeholder="Ex: Especialista em cortes clássicos..."
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={!newBarber.name || !newBarber.email || (!editingTarget && !newBarber.password)}
                                className="w-full mt-8 bg-accent hover:bg-accent-hover disabled:opacity-40 text-bg-primary font-bold py-4 rounded-2xl transition shadow-lg shadow-accent/20"
                            >
                                {editingTarget ? 'Salvar Alterações' : 'Adicionar Colaborador'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && deletingTarget && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setIsDeleteModalOpen(false); setDeletingTarget(null); }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-bg-card border border-error/50 rounded-3xl p-6 max-w-sm w-full text-center relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-error/80" />
                            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="font-heading font-bold text-xl mb-2">Excluir Colaborador</h3>
                            <p className="text-text-secondary text-sm mb-6">
                                Tem certeza que deseja remover <strong>{deletingTarget.name}</strong>? Esta ação não pode ser desfeita.
                            </p>
                            
                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => { setIsDeleteModalOpen(false); setDeletingTarget(null); }}
                                    className="flex-1 bg-white/5 hover:bg-white/10 font-bold py-3.5 rounded-2xl transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 bg-error hover:bg-error-hover text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-error/20"
                                >
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
