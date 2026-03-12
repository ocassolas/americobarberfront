import { useState, useEffect } from 'react';
import { Building, Phone, MapPin, Save, User, Mail } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { BUSINESS } from '@/config/constants';
import { updateProfile } from '@/services/api';
import { maskPhone } from '@/utils/masks';

export function AdminSettingsPage() {
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);
    
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [saving, setSaving] = useState(false);
    const addToast = useToastStore((s) => s.addToast);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await updateProfile({ name, email, phone });
            setUser(updated);
            addToast('success', 'Perfil atualizado com sucesso!');
        } catch (error) {
            addToast('error', 'Erro ao atualizar perfil.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="font-heading text-2xl font-bold">Configurações</h1>

            <div className="bg-bg-card card-surface border border-border rounded-2xl p-6 max-w-lg mx-auto">
                <h2 className="font-heading font-semibold mb-6 flex items-center gap-2">
                    <User size={20} className="text-accent" />
                    Meus Dados
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5 ml-1">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent/50" size={18} />
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-bg-input border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:border-accent outline-none transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5 ml-1">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent/50" size={18} />
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-bg-input border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:border-accent outline-none transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5 ml-1">Telefone</label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent/50" size={18} />
                            <input
                                value={phone}
                                onChange={(e) => setPhone(maskPhone(e.target.value))}
                                className="w-full bg-bg-input border border-border rounded-xl pl-11 pr-4 py-3 text-sm font-mono focus:border-accent outline-none transition"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-bg-primary font-semibold px-6 py-3 rounded-xl transition text-sm"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        Salvar Configurações
                    </button>
                </div>
            </div>
        </div>
    );
}
