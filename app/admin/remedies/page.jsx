'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Trash2, Search, ChevronDown } from 'lucide-react';

export default function RemediesPage() {
    const [remedies, setRemedies] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters for listing (existing)
    const [activeType, setActiveType] = useState('shop');
    const [activeSection, setActiveSection] = useState('must_have');

    // Filter State
    const [categoryFilter, setCategoryFilter] = useState('');
    const [subcategoryFilter, setSubcategoryFilter] = useState('');
    const [productToStage, setProductToStage] = useState('');

    // Dropdown State
    const [isCatOpen, setIsCatOpen] = useState(false);
    const [isSubOpen, setIsSubOpen] = useState(false);

    // View Mode: 'catalog' (browsing all products) vs 'selected' (viewing only active remedies)
    const [viewMode, setViewMode] = useState('catalog');

    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const remediesRes = await api.get(`/api/admin/remedies?type=${activeType}&section=${activeSection}`);
            setRemedies(remediesRes.data);

            if (products.length === 0) {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get('/api/products'),
                    api.get('/api/categories')
                ]);
                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setCategoryFilter('');
        setSubcategoryFilter('');
        if (activeType === 'shop') {
            setViewMode('catalog');
        } else {
            setViewMode('selected'); // For non-shop tabs, default to showing the list
        }
    }, [activeType, activeSection]);

    // Derived Lists
    const catalogProducts = products.filter(p => {
        if (categoryFilter && p.category !== categoryFilter) return false;
        if (subcategoryFilter && p.subcategory !== subcategoryFilter) return false;
        if (searchQuery && viewMode === 'catalog') {
            const q = searchQuery.toLowerCase();
            return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        }
        return true;
    });

    const activeRemediesList = remedies.filter(remedy => {
        // Filter mainly by section/type (already handled by API fetch usually, but double check)
        // The API fetches ?type=X&section=Y, so 'remedies' SHOULD only contain that.
        if (searchQuery && viewMode === 'selected') {
            const query = searchQuery.toLowerCase();
            const product = remedy.product || {};
            return (
                (product.title?.toLowerCase() || '').includes(query) ||
                (product.category?.toLowerCase() || '').includes(query)
            );
        }
        return true;
    });

    const productsForDropdown = products.filter(p => {
        if (categoryFilter && p.category !== categoryFilter) return false;
        if (subcategoryFilter && p.subcategory !== subcategoryFilter) return false;
        return true;
    });

    // Determine Table Data
    let tableData = [];
    let isCatalogMode = viewMode === 'catalog';

    if (isCatalogMode) {
        tableData = catalogProducts;
    } else {
        // 'selected' mode
        tableData = activeRemediesList;
    }

    const handleToggleProductSelection = async (product) => {
        // Check if already in remedies
        const existingRemedy = remedies.find(r => r.product?._id === product._id);

        try {
            if (existingRemedy) {
                // DELETE
                await api.delete(`/api/admin/remedies/${existingRemedy._id}`);
                setRemedies(prev => prev.filter(r => r._id !== existingRemedy._id));
            } else {
                // POST
                const res = await api.post('/api/admin/remedies', {
                    type: activeType,
                    section: activeSection,
                    productId: product._id
                });
                // Add to local state (optimistic equivalent)
                // The API usually returns the created remedy.
                // We need to ensure the format matches local state expectations { _id, product: {...} }
                // Assuming backend returns the populated remedy or at least we can construct it.
                // For safety, let's just append the new remedy with the product object attached.
                const newRemedy = { ...res.data, product: product };
                setRemedies(prev => [...prev, newRemedy]);
            }
        } catch (err) {
            console.error("Failed to toggle selection", err);
            alert("Failed to update selection. Please try again.");
        }
    };

    const handleQuickStage = () => {
        // ... (Optional: if we kept the quick add, but user asked to remove it so likely unused)
    };

    // Legacy removal function (for the trash icon in specific views if needed)
    const handleRemoveRemedy = async (id) => {
        if (!confirm('Are you sure you want to remove this remedy?')) return;
        try {
            await api.delete(`/api/admin/remedies/${id}`);
            setRemedies(remedies.filter(r => r._id !== id));
        } catch (err) {
            console.error('Failed to remove remedy', err);
        }
    };


    const toggleSelectedView = () => {
        if (viewMode === 'selected') {
            setViewMode('catalog');
        } else {
            setViewMode('selected');
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
            {/* TOP CONTROLS */}
            <div className="flex flex-col gap-4 mb-6">
                {/* ROW 1: TABS */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="inline-flex bg-white/50 backdrop-blur-sm p-1 rounded-full border border-primary/10 shadow-sm">
                        {['shop', 'yatra', 'seva'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveType(type)}
                                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeType === type
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-full border border-primary/10 shadow-sm">
                        {['must_have', 'good_to_have'].map((section) => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeSection === section
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {section.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ROW 2: SELECTION TOOLBAR (Only for SHOP) */}
                {activeType === 'shop' && (
                    <div className="flex flex-wrap items-center gap-2 bg-white/80 p-2 rounded-xl border border-primary/10 shadow-sm w-full animate-in fade-in slide-in-from-top-2">

                        {/* 1. Category Filter Custom Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsCatOpen(!isCatOpen); setIsSubOpen(false); }}
                                className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/10 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-white hover:text-foreground transition-all min-w-[140px] justify-between"
                            >
                                <span>{categoryFilter || 'Category'}</span>
                                <ChevronDown size={14} className={`transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isCatOpen && (
                                <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-white rounded-xl shadow-xl shadow-primary/10 border border-primary/10 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                        <button
                                            onClick={() => { setCategoryFilter(''); setSubcategoryFilter(''); setIsCatOpen(false); }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${!categoryFilter ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'}`}
                                        >
                                            All Categories
                                        </button>
                                        {categories.map(c => (
                                            <button
                                                key={c._id}
                                                onClick={() => { setCategoryFilter(c.name); setSubcategoryFilter(''); setIsCatOpen(false); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${categoryFilter === c.name ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'}`}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Subcategory Filter Custom Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsSubOpen(!isSubOpen); setIsCatOpen(false); }}
                                className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/10 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-white hover:text-foreground transition-all min-w-[140px] justify-between"
                            >
                                <span>{subcategoryFilter || 'Sub Category'}</span>
                                <ChevronDown size={14} className={`transition-transform ${isSubOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSubOpen && (
                                <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-white rounded-xl shadow-xl shadow-primary/10 border border-primary/10 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                        <button
                                            onClick={() => { setSubcategoryFilter(''); setIsSubOpen(false); }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${!subcategoryFilter ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'}`}
                                        >
                                            All Subcategories
                                        </button>
                                        {products
                                            .filter(p => !categoryFilter || p.category === categoryFilter)
                                            .map(p => p.subcategory)
                                            .filter((v, i, a) => v && a.indexOf(v) === i)
                                            .map(sub => (
                                                <button
                                                    key={sub}
                                                    onClick={() => { setSubcategoryFilter(sub); setIsSubOpen(false); }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${subcategoryFilter === sub ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'}`}
                                                >
                                                    {sub}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* THE "SELECTED" BUTTON (TOGGLES VIEW) */}
                        <button
                            onClick={toggleSelectedView}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ml-2 ${viewMode === 'selected'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                : 'bg-white border border-primary/10 hover:bg-gray-50'
                                }`}
                        >
                            <span>Selected</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${viewMode === 'selected' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                                {remedies.length}
                            </span>
                        </button>

                    </div>
                )}
            </div>

            {/* TABLE HEADER INFO */}
            <div className="mb-4 flex items-center justify-between px-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {viewMode === 'selected' && `Existing Remedies (${remedies.length})`}
                    {viewMode === 'catalog' && `Catalog: ${categoryFilter || 'All'} / ${subcategoryFilter || 'All'} (${catalogProducts.length})`}
                </h2>

                {/* Search is Global / Contextual */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search list..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/50 pl-8 pr-3 py-1.5 rounded-full border border-primary/10 text-xs focus:bg-white focus:border-primary outline-none transition-all w-48"
                    />
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
            </div>

            {/* PRODUCT GRID CONTENT */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-primary/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    {tableData.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 rounded-3xl border border-primary/10 backdrop-blur-sm">
                            <p className="text-muted-foreground font-medium">
                                {viewMode === 'catalog' && "No products found in this category."}
                                {viewMode === 'selected' && "No active remedies found."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                            {tableData.map((row) => {
                                // Normalize Data
                                // If 'selected' mode, row is the remedy object { _id: remedyId, product: {...} }
                                // If 'catalog' mode, row is the product object { _id: productId, ... }
                                const product = isCatalogMode ? row : row.product;
                                if (!product) return null;

                                // Check if this product is active in the current remedies list
                                const activeRemedy = remedies.find(r => r.product?._id === product._id);
                                const isSelected = !!activeRemedy;

                                return (
                                    <div
                                        key={isCatalogMode ? product._id : row._id}
                                        className={`bg-white rounded-xl overflow-hidden border transition-all duration-300 relative group flex flex-col ${isSelected && isCatalogMode
                                            ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary'
                                            : 'border-primary/10 shadow-sm hover:shadow-md hover:border-primary/30'
                                            }`}
                                    >
                                        {/* IMAGE AREA */}
                                        <div className="aspect-[4/3] bg-secondary/5 relative overflow-hidden">
                                            {product.images?.[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase tracking-widest">
                                                    No Image
                                                </div>
                                            )}

                                            {/* BADGES */}
                                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                {/* In Catalog mode, show Active badge if selected */}
                                                {isSelected && isCatalogMode && (
                                                    <span className="bg-green-500/90 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                                        Active
                                                    </span>
                                                )}
                                                {/* In Selected mode, show section badge */}
                                                {!isCatalogMode && (
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border shadow-sm backdrop-blur-sm ${row.section === 'must_have' ? 'bg-orange-100/90 text-orange-700 border-orange-200' : 'bg-blue-100/90 text-blue-700 border-blue-200'
                                                        }`}>
                                                        {row.section?.replace(/_/g, ' ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* CONTENT */}
                                        <div className="p-3 flex flex-col flex-1 gap-1">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                                                {product.category}
                                            </div>
                                            <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-2 min-h-[2.5em]" title={product.title}>
                                                {product.title}
                                            </h3>
                                            <div className="mt-auto pt-2 flex items-center justify-between border-t border-dashed border-primary/10">
                                                <span className="font-serif font-bold text-primary">
                                                    ₹{product.price?.toLocaleString('en-IN')}
                                                </span>
                                            </div>

                                            {/* ACTION BUTTON */}
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => handleToggleProductSelection(product)}
                                                    className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSelected
                                                        ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'
                                                        : 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20'
                                                        }`}
                                                >
                                                    {isSelected ? (
                                                        <>
                                                            <Trash2 size={12} /> Deselect
                                                        </>
                                                    ) : (
                                                        <>
                                                            Select
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
