'use client';

import { useEffect, useState, use } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

export default function EditProductPage({ params }) {
    // React's use() hook for unpacking params in Next.js 15+ (if applicable) or standard async prop
    // Assuming params is a Promise in recent Next.js versions or just object:
    // Safe handling:
    const router = useRouter();

    // In Next.js 15, params is a Promise. We need to unwrap it if it is one.
    // For safety, we can handle both, or check version. Usually standard component props work.
    // Wait, recent Next.js app dir changes made params awaitable.
    // Let's use `use(params)` pattern if we were using it, but standard params prop works mostly.
    // Simpler: Just rely on async wrapping or use standard prop access if not using advanced async features component-level.
    // BUT this is a client component ('use client'). Client components receive params as props directly in some versions, 
    // but in layout it's different.
    // Let's assume params is available directly as prop.
    const { id } = use(params);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: '',
        description: '',
        stock: '',
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/api/products/${id}`);
                setFormData({
                    title: data.title,
                    price: data.price,
                    category: data.category,
                    description: data.description,
                    stock: data.stock,
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('price', formData.price);
        data.append('category', formData.category);
        data.append('description', formData.description);
        data.append('stock', formData.stock);

        for (let i = 0; i < files.length; i++) {
            data.append('images', files[i]);
        }

        try {
            await api.put(`/api/products/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            router.push('/admin/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-6">Loading product...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-white tracking-wide mb-8">Edit Product</h1>

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
                    <input
                        type="text"
                        name="category"
                        required
                        value={formData.category} // Note: This should ideally be a select dropdown like Add Product
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all font-sans"
                        placeholder="Category Name"
                    />
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
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Images (Replace Existing)</label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-neutral-900 transition-all relative group">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                            <Upload size={32} className="mb-3" />
                            <span className="text-sm font-medium">Click to upload new images</span>
                            <span className="text-xs text-gray-600 mt-1">Supports: JPG, PNG, WEBP</span>
                            {files.length > 0 && (
                                <span className="mt-3 text-white bg-primary/20 px-3 py-1 rounded-full text-xs font-bold border border-primary/20">{files.length} file(s) selected</span>
                            )}
                        </div>
                    </div>
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
                        disabled={updating}
                        className="flex-1 py-3 rounded-xl font-bold bg-primary text-black hover:bg-white hover:text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updating ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
