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
        const selectedFiles = Array.from(e.target.files);
        const oversizedFiles = selectedFiles.filter(file => file.size > 5 * 1024 * 1024);

        if (oversizedFiles.length > 0) {
            alert("Required 5MB or less to upload");
            e.target.value = null;
            return;
        }

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

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="text-primary font-serif font-bold italic">Summoning Product Data...</div>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-10 tracking-wide uppercase italic">Refine Artifact</h1>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl mb-8 font-bold text-sm text-center shadow-sm">Error: {error}</div>}

            <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-primary/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Primal Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all font-bold text-sm shadow-inner"
                        placeholder="e.g., Sacred Rudraksha Mala"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Sacred Value (₹)</label>
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
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Artifact Presence (Stock)</label>
                        <input
                            type="number"
                            name="stock"
                            required
                            value={formData.stock}
                            onChange={handleChange}
                            className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all font-bold text-sm shadow-inner"
                            placeholder="Available Count"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Class Hierarchy (Category)</label>
                    <input
                        type="text"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all font-bold text-sm shadow-inner"
                        placeholder="Collection Name"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Esoteric Inscription (Description)</label>
                    <textarea
                        name="description"
                        required
                        rows="5"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-3xl bg-white border border-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all font-medium text-sm shadow-inner custom-scrollbar italic"
                        placeholder="Detail the spiritual essence..."
                    ></textarea>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Visual Manifestation (Replace Existing Images)</label>
                    <div className="border-2 border-dashed border-primary/20 rounded-[2rem] p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all relative group shadow-sm bg-white/40">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            <Upload size={40} className="mb-4 text-primary/40 group-hover:text-primary/100 transition-all duration-500" />
                            <span className="text-xs font-bold uppercase tracking-widest">Enshrine New Imagery</span>
                            <span className="text-[10px] text-muted-foreground/60 mt-2 font-medium">JPEG, PNG, WEBP Archives</span>
                            {files.length > 0 && (
                                <span className="mt-4 text-white bg-primary px-5 py-2 rounded-full text-[10px] font-bold border border-transparent shadow-lg shadow-primary/20 animate-bounce">{files.length} New Scroll(s) Captured</span>
                            )}
                        </div>
                    </div>
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
                        disabled={updating}
                        className="flex-1 py-4 rounded-full font-bold bg-primary text-white hover:bg-foreground shadow-xl shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[10px] tracking-widest"
                    >
                        {updating ? 'Transmuting...' : 'Seal Refinements'}
                    </button>
                </div>
            </form>
        </div>
    );
}
