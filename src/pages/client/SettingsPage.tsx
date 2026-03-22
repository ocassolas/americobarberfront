import { useState } from 'react';
import { Bell, BellOff, User, Mail, Phone, Save, Loader2 } from 'lucide-react';
import { TEXT } from '@/config/constants';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { updateProfile } from '@/services/api';
import { maskPhone } from '@/utils/masks';

export function SettingsPage() {
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);
    const addToast = useToastStore((s) => s.addToast);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
    const [pushEnabled, setPushEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                addToast('error', 'Imagem muito grande. Máximo 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updated = await updateProfile({ name, email, phone, profilePicture });
            setUser(updated);
            addToast('success', 'Perfil atualizado com sucesso!');
        } catch {
            addToast('error', 'Erro ao atualizar perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-20 pb-8 min-h-screen px-4">
            <div className="max-w-lg mx-auto">
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-center mb-8">{TEXT.settings.title}</h1>

                <form onSubmit={handleSave} className="card-premium p-6 mb-6 space-y-4">
                    <h2 className="font-heading font-semibold flex items-center gap-2 mb-2 text-accent">
                        <User size={18} />
                        Seu Perfil
                    </h2>

                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full border-2 border-accent/30 overflow-hidden bg-bg-input flex items-center justify-center">
                                {profilePicture ? (
                                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-text-disabled" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-accent text-bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-accent-hover transition-colors shadow-lg">
                                <Save size={14} className="rotate-[-45deg]" /> {/* Usando Save como ícone de upload improvisado ou Lucide Camera se disponível */}
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Foto de Perfil</p>
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5 ml-1">Nome</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" size={16} />
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-xs focus:border-accent outline-none transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5 ml-1">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" size={16} />
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-xs focus:border-accent outline-none transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5 ml-1">Telefone</label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" size={16} />
                            <input
                                value={phone}
                                onChange={(e) => setPhone(maskPhone(e.target.value))}
                                className="w-full bg-bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-xs font-mono focus:border-accent outline-none transition"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-accent text-bg-primary rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-accent-hover transition disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Salvar Alterações
                    </button>
                </form>

                <div className="card-premium p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {pushEnabled ? (
                                <Bell size={20} className="text-accent" />
                            ) : (
                                <BellOff size={20} className="text-text-secondary" />
                            )}
                            <div>
                                <h3 className="font-medium text-sm">{TEXT.settings.notifications}</h3>
                                <p className="text-text-secondary text-xs">{TEXT.settings.notificationsDesc}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPushEnabled(!pushEnabled)}
                            className={`relative w-12 h-7 rounded-full transition-colors ${pushEnabled ? 'bg-accent' : 'bg-border'}`}
                            role="switch"
                            aria-checked={pushEnabled}
                            aria-label={TEXT.settings.notifications}
                        >
                            <div
                                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${pushEnabled ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
