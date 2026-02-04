'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter Logic
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/api/products'),
                api.get('/api/categories')
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/api/products/${id}`);
                setProducts(products.filter((product) => product._id !== id));
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete product');
            }
        }
    };

    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    // Compute Filtered Products
    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter(p => p.category === selectedCategory);

    if (loading) return (
        <div className="p-8 space-y-6 animate-pulse">
            <div className="flex justify-between items-center mb-8">
                <div className="w-64 h-12 bg-white/40 rounded-full border border-primary/10" />
                <div className="w-40 h-10 bg-white/40 rounded-full border border-primary/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-64 w-full bg-white/40 rounded-3xl border border-primary/10 shadow-sm" />
                ))}
            </div>
        </div>
    );
    if (error) return <div className="p-6 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg m-6">Error: {error}</div>;

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Products Database</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Manage your sacred inventory with devotion.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Category Filter */}
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="appearance-none bg-white/60 backdrop-blur-md text-foreground px-6 py-3 pr-12 rounded-full border border-primary/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>

                    {/* View Toggles */}
                    <div className="flex bg-white/50 backdrop-blur-sm rounded-full p-1.5 border border-primary/10 shadow-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                            title="List View"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                            title="Grid View"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </button>
                    </div>

                    <Link
                        href="/admin/products/add"
                        className="bg-primary text-white px-8 py-3 rounded-full flex items-center gap-2 transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/10 active:scale-95"
                    >
                        <Plus size={16} /> New Essence
                    </Link>
                </div>
            </div>

            {viewMode === 'list' ? (
                /* LIST VIEW */
                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl shadow-primary/5 border border-primary/10 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-primary/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Visual</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Product Name</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Offering</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Spectrum</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Essence</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-primary/5 transition-all group">
                                        <td className="px-8 py-4">
                                            <div className="h-14 w-14 bg-background rounded-2xl overflow-hidden border border-primary/10 shadow-inner group-hover:scale-110 transition-transform">
                                                {/* Display first image if available, else placeholder */}
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-600 text-xs">No Img</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-sm text-foreground font-bold leading-tight">
                                            {product.title}
                                        </td>
                                        <td className="px-8 py-4 text-sm text-primary font-serif font-bold italic">
                                            ₹{product.price?.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-secondary/20">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-xs font-bold text-muted-foreground">
                                            {product.stock} Units
                                        </td>
                                        <td className="px-8 py-4 text-sm flex gap-3">
                                            <Link href={`/admin/products/${product._id}/edit`} className="p-2.5 bg-foreground/5 rounded-full text-muted-foreground hover:text-white hover:bg-foreground transition-all">
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => deleteHandler(product._id)}
                                                className="p-2.5 bg-red-50 rounded-full text-red-400 hover:text-white hover:bg-red-500 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No products found in this category.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="group bg-white/60 backdrop-blur-md rounded-3xl border border-primary/10 shadow-lg overflow-hidden hover:bg-white transition-all flex flex-col hover:shadow-2xl hover:shadow-primary/10">
                            <div className="relative aspect-video bg-background overflow-hidden shadow-inner">
                                {product.images && product.images[0] ? (
                                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase font-bold tracking-widest">No Image</div>
                                )}
                                <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                    <Link href={`/admin/products/${product._id}/edit`} className="p-3 bg-white/95 backdrop-blur rounded-full text-foreground hover:bg-foreground hover:text-background transition-all shadow-xl">
                                        <Edit size={16} />
                                    </Link>
                                    <button
                                        onClick={() => deleteHandler(product._id)}
                                        className="p-3 bg-white/95 backdrop-blur rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                {product.stock <= 0 && (
                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center">
                                        <span className="bg-red-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase shadow-lg">Sold Out</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{product.category}</span>
                                    <span className="text-primary font-serif font-bold italic">₹{product.price}</span>
                                </div>
                                <h3 className="text-foreground font-serif font-bold text-sm leading-tight mb-4 line-clamp-2 h-10">{product.title}</h3>
                                <div className="mt-auto pt-4 border-t border-primary/10 flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Units: {product.stock}</span>
                                    <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted-foreground bg-white/60 backdrop-blur-md rounded-3xl border border-primary/10">
                            No products found in filtering.
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
}
