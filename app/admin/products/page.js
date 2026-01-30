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
        <div className="p-6 space-y-4">
            <div className="flex justify-between">
                <div className="w-48 h-10 bg-neutral-900 rounded-lg animate-pulse border border-white/10" />
                <div className="w-32 h-10 bg-neutral-900 rounded-lg animate-pulse border border-white/10" />
            </div>
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full h-16 bg-neutral-900 rounded-lg animate-pulse border border-white/10" />
                ))}
            </div>
        </div>
    );
    if (error) return <div className="p-6 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg m-6">Error: {error}</div>;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Products</h1>
                    <p className="text-gray-400 mt-1">Manage your spiritual types</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Category Filter */}
                    <div className="relative group">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="appearance-none bg-neutral-900 text-white px-4 py-2 pr-8 rounded-lg border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:border-white/30 transition-all font-medium text-sm"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>

                    {/* View Toggles */}
                    <div className="flex bg-neutral-900 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            title="List View"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            title="Grid View"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </button>
                    </div>

                    <Link
                        href="/admin/products/add"
                        className="bg-primary hover:bg-white hover:text-black text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    >
                        <Plus size={20} /> Add Product
                    </Link>
                </div>
            </div>

            {viewMode === 'list' ? (
                /* LIST VIEW */
                <div className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/5 overflow-hidden animate-in fade-in duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="h-12 w-12 bg-neutral-800 rounded-lg overflow-hidden border border-white/10">
                                                {/* Display first image if available, else placeholder */}
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-600 text-xs">No Img</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white font-medium">
                                            {product.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-primary font-bold">
                                            ₹{product.price}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            <span className="bg-white/5 px-2 py-1 rounded border border-white/5 text-xs">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {product.stock}
                                        </td>
                                        <td className="px-6 py-4 text-sm flex gap-3">
                                            <Link href={`/admin/products/${product._id}/edit`} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-primary/20 transition-all">
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => deleteHandler(product._id)}
                                                className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all"
                                            >
                                                <Trash2 size={18} />
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in duration-300">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="group bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-white/5 shadow-lg overflow-hidden hover:border-primary/30 transition-all flex flex-col">
                            <div className="relative aspect-square bg-neutral-800 overflow-hidden">
                                {product.images && product.images[0] ? (
                                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No Image</div>
                                )}
                                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/admin/products/${product._id}/edit`} className="p-2 bg-white/90 backdrop-blur rounded-full text-black hover:bg-primary transition-all shadow-sm">
                                        <Edit size={16} />
                                    </Link>
                                    <button
                                        onClick={() => deleteHandler(product._id)}
                                        className="p-2 bg-white/90 backdrop-blur rounded-full text-black hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                {product.stock <= 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 text-white text-xs text-center py-1 font-bold">
                                        OUT OF STOCK
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border border-white/10 px-2 py-0.5 rounded bg-black/50">{product.category}</span>
                                    <span className="text-primary font-bold">₹{product.price}</span>
                                </div>
                                <h3 className="text-white font-medium mb-1 line-clamp-2 min-h-[3rem]">{product.title}</h3>
                                <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center text-xs text-gray-400">
                                    <span>Stock: {product.stock}</span>
                                    {product.subcategories && product.subcategories.length > 0 && (
                                        <span>{product.subcategories.length} Subs</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-500 bg-neutral-900/50 rounded-2xl border border-white/5">
                            No products found in filtering.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
