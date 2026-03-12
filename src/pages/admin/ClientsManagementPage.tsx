import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Phone, Mail, Calendar, Filter, ChevronRight } from 'lucide-react';
import { getAdminClients } from '@/services/api';
import { useToastStore } from '@/stores/useToastStore';
import type { Barber } from '@/types'; // Using Barber type as it's the same structure for UserResponse

export function ClientsManagementPage() {
    const [clients, setClients] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const data = await getAdminClients();
            setClients(data);
        } catch (error) {
            addToast('error', 'Erro ao carregar clientes.');
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="skeleton h-12 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold">Clientes</h1>
                    <p className="text-text-secondary text-sm">Visualize e acompanhe a base de clientes do sistema.</p>
                </div>
                
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar por nome, email ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-bg-input border border-border rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-accent outline-none transition"
                    />
                </div>
            </div>

            {filteredClients.length === 0 ? (
                <div className="text-center py-20 bg-bg-card border border-border border-dashed rounded-3xl">
                    <User size={48} className="text-text-disabled mx-auto mb-4" />
                    <p className="text-text-secondary">Nenhum cliente encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClients.map((client) => (
                        <motion.div
                            key={client.id}
                            layout
                            className="bg-bg-card card-surface border border-border rounded-2xl p-4 hover:border-accent/30 transition-all group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center text-accent ring-2 ring-accent/10">
                                    <User size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold truncate">{client.name}</h3>
                                    <span className="text-[10px] text-text-disabled uppercase font-bold tracking-widest leading-none">Cliente #{client.id}</span>
                                </div>
                                <button className="p-2 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition">
                                    <ChevronRight size={16} className="text-text-secondary" />
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                                    <Mail size={14} className="text-accent/40" />
                                    <span className="truncate">{client.email}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                                    <Phone size={14} className="text-accent/40" />
                                    <span>{client.phone}</span>
                                </div>
                                {client.cpf && (
                                    <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                                        <Calendar size={14} className="text-accent/40" />
                                        <span>CPF: {client.cpf}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${client.active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                    {client.active ? 'Ativo' : 'Inativo'}
                                </span>
                                {/* Since we don't have totalAppointments in the Barber type, we'll omit the counter or keep it simple */}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
