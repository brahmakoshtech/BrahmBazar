'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { Upload, Plus, X, Check, Loader2, ChevronDown } from 'lucide-react';

const CustomDropdown = ({
    label,
    value,
    options,
    onChange,
    placeholder = "Select Option",
    disabled = false,
    onAddClick,
    loading = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`} ref={dropdownRef}>
            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`flex-1 px-5 py-3 rounded-xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 outline-none text-foreground font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-between group h-[46px] ${isOpen ? 'ring-2 ring-primary/50 border-primary' : ''}`}
                >
                    <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-primary/40 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'group-hover:text-primary'}`} />
                </button>

                {onAddClick && (
                    <button
                        type="button"
                        onClick={onAddClick}
                        disabled={disabled}
                        className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all border border-primary/10 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 h-[46px] w-[46px] flex items-center justify-center"
                        title="Quick Add"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-primary/10 py-1 z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {loading ? (
                        <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading...
                        </div>
                    ) : options.length > 0 ? (
                        options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-primary/5 hover:text-primary flex items-center justify-between ${value === opt.value ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
                            >
                                {opt.label}
                                {value === opt.value && <Check className="w-3.5 h-3.5" />}
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center text-xs text-muted-foreground italic">
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function AddProductPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: '',
        subcategory: '',
        description: '',
        stock: '',
    });
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [availableSubcategories, setAvailableSubcategories] = useState([]);

    // Quick Add State
    const [addingMode, setAddingMode] = useState(null); // 'category' | 'subcategory'
    const [newItemValue, setNewItemValue] = useState('');
    const [addingLoading, setAddingLoading] = useState(false);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data);
            return data;
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError('Failed to load categories. Please check your connection.');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            const selectedCat = categories.find(c => c.name === value);
            setAvailableSubcategories(selectedCat?.subcategories || []);
            setFormData({ ...formData, category: value, subcategory: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Wrapper for CustomDropdown changes
    const handleCategoryChange = (value) => {
        const selectedCat = categories.find(c => c.name === value);
        setAvailableSubcategories(selectedCat?.subcategories || []);
        setFormData(prev => ({ ...prev, category: value, subcategory: '' }));
    };

    const handleSubcategoryChange = (value) => {
        setFormData(prev => ({ ...prev, subcategory: value }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const oversizedFiles = selectedFiles.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            alert("Required 5MB or less to upload");
            return;
        }

        if (files.length + selectedFiles.length > 5) {
            alert('You can only upload a maximum of 5 images.');
            return;
        }

        setFiles(prev => [...prev, ...selectedFiles]);
        const newPreviews = selectedFiles.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name
        }));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleQuickAdd = async () => {
        if (!newItemValue.trim()) return;
        setAddingLoading(true);
        try {
            if (addingMode === 'category') {
                const { data: newCat } = await api.post('/api/categories', { name: newItemValue });
                const updatedCats = await fetchCategories();
                setFormData(prev => ({ ...prev, category: newCat.name }));
                // Update available subcategories immediately if any (empty for new cat)
                setAvailableSubcategories([]);
            } else if (addingMode === 'subcategory') {
                const currentCat = categories.find(c => c.name === formData.category);
                if (!currentCat) return;

                const { data: updatedCat } = await api.post(`/api/categories/${currentCat._id}/subcategories`, { name: newItemValue });
                await fetchCategories();

                // Update local state to reflect new subcat immediately
                const newSubcats = updatedCat.subcategories || [];
                setAvailableSubcategories(newSubcats);
                setFormData(prev => ({ ...prev, subcategory: newItemValue }));
            }
            setAddingMode(null);
            setNewItemValue('');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to add item');
        } finally {
            setAddingLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('price', formData.price);
        data.append('category', formData.category);
        data.append('subcategory', formData.subcategory);
        data.append('description', formData.description);
        data.append('stock', formData.stock);

        for (let i = 0; i < files.length; i++) {
            data.append('images', files[i]);
        }

        try {
            await api.post('/api/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            router.push('/admin/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-5xl mx-auto">
            <h1 className="text-2xl font-serif font-bold text-foreground mb-6 tracking-wide uppercase italic text-center md:text-left">
                Manifest New Artifact
            </h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-xs font-bold text-center border border-red-100">
                    Warning: {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-primary/10 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Title */}
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Artifact Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-5 py-3 rounded-xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all font-bold text-sm shadow-sm"
                        placeholder="e.g., Pure Silver Kalash"
                    />
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Sacred Investment (₹)</label>
                        <input
                            type="number"
                            name="price"
                            required
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all font-bold text-sm shadow-sm"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Inherent Stock</label>
                        <input
                            type="number"
                            name="stock"
                            required
                            value={formData.stock}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all font-bold text-sm shadow-sm"
                            placeholder="Units"
                        />
                    </div>
                </div>

                {/* Category & Subcategory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Category Selection */}
                    <div className="space-y-1.5 relative">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Sacred Category</label>

                        {addingMode === 'category' ? (
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 h-[46px]">
                                <input
                                    autoFocus
                                    type="text"
                                    value={newItemValue}
                                    onChange={(e) => setNewItemValue(e.target.value)}
                                    placeholder="New Category Name"
                                    className="flex-1 px-4 py-3 rounded-xl bg-white border border-primary/20 focus:ring-2 focus:ring-primary/50 outline-none text-sm font-bold h-full"
                                />
                                <button type="button" onClick={handleQuickAdd} disabled={addingLoading} className="h-full px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center">
                                    {addingLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                                </button>
                                <button type="button" onClick={() => { setAddingMode(null); setNewItemValue(''); }} className="h-full px-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <CustomDropdown
                                label="Sacred Category"
                                value={formData.category}
                                placeholder="SELECT DOMAIN"
                                options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
                                onChange={handleCategoryChange}
                                onAddClick={() => { setAddingMode('category'); setNewItemValue(''); }}
                            />
                        )}
                    </div>

                    {/* Subcategory Selection */}
                    <div className="space-y-1.5 relative">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Sub-Collection</label>

                        {addingMode === 'subcategory' ? (
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 h-[46px]">
                                <input
                                    autoFocus
                                    type="text"
                                    value={newItemValue}
                                    onChange={(e) => setNewItemValue(e.target.value)}
                                    placeholder="New Subcategory"
                                    className="flex-1 px-4 py-3 rounded-xl bg-white border border-primary/20 focus:ring-2 focus:ring-primary/50 outline-none text-sm font-bold h-full"
                                />
                                <button type="button" onClick={handleQuickAdd} disabled={addingLoading} className="h-full px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center">
                                    {addingLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                                </button>
                                <button type="button" onClick={() => { setAddingMode(null); setNewItemValue(''); }} className="h-full px-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <CustomDropdown
                                label="Sub-Collection"
                                value={formData.subcategory}
                                placeholder="SELECT BRANCH (OPTIONAL)"
                                options={availableSubcategories.map(sub => ({ value: sub.name, label: sub.name }))}
                                onChange={handleSubcategoryChange}
                                onAddClick={() => { setAddingMode('subcategory'); setNewItemValue(''); }}
                                disabled={!formData.category}
                            />
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Sacred Narrative</label>
                    <textarea
                        name="description"
                        required
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-5 py-3 rounded-2xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all font-medium text-sm shadow-inner italic custom-scrollbar"
                        placeholder="Describe the spiritual essence..."
                    ></textarea>
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Visual Offerings (Max 5)</label>

                    {previews.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-in fade-in">
                            {previews.map((preview, index) => (
                                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-primary/10 shadow-sm bg-gray-50">
                                    <img src={preview.url} alt={preview.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[9px] text-white truncate text-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                        {preview.name}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50"
                                        title="Remove Image"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {files.length < 5 && (
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-xl bg-white/40 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all aspect-square">
                                    <Upload className="w-6 h-6 text-primary/40 mb-1" />
                                    <span className="text-[9px] font-bold uppercase text-primary/60">Add More</span>
                                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            )}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-primary/20 rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all relative group bg-white/40">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                <Upload size={32} className="mb-2 text-primary/40 group-hover:scale-110 transition-transform duration-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Enshrine Imagery</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-primary/10">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/products')}
                        className="flex-1 py-3.5 rounded-xl font-bold bg-white text-muted-foreground hover:bg-gray-50 transition-all border border-primary/10 uppercase text-[10px] tracking-widest shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[10px] tracking-widest"
                    >
                        {loading ? 'Transmuting...' : 'Enshrine Artifact'}
                    </button>
                </div>
            </form>
        </div>
    );
}
