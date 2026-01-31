'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Use public endpoint for better reliability
                const { data } = await api.get('/api/categories');
                setCategories(data);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setError('Failed to load categories. Please check your connection.');
            }
        };
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

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            alert('You can only upload a maximum of 5 images.');
            return;
        }

        setFiles(prev => [...prev, ...selectedFiles]);

        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
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
            await api.post('/api/products/add', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            router.push('/admin/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-10 tracking-wide uppercase italic text-center md:text-left">Manifest New Artifact</h1>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl mb-8 font-bold text-sm text-center shadow-sm">Warning: {error}</div>}

            <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-primary/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Artifact Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all font-bold text-sm shadow-inner"
                        placeholder="e.g., Pure Silver Kalash"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Sacred Investment (₹)</label>
                        <input
                            type="number"
                            name="price"
                            required
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all font-bold text-sm shadow-inner"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Inherent Stock</label>
                        <input
                            type="number"
                            name="stock"
                            required
                            value={formData.stock}
                            onChange={handleChange}
                            className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all font-bold text-sm shadow-inner"
                            placeholder="Available Units"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Sacred Category</label>
                        <select
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground font-bold text-xs uppercase tracking-widest transition-all appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="">Select Domain</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Sub-Collection</label>
                        <select
                            name="subcategory"
                            value={formData.subcategory}
                            onChange={handleChange}
                            disabled={availableSubcategories.length === 0}
                            className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground font-bold text-xs uppercase tracking-widest transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <option value="">Select Branch (Optional)</option>
                            {availableSubcategories.map((sub, idx) => (
                                <option key={idx} value={sub.name}>{sub.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Sacred Narrative (Description)</label>
                    <textarea
                        name="description"
                        required
                        rows="5"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-3xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all font-medium text-sm shadow-inner italic custom-scrollbar"
                        placeholder="Describe the spiritual essence..."
                    ></textarea>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Visual Offerings (Max 5)</label>
                    <div className="border-2 border-dashed border-primary/20 rounded-[2.5rem] p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all relative group bg-white/40 shadow-sm">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={files.length >= 5}
                        />
                        <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            <Upload size={40} className="mb-4 text-primary/40 group-hover:scale-110 transition-transform duration-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Enshrine Imagery</span>
                            <span className="text-[10px] text-muted-foreground/60 mt-2 font-medium italic">{files.length} of 5 Fragments Captured</span>
                        </div>
                    </div>

                    {/* Image Previews */}
                    {previews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-8 animate-in fade-in zoom-in-95 duration-500">
                            {previews.map((src, index) => (
                                <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-primary/10 shadow-lg hover:scale-105 transition-transform duration-500">
                                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-600 scale-75 group-hover:scale-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-primary/10">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/products')}
                        className="flex-1 py-4 rounded-full font-bold bg-white text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all border border-primary/10 uppercase text-[10px] tracking-widest shadow-sm"
                    >
                        Retreat
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 rounded-full font-bold bg-primary text-white hover:bg-foreground shadow-xl shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[10px] tracking-widest"
                    >
                        {loading ? 'Transmuting...' : 'Enshrine Artifact'}
                    </button>
                </div>
            </form>
        </div>
    );
}
