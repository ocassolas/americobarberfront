import { useState } from 'react';
import { Building, Phone, MapPin, Save } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';
import { BUSINESS } from '@/config/constants';

export function AdminSettingsPage() {
    const [name, setName] = useState(BUSINESS.name);
    const [address, setAddress] = useState(BUSINESS.address);
    const [phone, setPhone] = useState(BUSINESS.phone);
    const [saving, setSaving] = useState(false);
    const addToast = useToastStore((s) => s.addToast);

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 500));
        addToast('success', 'Configurações salvas!');
        setSaving(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="font-heading text-2xl font-bold">Configurações</h1>

            <div className="bg-bg-card card-surface border border-border rounded-2xl p-6 max-w-lg mx-auto">
                <h2 className="font-heading font-semibold mb-4">Dados da Barbearia</h2>

                <div className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Building size={16} className="text-accent" />
                            Nome
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-bg-input input-surface border border-border rounded-xl px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <MapPin size={16} className="text-accent" />
                            Endereço
                        </label>
                        <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-bg-input input-surface border border-border rounded-xl px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Phone size={16} className="text-accent" />
                            Telefone
                        </label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-bg-input input-surface border border-border rounded-xl px-4 py-3 text-sm font-mono focus:border-accent focus:ring-1 focus:ring-accent/30 transition outline-none"
                        />
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
