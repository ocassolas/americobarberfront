import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image, Plus, Trash2, Edit3, X, Upload, Crop,
    ChevronUp, ChevronDown, Save, AlertTriangle, ZoomIn
} from 'lucide-react';
import { getAdminGallery, addGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto } from '@/services/api';
import type { GalleryPhoto } from '@/types';
import { useToastStore } from '@/stores/useToastStore';

/* ── Crop Modal ── */
function CropModal({
    imageSrc,
    onCrop,
    onClose,
}: {
    imageSrc: string;
    onCrop: (croppedDataUrl: string) => void;
    onClose: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [cropArea, setCropArea] = useState({ x: 0, y: 0, w: 200, h: 200 });
    const [dragging, setDragging] = useState<null | 'move' | 'resize'>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imgDims, setImgDims] = useState({ w: 0, h: 0, scale: 1 });

    const handleImageLoad = () => {
        const img = imgRef.current;
        const container = containerRef.current;
        if (!img || !container) return;

        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        const scale = Math.min(containerW / img.naturalWidth, containerH / img.naturalHeight, 1);
        const displayW = img.naturalWidth * scale;
        const displayH = img.naturalHeight * scale;

        setImgDims({ w: displayW, h: displayH, scale });

        const cropSize = Math.min(displayW, displayH) * 0.7;
        setCropArea({
            x: (displayW - cropSize) / 2,
            y: (displayH - cropSize) / 2,
            w: cropSize,
            h: cropSize,
        });
    };

    const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const offsetX = (rect.width - imgDims.w) / 2;
        const offsetY = (rect.height - imgDims.h) / 2;
        return { x: clientX - rect.left - offsetX, y: clientY - rect.top - offsetY };
    };

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent, type: 'move' | 'resize') => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getPointerPos(e);
        setDragging(type);
        setDragStart({ x: pos.x - cropArea.x, y: pos.y - cropArea.y });
    };

    const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!dragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const offsetX = (rect.width - imgDims.w) / 2;
        const offsetY = (rect.height - imgDims.h) / 2;
        const px = clientX - rect.left - offsetX;
        const py = clientY - rect.top - offsetY;

        if (dragging === 'move') {
            let nx = px - dragStart.x;
            let ny = py - dragStart.y;
            nx = Math.max(0, Math.min(nx, imgDims.w - cropArea.w));
            ny = Math.max(0, Math.min(ny, imgDims.h - cropArea.h));
            setCropArea(prev => ({ ...prev, x: nx, y: ny }));
        } else if (dragging === 'resize') {
            let nw = px - cropArea.x;
            let nh = py - cropArea.y;
            nw = Math.max(50, Math.min(nw, imgDims.w - cropArea.x));
            nh = Math.max(50, Math.min(nh, imgDims.h - cropArea.y));
            setCropArea(prev => ({ ...prev, w: nw, h: nh }));
        }
    }, [dragging, dragStart, cropArea.x, cropArea.y, cropArea.w, cropArea.h, imgDims.w, imgDims.h]);

    const handlePointerUp = useCallback(() => setDragging(null), []);

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handlePointerMove);
            window.addEventListener('mouseup', handlePointerUp);
            window.addEventListener('touchmove', handlePointerMove);
            window.addEventListener('touchend', handlePointerUp);
            return () => {
                window.removeEventListener('mousemove', handlePointerMove);
                window.removeEventListener('mouseup', handlePointerUp);
                window.removeEventListener('touchmove', handlePointerMove);
                window.removeEventListener('touchend', handlePointerUp);
            };
        }
    }, [dragging, handlePointerMove, handlePointerUp]);

    const executeCrop = () => {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;

        const { scale } = imgDims;
        const sx = cropArea.x / scale;
        const sy = cropArea.y / scale;
        const sw = cropArea.w / scale;
        const sh = cropArea.h / scale;

        const maxDim = 800;
        const outW = Math.min(sw, maxDim);
        const outH = Math.min(sh, maxDim * (sh / sw));

        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
        const dataUrl = canvas.toDataURL('image/webp', 0.85);
        onCrop(dataUrl);
    };

    return (
        <motion.div
            className="gallery-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="gallery-crop-modal"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="gallery-modal-header">
                    <h3><Crop size={20} /> Recortar Imagem</h3>
                    <button onClick={onClose} className="gallery-modal-close"><X size={20} /></button>
                </div>

                <div className="gallery-crop-container" ref={containerRef}>
                    <img
                        ref={imgRef}
                        src={imageSrc}
                        alt="Preview"
                        onLoad={handleImageLoad}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            display: 'block',
                            margin: '0 auto',
                            userSelect: 'none',
                            pointerEvents: 'none',
                        }}
                        crossOrigin="anonymous"
                    />
                    {imgDims.w > 0 && (
                        <div
                            className="gallery-crop-overlay"
                            style={{
                                position: 'absolute',
                                left: `calc(50% - ${imgDims.w / 2}px + ${cropArea.x}px)`,
                                top: `calc(50% - ${imgDims.h / 2}px + ${cropArea.y}px)`,
                                width: cropArea.w,
                                height: cropArea.h,
                            }}
                        >
                            {/* Move handle */}
                            <div
                                className="gallery-crop-move"
                                onMouseDown={e => handlePointerDown(e, 'move')}
                                onTouchStart={e => handlePointerDown(e, 'move')}
                            />
                            {/* Resize handle */}
                            <div
                                className="gallery-crop-resize"
                                onMouseDown={e => handlePointerDown(e, 'resize')}
                                onTouchStart={e => handlePointerDown(e, 'resize')}
                            />
                        </div>
                    )}
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div className="gallery-modal-actions">
                    <button className="gallery-btn gallery-btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="gallery-btn gallery-btn-primary" onClick={executeCrop}>
                        <Crop size={16} /> Aplicar Recorte
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ── Main Page ── */
export function GalleryManagementPage() {
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editPhoto, setEditPhoto] = useState<GalleryPhoto | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Add/Edit form state
    const [formImage, setFormImage] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const addToast = useToastStore(s => s.addToast);

    const fetchPhotos = async () => {
        try {
            const data = await getAdminGallery();
            setPhotos(data);
        } catch (err) {
            addToast('error', 'Erro ao carregar galeria');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    // File input
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            addToast('error', 'Selecione um arquivo de imagem');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            addToast('error', 'Imagem muito grande (máx. 10MB)');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            setCropSrc(dataUrl);
        };
        reader.readAsDataURL(file);

        // Clear input to allow re-selecting same file
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCropResult = (croppedDataUrl: string) => {
        setFormImage(croppedDataUrl);
        setCropSrc(null);
    };

    const openAddModal = () => {
        setFormImage('');
        setFormTitle('');
        setEditPhoto(null);
        setShowAddModal(true);
    };

    const openEditModal = (photo: GalleryPhoto) => {
        setFormImage(photo.imageData);
        setFormTitle(photo.title || '');
        setEditPhoto(photo);
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditPhoto(null);
        setFormImage('');
        setFormTitle('');
        setCropSrc(null);
    };

    const handleSave = async () => {
        if (!formImage) {
            addToast('error', 'Selecione uma imagem');
            return;
        }

        setSaving(true);
        try {
            if (editPhoto) {
                await updateGalleryPhoto(editPhoto.id, {
                    imageData: formImage,
                    title: formTitle || undefined,
                    displayOrder: editPhoto.displayOrder,
                });
                addToast('success', 'Foto atualizada!');
            } else {
                await addGalleryPhoto({
                    imageData: formImage,
                    title: formTitle || undefined,
                    displayOrder: photos.length,
                });
                addToast('success', 'Foto adicionada!');
            }
            closeModal();
            fetchPhotos();
        } catch (err) {
            addToast('error', 'Erro ao salvar foto');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteGalleryPhoto(id);
            addToast('success', 'Foto excluída!');
            setDeleteConfirm(null);
            fetchPhotos();
        } catch (err) {
            addToast('error', 'Erro ao excluir foto');
        }
    };

    const handleReorder = async (index: number, direction: 'up' | 'down') => {
        const newPhotos = [...photos];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newPhotos.length) return;

        // Swap
        [newPhotos[index], newPhotos[targetIndex]] = [newPhotos[targetIndex], newPhotos[index]];

        // Update display orders
        setPhotos(newPhotos);
        try {
            await Promise.all([
                updateGalleryPhoto(newPhotos[index].id, {
                    imageData: newPhotos[index].imageData,
                    title: newPhotos[index].title,
                    displayOrder: index,
                }),
                updateGalleryPhoto(newPhotos[targetIndex].id, {
                    imageData: newPhotos[targetIndex].imageData,
                    title: newPhotos[targetIndex].title,
                    displayOrder: targetIndex,
                }),
            ]);
        } catch {
            addToast('error', 'Erro ao reordenar');
            fetchPhotos();
        }
    };

    return (
        <div className="gallery-admin-page">
            {/* Header */}
            <div className="gallery-admin-header">
                <div>
                    <h1 className="gallery-admin-title">
                        <Image size={28} /> Galeria de Cortes
                    </h1>
                    <p className="gallery-admin-subtitle">
                        Gerencie as fotos exibidas na página inicial
                    </p>
                </div>
                <button className="gallery-btn gallery-btn-primary" onClick={openAddModal}>
                    <Plus size={18} /> Adicionar Foto
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="gallery-admin-loading">
                    <div className="gallery-spinner" />
                    <span>Carregando galeria...</span>
                </div>
            ) : photos.length === 0 ? (
                <div className="gallery-admin-empty">
                    <Image size={48} strokeWidth={1} />
                    <h3>Nenhuma foto na galeria</h3>
                    <p>Adicione fotos dos cortes para exibir na landing page</p>
                    <button className="gallery-btn gallery-btn-primary" onClick={openAddModal}>
                        <Plus size={18} /> Adicionar Primeira Foto
                    </button>
                </div>
            ) : (
                <div className="gallery-admin-grid">
                    <AnimatePresence mode="popLayout">
                        {photos.map((photo, idx) => (
                            <motion.div
                                key={photo.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                                className="gallery-admin-card"
                            >
                                <div className="gallery-admin-card-img" onClick={() => setPreviewImage(photo.imageData)}>
                                    <img src={photo.imageData} alt={photo.title || `Foto ${idx + 1}`} />
                                    <div className="gallery-admin-card-zoom">
                                        <ZoomIn size={20} />
                                    </div>
                                </div>
                                {photo.title && (
                                    <div className="gallery-admin-card-title">{photo.title}</div>
                                )}
                                <div className="gallery-admin-card-actions">
                                    <button
                                        className="gallery-icon-btn"
                                        onClick={() => handleReorder(idx, 'up')}
                                        disabled={idx === 0}
                                        title="Mover para cima"
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <button
                                        className="gallery-icon-btn"
                                        onClick={() => handleReorder(idx, 'down')}
                                        disabled={idx === photos.length - 1}
                                        title="Mover para baixo"
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                    <button
                                        className="gallery-icon-btn gallery-icon-btn-edit"
                                        onClick={() => openEditModal(photo)}
                                        title="Editar"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        className="gallery-icon-btn gallery-icon-btn-delete"
                                        onClick={() => setDeleteConfirm(photo.id)}
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        className="gallery-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                    >
                        <motion.div
                            className="gallery-add-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="gallery-modal-header">
                                <h3>
                                    {editPhoto ? <><Edit3 size={20} /> Editar Foto</> : <><Plus size={20} /> Nova Foto</>}
                                </h3>
                                <button onClick={closeModal} className="gallery-modal-close"><X size={20} /></button>
                            </div>

                            <div className="gallery-modal-body">
                                {/* Preview */}
                                <div className="gallery-upload-zone" onClick={() => fileInputRef.current?.click()}>
                                    {formImage ? (
                                        <img src={formImage} alt="Preview" className="gallery-upload-preview" />
                                    ) : (
                                        <div className="gallery-upload-placeholder">
                                            <Upload size={32} />
                                            <span>Clique para selecionar imagem</span>
                                            <span className="gallery-upload-hint">JPG, PNG ou WebP (máx. 10MB)</span>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                {formImage && (
                                    <button
                                        className="gallery-btn gallery-btn-secondary gallery-btn-full"
                                        onClick={() => setCropSrc(formImage)}
                                    >
                                        <Crop size={16} /> Recortar Imagem
                                    </button>
                                )}

                                {/* Title */}
                                <div className="gallery-form-group">
                                    <label>Título (opcional)</label>
                                    <input
                                        type="text"
                                        value={formTitle}
                                        onChange={e => setFormTitle(e.target.value)}
                                        placeholder="Ex: Degradê Americano"
                                        maxLength={100}
                                        className="gallery-input"
                                    />
                                </div>
                            </div>

                            <div className="gallery-modal-actions">
                                <button className="gallery-btn gallery-btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button
                                    className="gallery-btn gallery-btn-primary"
                                    onClick={handleSave}
                                    disabled={saving || !formImage}
                                >
                                    <Save size={16} /> {saving ? 'Salvando...' : editPhoto ? 'Salvar' : 'Adicionar'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Crop Modal */}
            <AnimatePresence>
                {cropSrc && (
                    <CropModal
                        imageSrc={cropSrc}
                        onCrop={handleCropResult}
                        onClose={() => setCropSrc(null)}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleteConfirm !== null && (
                    <motion.div
                        className="gallery-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            className="gallery-confirm-modal"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <AlertTriangle size={40} className="gallery-confirm-icon" />
                            <h3>Excluir foto?</h3>
                            <p>Essa ação não pode ser desfeita.</p>
                            <div className="gallery-modal-actions">
                                <button className="gallery-btn gallery-btn-secondary" onClick={() => setDeleteConfirm(null)}>
                                    Cancelar
                                </button>
                                <button className="gallery-btn gallery-btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                                    <Trash2 size={16} /> Excluir
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lightbox Preview */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        className="gallery-lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewImage(null)}
                    >
                        <button className="gallery-lightbox-close" onClick={() => setPreviewImage(null)}>
                            <X size={24} />
                        </button>
                        <motion.img
                            src={previewImage}
                            alt="Preview"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="gallery-lightbox-img"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
