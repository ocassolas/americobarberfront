import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, BellOff, User, Mail, Phone, Save, Loader2, Pencil, Trash2 } from 'lucide-react';
import { TEXT } from '@/config/constants';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { updateProfile } from '@/services/api';
import { maskPhone } from '@/utils/masks';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';

// Helper: create a cropped image from canvas
function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            const TARGET_SIZE = 400;
            const canvas = document.createElement('canvas');
            canvas.width = TARGET_SIZE;
            canvas.height = TARGET_SIZE;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context not available'));
            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                TARGET_SIZE,
                TARGET_SIZE
            );
            resolve(canvas.toDataURL('image/jpeg', 0.80));
        };
        image.onerror = reject;
        image.src = imageSrc;
    });
}

export function SettingsPage() {
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);
    const addToast = useToastStore((s) => s.addToast);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(maskPhone(user?.phone || ''));
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
    const [pushEnabled, setPushEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    // Crop state
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [rawImage, setRawImage] = useState('');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            addToast('error', 'Verifique os campos destacados.');
            return;
        }
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 15 * 1024 * 1024) {
            addToast('error', 'A imagem selecionada é muito pesada (máximo 15MB).');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setRawImage(reader.result as string);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleCropConfirm = async () => {
        if (!croppedAreaPixels || !rawImage) return;
        try {
            const croppedBase64 = await getCroppedImg(rawImage, croppedAreaPixels);
            setProfilePicture(croppedBase64);
            setCropModalOpen(false);
            setRawImage('');
        } catch {
            addToast('error', 'Erro ao recortar imagem.');
        }
    };

    const handleDeletePhoto = () => {
        setProfilePicture('');
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
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

                    {/* Profile Picture Section — same as admin */}
                    <div className="flex flex-col items-center gap-3 py-4">
                        <div className="relative mb-1">
                            {/* Avatar */}
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-bg-card ring-2 ring-accent/20 bg-bg-input flex items-center justify-center">
                                {profilePicture ? (
                                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={44} className="text-text-disabled" />
                                )}
                            </div>

                            {/* Edit button - left side */}
                            <button
                                type="button"
                                onClick={openFilePicker}
                                className="absolute -left-2 bottom-1 w-9 h-9 rounded-full bg-accent text-bg-primary flex items-center justify-center shadow-lg shadow-accent/30 hover:bg-accent-hover hover:scale-110 transition-all"
                                title="Alterar foto"
                            >
                                <Pencil size={15} />
                            </button>

                            {/* Delete button - right side */}
                            {profilePicture && (
                                <button
                                    type="button"
                                    onClick={handleDeletePhoto}
                                    className="absolute -right-2 bottom-1 w-9 h-9 rounded-full bg-accent text-bg-primary flex items-center justify-center shadow-lg shadow-accent/30 hover:bg-accent-hover hover:scale-110 transition-all"
                                    title="Excluir foto"
                                >
                                    <Trash2 size={15} />
                                </button>
                            )}
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

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
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                                onBlur={() => { if (email && !emailRegex.test(email.trim())) setEmailError('E-mail inválido.'); }}
                                placeholder="voce@exemplo.com"
                                className={`w-full bg-bg-input border rounded-xl pl-10 pr-4 py-3 text-xs focus:border-accent outline-none transition ${emailError ? 'border-error' : 'border-border'}`}
                            />
                        </div>
                        {emailError && <p className="text-error text-[10px] mt-1 ml-1">{emailError}</p>}
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5 ml-1">Telefone</label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" size={16} />
                            <input
                                value={phone}
                                onChange={(e) => { setPhone(maskPhone(e.target.value)); if (phoneError) setPhoneError(''); }}
                                onBlur={() => { const digits = phone.replace(/\D/g, ''); if (phone && digits.length !== 11) setPhoneError('Telefone deve ter 11 dígitos (DDD + número).'); }}
                                placeholder="(11) 99999-9999"
                                maxLength={15}
                                className={`w-full bg-bg-input border rounded-xl pl-10 pr-4 py-3 text-xs font-mono focus:border-accent outline-none transition ${phoneError ? 'border-error' : 'border-border'}`}
                            />
                        </div>
                        {phoneError && <p className="text-error text-[10px] mt-1 ml-1">{phoneError}</p>}
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

            {/* Crop Modal */}
            <AnimatePresence>
                {cropModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setCropModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-bg-card border border-border rounded-3xl w-full max-w-md max-h-[90dvh] overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-border">
                                <h3 className="font-heading font-bold text-lg text-center">Recortar Foto</h3>
                                <p className="text-text-secondary text-xs text-center mt-1">Arraste e ajuste o zoom para enquadrar</p>
                            </div>

                            {/* Crop Area */}
                            <div className="relative w-full" style={{ height: 'min(340px, 50vh)' }}>
                                <Cropper
                                    image={rawImage}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    cropShape="round"
                                    showGrid={false}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </div>

                            {/* Zoom Slider */}
                            <div className="px-6 py-3 border-t border-border">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-text-secondary">Zoom</span>
                                    <input
                                        type="range"
                                        min={1}
                                        max={3}
                                        step={0.05}
                                        value={zoom}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="flex-1 h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 px-6 py-4 border-t border-border">
                                <button
                                    onClick={() => { setCropModalOpen(false); setRawImage(''); }}
                                    className="flex-1 py-3 rounded-2xl border border-border text-sm font-bold hover:bg-white/5 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCropConfirm}
                                    className="flex-1 py-3 rounded-2xl bg-accent text-bg-primary text-sm font-bold hover:bg-accent-hover transition shadow-lg shadow-accent/20"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
