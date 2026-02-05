'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, FolderOpen, Search, Upload } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { success, error: toastError } = useToast();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', image: '', isActive: true, subcategories: [] });
    const [newSubName, setNewSubName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Subcategory Modal State
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [selectedCategoryForSub, setSelectedCategoryForSub] = useState(null);
    const [subFormData, setSubFormData] = useState({ name: '', image: '' });
    const [showAddSubForm, setShowAddSubForm] = useState(false);


    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories/admin');
            setCategories(data);
        } catch (err) {
            console.error(err);
            toastError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', description: '', image: '', isActive: true, subcategories: [] });
        setNewSubName('');
        setEditingCategory(null);
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                image: category.image || '',
                isActive: category.isActive
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description || '');
            data.append('isActive', formData.isActive);
            if (formData.image) {
                data.append('image', formData.image);
            }
            if (!editingCategory && formData.subcategories.length > 0) {
                data.append('subcategories', JSON.stringify(formData.subcategories));
            }

            if (editingCategory) {
                await api.put(`/api/categories/${editingCategory._id}`, data);
                success('Category updated successfully');
            } else {
                await api.post('/api/categories', data);
                success('Category created successfully');
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (err) {
            toastError(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenSubModal = (category) => {
        setSelectedCategoryForSub(category);
        setSubFormData({ name: '', image: '' });
        setSubFormData({ name: '', image: '' });
        setShowAddSubForm(false);
        setIsSubModalOpen(true);
    };

    const handleAddSubcategory = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', subFormData.name);
            if (subFormData.image) {
                data.append('image', subFormData.image);
            }

            await api.post(`/api/categories/${selectedCategoryForSub._id}/subcategories`, data);
            success('Subcategory added successfully');

            // Refresh categories to show new subcategory count or data if we displayed it
            await fetchCategories();

            // Update the selected category in the modal to show the new subcategory immediately
            // We can either refetch this specific category or find it in the updated categories list
            // For now, let's just close the modal or refresh the list inside.
            // Better UX: update the local list
            const { data: categoriesData } = await api.get('/api/categories/admin');
            setCategories(categoriesData);
            const updatedCat = categoriesData.find(c => c._id === selectedCategoryForSub._id);
            setSelectedCategoryForSub(updatedCat);

            setSubFormData({ name: '', image: '' });
        } catch (err) {
            toastError(err.response?.data?.message || 'Failed to add subcategory');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/api/categories/${id}`);
            success('Category deleted');
            fetchCategories();
        } catch (err) {
            toastError('Failed to delete category');
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="p-8 space-y-6 animate-pulse">
            <div className="flex justify-between items-center mb-8">
                <div className="w-64 h-12 bg-white/40 rounded-full border border-primary/10" />
                <div className="w-40 h-10 bg-white/40 rounded-full border border-primary/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-64 w-full bg-white/40 rounded-3xl border border-primary/10 shadow-sm" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Category Matrix</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Organize your sacred collections with intent.</p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus size={16} />}
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-foreground text-white font-bold px-8 py-3.5 rounded-full shadow-xl shadow-primary/10 transition-all uppercase text-[10px] tracking-widest border-none"
                >
                    Add Collection
                </Button>
            </div>

            {/* Search */}
            <div className="relative mb-10 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                <input
                    type="text"
                    placeholder="Search sacred collections..."
                    className="w-full pl-12 pr-6 py-4 rounded-full bg-white/60 backdrop-blur-md border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 text-foreground placeholder-gray-400 transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Categories Grid */}
            {filteredCategories.length === 0 ? (
                <EmptyState
                    icon={<FolderOpen size={48} className="text-gray-600" />}
                    title="No categories found"
                    description="Get started by creating your first category."
                    actionLabel="Create Category"
                    onAction={() => handleOpenModal()}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredCategories.map((cat) => (
                        <div key={cat._id} className="group bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-primary/10 shadow-lg hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
                            <div className="h-52 bg-background relative overflow-hidden">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary/20 bg-primary/5">
                                        <FolderOpen size={64} strokeWidth={1} />
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className={`absolute bottom-4 left-4 px-4 py-1.5 text-[9px] font-bold rounded-full uppercase tracking-widest border shadow-sm backdrop-blur-md ${cat.isActive ? 'bg-green-500 text-white border-green-600' : 'bg-red-500 text-white border-red-600'}`}>
                                    {cat.isActive ? 'Public' : 'Hidden'}
                                </div>

                                {/* Actions Overlay */}
                                <div className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => handleOpenModal(cat)}
                                        className="p-3 bg-white text-foreground rounded-full hover:bg-primary hover:text-white transition-all shadow-xl hover:scale-110"
                                        title="Edit Domain"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenSubModal(cat)}
                                        className="p-3 bg-white text-foreground rounded-full hover:bg-foreground hover:text-white transition-all shadow-xl hover:scale-110"
                                        title="Manage Lineage"
                                    >
                                        <Plus size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat._id)}
                                        className="p-3 bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-xl hover:scale-110"
                                        title="Dissolve Domain"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors italic">{cat.name}</h3>
                                <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed italic">
                                    "{cat.description || 'A sacred collection awaiting manifestation details.'}"
                                </p>
                                <div className="mt-6 pt-6 border-t border-primary/5 flex items-center justify-between mt-auto">
                                    <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] bg-primary/5 px-3 py-1 rounded-full border border-primary/10 italic">
                                        {cat.subcategories?.length || 0} Branches
                                    </span>
                                    <span className="text-[9px] font-mono font-bold text-muted-foreground/40 italic">
                                        /{cat.slug}
                                    </span>
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
                title={editingCategory ? 'Edit Category' : 'New Category'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Collection Title</label>
                            <input
                                type="text"
                                required
                                className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground placeholder-gray-400 transition-all font-bold text-sm"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Artifact Image</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="category-image-upload"
                                    onChange={(e) => e.target.files[0] && setFormData({ ...formData, image: e.target.files[0] })}
                                />
                                <label
                                    htmlFor="category-image-upload"
                                    className="w-full flex flex-col items-center justify-center gap-2 px-5 py-6 rounded-2xl bg-white/50 border-2 border-dashed border-primary/20 hover:border-primary/50 cursor-pointer transition-all hover:bg-white/80"
                                >
                                    {formData.image instanceof File ? (
                                        <div className="text-center">
                                            <span className="text-sm font-bold text-primary">{formData.image.name}</span>
                                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Ready to upload</p>
                                        </div>
                                    ) : formData.image ? (
                                        <div className="flex items-center gap-3">
                                            <img src={formData.image} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Change Image</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="text-primary/50" size={24} />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Upload Essence Image</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Sacred Narrative</label>
                        <textarea
                            rows="4"
                            className="w-full px-5 py-4 rounded-3xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground placeholder-gray-400 transition-all custom-scrollbar font-medium text-sm leading-relaxed"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the essence of this collection..."
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
                        <label htmlFor="isActive" className="text-xs font-bold text-foreground uppercase tracking-widest cursor-pointer">Manifest in Temple (Public)</label>
                    </div>

                    {/* Subcategories (Create Mode Only) */}
                    {!editingCategory && (
                        <div className="space-y-4 pt-6 mt-6 border-t border-primary/10">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Initial Lineage (Subcategories)</label>

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    className="flex-1 px-5 py-3 rounded-2xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground placeholder-gray-400 transition-all font-bold text-sm shadow-inner"
                                    placeholder="Manifest branch (e.g. Pure Silver Items)"
                                    value={newSubName}
                                    onChange={(e) => setNewSubName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (newSubName.trim()) {
                                                setFormData({
                                                    ...formData,
                                                    subcategories: [...(formData.subcategories || []), { name: newSubName }]
                                                });
                                                setNewSubName('');
                                            }
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (newSubName.trim()) {
                                            setFormData({
                                                ...formData,
                                                subcategories: [...(formData.subcategories || []), { name: newSubName }]
                                            });
                                            setNewSubName('');
                                        }
                                    }}
                                    className="p-3 bg-primary text-white rounded-2xl hover:bg-foreground transition-all shadow-lg shadow-primary/20"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {/* List of to-be-added subcategories */}
                            {formData.subcategories && formData.subcategories.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {formData.subcategories.map((sub, idx) => (
                                        <span key={idx} className="bg-white border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-3 shadow-sm animate-in zoom-in-50 duration-300">
                                            {sub.name}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSubs = formData.subcategories.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, subcategories: newSubs });
                                                }}
                                                className="text-muted-foreground hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-6 border-t border-primary/10">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full px-8 text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Withdraw</Button>
                        <Button type="submit" variant="primary" isLoading={submitting} className="rounded-full px-10 bg-primary text-white shadow-xl shadow-primary/20 uppercase text-[10px] tracking-widest font-bold border-none">
                            {editingCategory ? 'Update Essence' : 'Manifest Collection'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* SUBCATEGORY MODAL */}
            <Modal
                isOpen={isSubModalOpen}
                onClose={() => setIsSubModalOpen(false)}
                title={`Manage Subcategories: ${selectedCategoryForSub?.name}`}
            >
                <div className="space-y-8">
                    {/* List Existing */}
                    <div>
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Current Lineage</h4>
                        {selectedCategoryForSub?.subcategories?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {selectedCategoryForSub.subcategories.map((sub, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white/40 p-5 rounded-[1.5rem] border border-primary/5 hover:border-primary/20 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-sm font-bold text-foreground">{sub.name}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">/{sub.slug}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-background/50 rounded-3xl p-8 border border-dashed border-primary/10 text-center">
                                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">No lineage established.</p>
                            </div>
                        )}
                    </div>

                    {/* Add New */}
                    <div className="border-t border-primary/10 pt-8">
                        {!showAddSubForm ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddSubForm(true)}
                                className="w-full flex items-center justify-center gap-3 border-dashed border-primary/20 hover:border-primary hover:text-primary transition-all text-muted-foreground py-6 rounded-[2rem] font-bold text-[10px] uppercase tracking-widest"
                            >
                                <Plus size={16} /> Establish New Branch
                            </Button>
                        ) : (
                            <form onSubmit={handleAddSubcategory} className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] italic">Branch Specification</h4>
                                    <button type="button" onClick={() => setShowAddSubForm(false)} className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest">Withdraw</button>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Branch Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground placeholder-gray-400 transition-all font-bold text-sm"
                                        value={subFormData.name}
                                        onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                                        placeholder="e.g. 108 Bead Mala"
                                    />
                                </div>
                                <Button type="submit" variant="primary" isLoading={submitting} className="w-full bg-foreground text-background hover:bg-secondary hover:text-white transition-all py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl border-none">
                                    Finalize Branch
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
