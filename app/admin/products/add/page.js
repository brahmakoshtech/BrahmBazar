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
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-white tracking-wide mb-8">Add Product</h1>

            {error && <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-neutral-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/5 space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all font-sans"
                        placeholder="Product Name"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            required
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all font-sans"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stock</label>
                        <input
                            type="number"
                            name="stock"
                            required
                            value={formData.stock}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all font-sans"
                            placeholder="Available Quantity"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                    <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all font-sans"
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subcategory</label>
                    <select
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        disabled={availableSubcategories.length === 0}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">Select Subcategory (Optional)</option>
                        {availableSubcategories.map((sub, idx) => (
                            <option key={idx} value={sub.name}>{sub.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                        name="description"
                        required
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all font-sans custom-scrollbar"
                        placeholder="Product Description"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Images (Max 5)</label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-neutral-900 transition-all relative group">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={files.length >= 5}
                        />
                        <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                            <Upload size={32} className="mb-3" />
                            <span className="text-sm font-medium">Click to upload images</span>
                            <span className="text-xs text-gray-600 mt-1">{files.length}/5 selected</span>
                        </div>
                    </div>

                    {/* Image Previews */}
                    {previews.length > 0 && (
                        <div className="grid grid-cols-5 gap-4 mt-4">
                            {previews.map((src, index) => (
                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4 pt-6 border-t border-white/5">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/products')}
                        className="flex-1 py-3 rounded-xl font-bold bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl font-bold bg-primary text-black hover:bg-white hover:text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
