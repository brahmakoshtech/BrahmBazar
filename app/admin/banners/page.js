'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search, ExternalLink, UploadCloud } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

export default function BannersPage() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { success, error: toastError } = useToast();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        link: '',
        position: 'home-hero',
        displayOrder: 0,
        isActive: true
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const positions = [
        { value: 'home-hero', label: 'Home Hero (Carousel)' },
        { value: 'home-secondary', label: 'Home Secondary' },
        { value: 'category-top', label: 'Category Top' },
        { value: 'sidebar', label: 'Sidebar Ad' },
    ];

    const fetchBanners = async () => {
        try {
            const { data } = await api.get('/api/banners/admin');
            setBanners(data);
        } catch (err) {
            console.error(err);
            toastError('Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const resetForm = () => {
        setFormData({ title: '', image: '', link: '', position: 'home-hero', displayOrder: 0, isActive: true });
        setSelectedFile(null);
        setPreviewUrl('');
        setEditingBanner(null);
    };

    const handleOpenModal = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title,
                image: banner.image,
                link: banner.link || '',
                position: banner.position,
                displayOrder: banner.displayOrder,
                isActive: banner.isActive
            });
            setPreviewUrl(banner.image);
            setSelectedFile(null);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toastError("Required 5MB or less to upload");
                e.target.value = null;
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('link', formData.link);
            data.append('position', formData.position);
            data.append('displayOrder', formData.displayOrder);
            data.append('isActive', formData.isActive);

            if (selectedFile) {
                data.append('image', selectedFile);
            } else {
                data.append('image', formData.image);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            if (editingBanner) {
                await api.put(`/api/banners/${editingBanner._id}`, data, config);
                success('Banner updated successfully');
            } else {
                await api.post('/api/banners', data, config);
                success('Banner created successfully');
            }
            setIsModalOpen(false);
            fetchBanners();
        } catch (err) {
            toastError(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        try {
            await api.delete(`/api/banners/${id}`);
            success('Banner deleted');
            fetchBanners();
        } catch (err) {
            toastError('Failed to delete banner');
        }
    };

    const filteredBanners = banners.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="p-8 space-y-6 animate-pulse">
            <div className="flex justify-between items-center mb-8">
                <div className="w-64 h-12 bg-white/40 rounded-full border border-primary/10" />
                <div className="w-40 h-10 bg-white/40 rounded-full border border-primary/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-64 w-full bg-white/40 rounded-[2.5rem] border border-primary/10 shadow-sm" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Visual Proclamations</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Govern the sacred imagery of your temple.</p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus size={16} />}
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-foreground text-white font-bold px-8 py-3.5 rounded-full shadow-xl shadow-primary/10 transition-all uppercase text-[10px] tracking-widest border-none"
                >
                    Manifest Banner
                </Button>
            </div>

            {/* Search */}
            <div className="relative mb-10 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                <input
                    type="text"
                    placeholder="Search sacred imagery..."
                    className="w-full pl-12 pr-6 py-4 rounded-full bg-white/60 backdrop-blur-md border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 text-foreground placeholder-gray-400 transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Banners List */}
            {filteredBanners.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-primary/10 p-20 text-center animate-in fade-in slide-in-from-bottom-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ImageIcon size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-foreground mb-2">The Altar is Bare</h3>
                    <p className="text-muted-foreground mb-8">Establish your first visual proclamation to inspire visitors.</p>
                    <Button onClick={() => handleOpenModal()} className="rounded-full px-8 uppercase text-[10px] tracking-widest font-bold">Manifest Imagery</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBanners.map((banner) => (
                        <div key={banner._id} className="group bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-primary/10 shadow-lg hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-500">
                            {/* Banner Preview */}
                            <div className="aspect-video bg-background relative overflow-hidden shadow-inner">
                                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                    <button
                                        onClick={() => handleOpenModal(banner)}
                                        className="p-4 bg-white rounded-full text-foreground hover:bg-foreground hover:text-background transition-all shadow-2xl transform translate-y-4 group-hover:translate-y-0"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner._id)}
                                        className="p-4 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-2xl transform translate-y-4 group-hover:translate-y-0 delay-75"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-white/95 text-primary text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg border border-primary/10">
                                        {banner.position}
                                    </span>
                                    {!banner.isActive && (
                                        <span className="bg-red-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
                                            Hidden
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1 block">Manifestation Order: {banner.displayOrder}</span>
                                        <h3 className="text-xl font-serif font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors" title={banner.title}>{banner.title}</h3>
                                    </div>
                                </div>
                                <div className="mt-auto pt-6 border-t border-primary/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic h-4">
                                    <span className="truncate max-w-[180px]">{banner.link || 'Internal Flow Only'}</span>
                                    {banner.link && <ExternalLink size={14} className="flex-shrink-0 text-primary" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE/EDIT MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingBanner ? 'Edit Banner' : 'New Banner'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Sacred Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground placeholder-gray-400 transition-all font-bold text-sm"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Altar Position</label>
                            <select
                                className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground transition-all font-bold text-sm appearance-none cursor-pointer"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            >
                                {positions.map(pos => (
                                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Manifestation Order</label>
                            <input
                                type="number"
                                className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground transition-all font-bold text-sm"
                                value={formData.displayOrder}
                                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Sacred Artifact (Image)</label>
                        <div className="space-y-6">
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary/20 rounded-[2rem] cursor-pointer bg-primary/5 hover:bg-primary/10 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3">
                                            <UploadCloud className="w-6 h-6 text-primary" />
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enshrine New Image</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            </div>

                            {previewUrl && (
                                <div className="relative h-56 rounded-[2.5rem] overflow-hidden border border-primary/10 bg-background shadow-inner">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                        <p className="text-[9px] text-white/80 font-bold uppercase tracking-[0.2em]">
                                            {selectedFile ? selectedFile.name : 'Current Manifestation'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Target Path (Optional)</label>
                        <input
                            type="text"
                            placeholder="/category/sacred-tools"
                            className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground placeholder-gray-400 transition-all font-bold text-sm italic"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10 w-fit">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-6 h-6 rounded-lg bg-white border-primary/20 text-primary focus:ring-primary"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label htmlFor="isActive" className="text-[10px] font-bold text-foreground uppercase tracking-widest cursor-pointer">Manifest in Temple (Active)</label>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-primary/10 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full px-8 text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Withdraw</Button>
                        <Button type="submit" variant="primary" isLoading={submitting} className="rounded-full px-10 bg-primary text-white shadow-xl shadow-primary/20 uppercase text-[10px] tracking-widest font-bold border-none">
                            {editingBanner ? 'Finalize Changes' : 'Manifest Imagery'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
