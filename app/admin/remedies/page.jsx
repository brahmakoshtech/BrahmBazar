'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Trash2, Search } from 'lucide-react';

export default function RemediesPage() {
    const [remedies, setRemedies] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters for listing (existing)
    const [activeType, setActiveType] = useState('shop');
    const [activeSection, setActiveSection] = useState('must_have');

    // Staging / Selection State
    const [categoryFilter, setCategoryFilter] = useState('');
    const [subcategoryFilter, setSubcategoryFilter] = useState('');
    const [productToStage, setProductToStage] = useState('');

    // The "Bucket"
    const [stagedRemedies, setStagedRemedies] = useState([]); // Stores Product Objects

    // View Mode: 'remedies' (default/saved), 'catalog' (browsing products), 'staged' (reviewing selection)
    const [viewMode, setViewMode] = useState('remedies');

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
        // Reset selection state when tab changes
        setCategoryFilter('');
        setSubcategoryFilter('');
        setViewMode('remedies');
    }, [activeType, activeSection]);

    // Effect: Switch to 'catalog' mode when Category is selected
    useEffect(() => {
        if (categoryFilter && activeType === 'shop') {
            if (viewMode !== 'staged') {
                setViewMode('catalog');
            }
        } else if (!categoryFilter && activeType === 'shop') {
            // If cleared selection, go back to remedies unless we are viewing staged?
            // Requirement says: "Category change -> back to all products mode" (which refers to catalog usually)
            // But "Empty category" usually implies default state.
            if (viewMode === 'catalog') {
                setViewMode('remedies');
            }
        }
    }, [categoryFilter, subcategoryFilter, activeType]);


    // Derived Lists
    const catalogProducts = products.filter(p => {
        if (categoryFilter && p.category !== categoryFilter) return false;
        if (subcategoryFilter && p.subcategory !== subcategoryFilter) return false;
        // Search logic for catalog
        if (searchQuery && viewMode === 'catalog') {
            const q = searchQuery.toLowerCase();
            return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        }
        return true;
    });

    const filteredRemedies = remedies.filter(remedy => {
        if (searchQuery && viewMode === 'remedies') {
            const query = searchQuery.toLowerCase();
            const product = remedy.product || {};
            return (
                (product.title?.toLowerCase() || '').includes(query) ||
                (product.category?.toLowerCase() || '').includes(query)
            );
        }
        return remedy.section === activeSection;
    });

    const productsForDropdown = products.filter(p => {
        if (categoryFilter && p.category !== categoryFilter) return false;
        if (subcategoryFilter && p.subcategory !== subcategoryFilter) return false;
        return true;
    });

    // Determine what to show in table
    // 1. Staged View
    // 2. Catalog View (if filtering)
    // 3. Remedies View (Default)
    let tableData = [];
    let tableMode = 'remedies'; // for rendering logic

    if (viewMode === 'staged') {
        tableData = stagedRemedies;
        tableMode = 'staged';
    } else if (viewMode === 'catalog') {
        tableData = catalogProducts;
        tableMode = 'catalog';
    } else {
        tableData = filteredRemedies;
        tableMode = 'remedies';
    }


    const handleToggleProductSelection = (product) => {
        const exists = stagedRemedies.find(p => p._id === product._id);
        if (exists) {
            setStagedRemedies(stagedRemedies.filter(p => p._id !== product._id));
        } else {
            // Prevent duplicates in active list check
            if (remedies.find(r => r.product?._id === product._id)) {
                if (!confirm("This product is already in the active remedies list. Select anyway?")) return;
            }
            setStagedRemedies([...stagedRemedies, product]);
        }
    };

    // Handler for Button click in Toolbar
    const handleQuickStage = () => {
        if (!productToStage) return;
        const product = products.find(p => p._id === productToStage);
        if (product) {
            if (!stagedRemedies.find(p => p._id === product._id)) {
                handleToggleProductSelection(product);
            }
            setProductToStage('');
        }
    };

    const handleSaveAllStaged = async () => {
        if (stagedRemedies.length === 0) return;
        try {
            await Promise.all(stagedRemedies.map(p =>
                api.post('/api/admin/remedies', {
                    type: activeType,
                    section: activeSection,
                    productId: p._id
                })
            ));

            setStagedRemedies([]);
            setViewMode('remedies');
            setCategoryFilter(''); // Reset filters to go back to main view
            setSubcategoryFilter('');
            fetchData();
            alert('Remedies saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save some remedies');
        }
    };

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
        if (viewMode === 'staged') {
            // Go back to previous. If filters active -> catalog, else remedies
            if (categoryFilter) setViewMode('catalog');
            else setViewMode('remedies');
        } else {
            setViewMode('staged');
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

                        {/* 1. Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setSubcategoryFilter('');
                            }}
                            className="bg-transparent text-xs font-semibold px-3 py-2 rounded-lg border border-primary/10 outline-none w-32 focus:bg-white transition-all"
                        >
                            <option value="">Category</option>
                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>

                        {/* 2. Subcategory Filter */}
                        <select
                            value={subcategoryFilter}
                            onChange={(e) => setSubcategoryFilter(e.target.value)}
                            className="bg-transparent text-xs font-semibold px-3 py-2 rounded-lg border border-primary/10 outline-none w-32 focus:bg-white transition-all"
                        >
                            <option value="">Sub Category</option>
                            {products
                                .filter(p => !categoryFilter || p.category === categoryFilter)
                                .map(p => p.subcategory)
                                .filter((v, i, a) => v && a.indexOf(v) === i)
                                .map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>

                        {/* Product Selector (Quick Add) */}
                        <div className="flex-1 min-w-[200px] border-l border-primary/10 pl-2 ml-2">
                            <select
                                value={productToStage}
                                onChange={(e) => setProductToStage(e.target.value)}
                                className="w-full bg-transparent text-xs font-semibold px-3 py-2 rounded-lg outline-none cursor-pointer"
                            >
                                <option value="">Select Product...</option>
                                {productsForDropdown.map(p => (
                                    <option key={p._id} value={p._id}>{p.title}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleQuickStage}
                            disabled={!productToStage}
                            className="bg-secondary/10 hover:bg-secondary/20 text-secondary p-2 rounded-lg transition-all"
                            title="Quick Add"
                        >
                            <Search size={14} className="opacity-0 w-0 h-0" /> {/* Hidden structure helper */}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </button>

                        {/* THE "SELECTED" BUTTON (TOGGLES VIEW) */}
                        <button
                            onClick={toggleSelectedView}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ml-2 ${viewMode === 'staged'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                : 'bg-white border border-primary/10 hover:bg-gray-50'
                                }`}
                        >
                            <span>Selected</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${viewMode === 'staged' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                                {stagedRemedies.length}
                            </span>
                        </button>

                        {/* SAVE BUTTON (Only in Staged View) */}
                        {viewMode === 'staged' && stagedRemedies.length > 0 && (
                            <button
                                onClick={handleSaveAllStaged}
                                className="ml-2 bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-600 animate-in fade-in"
                            >
                                Save
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* TABLE HEADER INFO */}
            <div className="mb-4 flex items-center justify-between px-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {viewMode === 'remedies' && `Existing Remedies (${remedies.length})`}
                    {viewMode === 'catalog' && `Catalog: ${categoryFilter || 'All'} / ${subcategoryFilter || 'All'} (${catalogProducts.length})`}
                    {viewMode === 'staged' && `Selected for Addition (${stagedRemedies.length})`}
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
                                {viewMode === 'staged' && "No products selected yet."}
                                {viewMode === 'remedies' && "No active remedies found."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                            {tableData.map((row) => {
                                // Normalize Data
                                const product = tableMode === 'remedies' ? row.product : row;
                                if (!product) return null;

                                const isSelected = stagedRemedies.find(p => p._id === product._id);
                                const isAlreadyActive = tableMode === 'catalog' && remedies.find(r => r.product?._id === product._id);

                                return (
                                    <div
                                        key={tableMode === 'remedies' ? row._id : product._id}
                                        className={`bg-white rounded-xl overflow-hidden border transition-all duration-300 relative group flex flex-col ${isSelected && tableMode === 'catalog'
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
                                                {isAlreadyActive && (
                                                    <span className="bg-green-500/90 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                                        Active
                                                    </span>
                                                )}
                                                {tableMode === 'remedies' && (
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
                                                {tableMode === 'remedies' ? (
                                                    <button
                                                        onClick={() => handleRemoveRemedy(row._id)}
                                                        className="w-full py-2 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Trash2 size={12} />
                                                        Remove
                                                    </button>
                                                ) : (
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
                                                )}
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
