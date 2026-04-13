import { useState, useEffect, useCallback, useRef } from 'react';
import { Phone, Save, User, Mail, Pencil, Trash2 } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';
import { useAuthStore } from '@/stores/useAuthStore';
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
            const TARGET_SIZE = 400; // Tamanho ideal para foto de perfil
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
                TARGET_SIZE, // Dimensiona para o tamanho alvo
                TARGET_SIZE
            );
            resolve(canvas.toDataURL('image/jpeg', 0.80)); // 80% de qualidade para ser mais leve
        };
        image.onerror = reject;
        image.src = imageSrc;
    });
}

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
        } catch {
            addToast('error', 'Erro ao atualizar perfil.');
        } finally {
            setSaving(false);
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
        // Reset so the same file can be selected again
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
        <div className="space-y-6">
            <h1 className="font-heading text-2xl font-bold">Configurações</h1>

            <div className="bg-bg-card card-surface border border-border rounded-2xl p-6 max-w-lg mx-auto">
                <h2 className="font-heading font-semibold mb-6 flex items-center gap-2">
                    <User size={20} className="text-accent" />
                    Meus Dados
                </h2>

                {/* Profile Picture Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-bg-card ring-2 ring-accent/20 bg-bg-input flex items-center justify-center">
                            {profilePicture ? (
                                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} className="text-text-disabled" />
                            )}
                        </div>

                        {/* Edit button - left side */}
                        <button
                            onClick={openFilePicker}
                            className="absolute -left-2 bottom-1 w-9 h-9 rounded-full bg-accent text-bg-primary flex items-center justify-center shadow-lg shadow-accent/30 hover:bg-accent-hover hover:scale-110 transition-all"
                            title="Alterar foto"
                        >
                            <Pencil size={15} />
                        </button>

                        {/* Delete button - right side */}
                        {profilePicture && (
                            <button
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
