'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, FolderOpen, Search } from 'lucide-react';
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
            if (editingCategory) {
                await api.put(`/api/categories/${editingCategory._id}`, formData);
                success('Category updated successfully');
            } else {
                await api.post('/api/categories', formData);
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
            await api.post(`/api/categories/${selectedCategoryForSub._id}/subcategories`, subFormData);
            success('Subcategory added successfully');

            // Refresh categories to show new subcategory count or data if we displayed it
            await fetchCategories();

            // Update the selected category in the modal to show the new subcategory immediately
            // We can either refetch this specific category or find it in the updated categories list
            // For now, let's just close the modal or refresh the list inside.
            // Better UX: update the local list
            const { data } = await api.get('/api/categories/admin');
            setCategories(data);
            const updatedCat = data.find(c => c._id === selectedCategoryForSub._id);
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
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="w-48 h-10 rounded-lg bg-neutral-900 border border-white/10" />
                <Skeleton className="w-32 h-10 rounded-lg bg-neutral-900 border border-white/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-2xl bg-neutral-900 border border-white/10" />
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Categories</h1>
                    <p className="text-gray-400 mt-1">Manage product categories</p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus size={20} />}
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-white hover:text-black text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
                >
                    Add Category
                </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-white/10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 text-white placeholder-gray-600 transition-all font-sans"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCategories.map((cat) => (
                        <div key={cat._id} className="group bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-white/5 shadow-lg hover:border-primary/30 transition-all overflow-hidden flex flex-col">
                            <div className="h-40 bg-neutral-900 relative overflow-hidden">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                        <FolderOpen size={48} />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(cat)}
                                        className="p-2 bg-white/90 backdrop-blur rounded-full text-black hover:bg-primary transition-all shadow-sm"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat._id)}
                                        className="p-2 bg-white/90 backdrop-blur rounded-full text-black hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Delete Category"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenSubModal(cat)}
                                        className="p-2 bg-white/90 backdrop-blur rounded-full text-black hover:bg-blue-500 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs font-bold px-3"
                                    >
                                        <Plus size={12} /> Sub
                                    </button>
                                </div>
                                <div className={`absolute bottom-3 left-3 px-2 py-1 text-xs font-bold rounded-md uppercase tracking-wide border ${cat.isActive ? 'bg-green-900/80 text-white border-green-500/30' : 'bg-red-900/80 text-white border-red-500/30'}`}>
                                    {cat.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
                                <p className="text-sm text-gray-400 line-clamp-2">{cat.description || 'No description'}</p>
                                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-600 font-mono text-right mt-auto">
                                    /{cat.slug}
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
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                        <textarea
                            rows="3"
                            className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all custom-scrollbar"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Image URL</label>
                        <input
                            type="url"
                            placeholder="https://..."
                            className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-5 h-5 rounded bg-neutral-900 border-gray-600 text-primary focus:ring-primary focus:ring-offset-gray-900"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-300">Active Status</label>
                    </div>

                    {/* Subcategories (Create Mode Only) */}
                    {!editingCategory && (
                        <div className="border-t border-white/10 pt-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subcategories</label>

                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all"
                                    placeholder="Add subcategory (e.g. 5 Mukhi)"
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
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        if (newSubName.trim()) {
                                            setFormData({
                                                ...formData,
                                                subcategories: [...(formData.subcategories || []), { name: newSubName }]
                                            });
                                            setNewSubName('');
                                        }
                                    }}
                                    className="border-primary/50 text-primary hover:bg-primary hover:text-black"
                                >
                                    <Plus size={18} />
                                </Button>
                            </div>

                            {/* List of to-be-added subcategories */}
                            {formData.subcategories && formData.subcategories.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.subcategories.map((sub, idx) => (
                                        <span key={idx} className="bg-white/10 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2 border border-white/5">
                                            {sub.name}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSubs = formData.subcategories.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, subcategories: newSubs });
                                                }}
                                                className="text-gray-400 hover:text-red-400"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5">Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={submitting} className="bg-primary hover:bg-white hover:text-black text-black font-bold border-none">
                            {editingCategory ? 'Save Changes' : 'Create Category'}
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
                <div className="space-y-6">
                    {/* List Existing */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Existing Subcategories</h4>
                        {selectedCategoryForSub?.subcategories?.length > 0 ? (
                            <ul className="space-y-2">
                                {selectedCategoryForSub.subcategories.map((sub, idx) => (
                                    <li key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                                        <span className="text-white">{sub.name}</span>
                                        <span className="text-xs text-gray-500 font-mono">/{sub.slug}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm italic">No subcategories yet.</p>
                        )}
                    </div>

                    {/* Add New */}
                    <div className="border-t border-white/10 pt-6">
                        {!showAddSubForm ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddSubForm(true)}
                                className="w-full flex items-center justify-center gap-2 border-dashed border-white/20 hover:border-primary hover:text-primary transition-colors text-gray-400 py-3"
                            >
                                <Plus size={18} /> Add New Subcategory
                            </Button>
                        ) : (
                            <form onSubmit={handleAddSubcategory} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Add New Subcategory</h4>
                                    <button type="button" onClick={() => setShowAddSubForm(false)} className="text-xs text-gray-500 hover:text-white">Cancel</button>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all"
                                        value={subFormData.name}
                                        onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                                        placeholder="e.g. Rudraksha Mala"
                                    />
                                </div>
                                <Button type="submit" variant="primary" isLoading={submitting} className="w-full bg-primary hover:bg-white hover:text-black text-black font-bold border-none">
                                    Add Subcategory
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
