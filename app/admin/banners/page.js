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
        <div className="space-y-4">
            <Skeleton className="w-full h-12 rounded-lg bg-neutral-900 border border-white/10" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 rounded-2xl bg-neutral-900 border border-white/10" />
                <Skeleton className="h-64 rounded-2xl bg-neutral-900 border border-white/10" />
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Banners</h1>
                    <p className="text-gray-400 mt-1">Manage promotional banners</p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus size={20} />}
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-white hover:text-black text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
                >
                    Create Banner
                </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search banners..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-white/10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 text-white placeholder-gray-600 transition-all font-sans"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Banners List */}
            {filteredBanners.length === 0 ? (
                <EmptyState
                    icon={<ImageIcon size={48} className="text-gray-600" />}
                    title="No banners found"
                    description="Create your first promotional banner to boost sales."
                    actionLabel="Create Banner"
                    onAction={() => handleOpenModal()}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBanners.map((banner) => (
                        <div key={banner._id} className="group bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-white/5 shadow-lg hover:border-primary/30 transition-all overflow-hidden flex flex-col">
                            {/* Banner Preview */}
                            <div className="aspect-video bg-neutral-900 relative overflow-hidden">
                                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                    <button
                                        onClick={() => handleOpenModal(banner)}
                                        className="p-3 bg-white rounded-full text-black hover:bg-primary transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner._id)}
                                        className="p-3 bg-white rounded-full text-black hover:bg-red-500 hover:text-white transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 delay-75"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="bg-black/75 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-md border border-white/10">
                                        {banner.position}
                                    </span>
                                    {!banner.isActive && (
                                        <span className="bg-red-900/80 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-red-500/30">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-white line-clamp-1" title={banner.title}>{banner.title}</h3>
                                    <span className="text-xs font-mono text-primary/80 bg-primary/10 px-2 py-1 rounded border border-primary/20">Order: {banner.displayOrder}</span>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-400">
                                    <span className="truncate max-w-[200px]">{banner.link || 'No Link'}</span>
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Banner Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Position</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white transition-all"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            >
                                {positions.map(pos => (
                                    <option key={pos.value} value={pos.value} className="bg-neutral-900 text-white">{pos.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Display Order</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white transition-all"
                                value={formData.displayOrder}
                                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Banner Image</label>
                        <div className="space-y-4">
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-neutral-900 hover:bg-white/5 transition-colors group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 text-gray-500 group-hover:text-primary transition-colors mb-2" />
                                        <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Click to upload image</p>
                                        <p className="text-xs text-gray-600 mt-1">SVG, PNG, JPG or WEBP</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            </div>

                            {previewUrl && (
                                <div className="relative h-40 rounded-xl overflow-hidden border border-white/10 bg-black/50">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                        <p className="text-xs text-white/80 font-mono">
                                            {selectedFile ? selectedFile.name : 'Current Image'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Target Link (Optional)</label>
                        <input
                            type="text"
                            placeholder="/category/men"
                            className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-5 h-5 rounded bg-neutral-900 border-gray-600 text-primary focus:ring-primary focus:ring-offset-gray-900"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-300">Active Status</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5">Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={submitting} className="bg-primary hover:bg-white hover:text-black text-black font-bold border-none">
                            {editingBanner ? 'Save Changes' : 'Create Banner'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
