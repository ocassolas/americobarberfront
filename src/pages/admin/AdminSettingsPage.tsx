import { useState, useEffect } from 'react';
import { Building, Phone, MapPin, Save, User, Mail, Camera } from 'lucide-react';
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
    const [phone, setPhone] = useState(maskPhone(user?.phone || ''));
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
    const [description, setDescription] = useState(user?.description || '');
    const [saving, setSaving] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const addToast = useToastStore((s) => s.addToast);

    // Reaplica máscara quando o user é carregado/atualizado no store
    useEffect(() => {
        if (user?.phone) setPhone(maskPhone(user.phone));
    }, [user?.phone]);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validate = (): boolean => {
        let valid = true;
        if (!emailRegex.test(email.trim())) {
            setEmailError('E-mail inválido.');
            valid = false;
        } else {
            setEmailError('');
        }
        const digits = phone.replace(/\D/g, '');
        if (digits.length !== 11) {
            setPhoneError('Telefone deve ter 11 dígitos (DDD + número).');
            valid = false;
        } else {
            setPhoneError('');
        }
        return valid;
    };

    const handleSave = async () => {
        if (!validate()) {
            addToast('error', 'Verifique os campos destacados.');
            return;
        }
        setSaving(true);
        try {
            const updated = await updateProfile({ name, email, phone, profilePicture, description });
            setUser(updated);
            addToast('success', 'Perfil atualizado com sucesso!');
        } catch (error) {
            addToast('error', 'Erro ao atualizar perfil.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                addToast('error', 'A imagem deve ter no máximo 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
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

                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-bg-card ring-2 ring-accent/20 bg-bg-input flex items-center justify-center">
                            {profilePicture ? (
                                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} className="text-text-disabled" />
                            )}
                        </div>
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera size={24} className="text-white mb-1" />
                            <span className="text-xs font-semibold text-white">Alterar Foto</span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                </div>

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
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (emailError) setEmailError('');
                                }}
                                onBlur={() => {
                                    if (email && !emailRegex.test(email.trim())) setEmailError('E-mail inválido.');
                                }}
                                placeholder="voce@exemplo.com"
                                className={`w-full bg-bg-input border rounded-xl pl-11 pr-4 py-3 text-sm focus:border-accent outline-none transition ${emailError ? 'border-error' : 'border-border'}`}
                            />
                        </div>
                        {emailError && <p className="text-error text-xs mt-1 ml-1">{emailError}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5 ml-1">Telefone</label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent/50" size={18} />
                            <input
                                value={phone}
                                onChange={(e) => {
                                    setPhone(maskPhone(e.target.value));
                                    if (phoneError) setPhoneError('');
                                }}
                                onBlur={() => {
                                    const digits = phone.replace(/\D/g, '');
                                    if (phone && digits.length !== 11) setPhoneError('Telefone deve ter 11 dígitos (DDD + número).');
                                }}
                                placeholder="(11) 99999-9999"
                                maxLength={15}
                                className={`w-full bg-bg-input border rounded-xl pl-11 pr-4 py-3 text-sm font-mono focus:border-accent outline-none transition ${phoneError ? 'border-error' : 'border-border'}`}
                            />
                        </div>
                        {phoneError && <p className="text-error text-xs mt-1 ml-1">{phoneError}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5 ml-1">
                            <label className="block text-xs font-bold text-text-secondary uppercase">Breve Descrição / Bio</label>
                            {user?.descriptionUpdatedAt && (
                                <span className="text-[10px] text-text-disabled">Atualizado em: {new Date(user.descriptionUpdatedAt).toLocaleDateString('pt-BR')}</span>
                            )}
                        </div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition resize-none h-24"
                            placeholder="Especialista em..."
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
