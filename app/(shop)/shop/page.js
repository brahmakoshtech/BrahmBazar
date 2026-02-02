'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import ProductCard from '@/components/ProductCard';
import { ChevronDown, Filter, X, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('newest');

    // UI States
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Prevent body scroll when mobile filters are open
    useEffect(() => {
        if (mobileFiltersOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileFiltersOpen]);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get('/api/products'),
                    api.get('/api/categories')
                ]);
                setProducts(productsRes.data);
                setFilteredProducts(productsRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error("Failed to fetch shop data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter & Sort Logic Effect
    useEffect(() => {
        let result = [...products];

        // 1. Category Filter
        if (selectedCategory !== 'all') {
            const matchedCategory = categories.find(c => c.slug === selectedCategory);
            if (matchedCategory) {
                if (selectedSubcategory) {
                    const matchedSub = matchedCategory.subcategories?.find(s => s.slug === selectedSubcategory);
                    if (matchedSub) {
                        result = result.filter(p => p.subcategory?.toLowerCase() === matchedSub.name.toLowerCase());
                    }
                } else {
                    result = result.filter(p => p.category?.toLowerCase() === matchedCategory.name.toLowerCase());
                }
            }
        }

        // 2. Price Filter
        if (priceRange.min !== '') {
            result = result.filter(p => p.price >= Number(priceRange.min));
        }
        if (priceRange.max !== '') {
            result = result.filter(p => p.price <= Number(priceRange.max));
        }

        // 3. Sorting
        if (sortBy === 'price-low-high') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high-low') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'newest') {
            // Assuming your product schema has createdAt
            result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        setFilteredProducts(result);
    }, [selectedCategory, selectedSubcategory, priceRange, sortBy, products, categories]);

    const handleCategoryClick = (catSlug, subSlug = null) => {
        setSelectedCategory(catSlug);
        setSelectedSubcategory(subSlug);
        if (catSlug === 'all') {
            setExpandedCategory(null);
        } else if (!subSlug) {
            // If clicking a main category, toggle expand
            const catId = categories.find(c => c.slug === catSlug)?._id;
            setExpandedCategory(curr => curr === catId ? catId : catId); // Keep expanded if already is, or switch
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleCategoryExpand = (catId, e) => {
        e.stopPropagation();
        setExpandedCategory(prev => prev === catId ? null : catId);
    };

    const clearFilters = () => {
        setSelectedCategory('all');
        setSelectedSubcategory(null);
        setPriceRange({ min: '', max: '' });
        setExpandedCategory(null);
    };

    return (
        <div className="min-h-screen bg-background pt-2 pb-20">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Header */}
                <div className="mb-6 px-1 flex flex-col items-start md:items-end md:flex-row justify-between gap-6 border-b border-primary/10 pb-6">
                    <div className="flex flex-col items-start">
                        <span className="text-secondary font-bold tracking-[0.2em] uppercase text-[10px] mb-1 block">
                            Our Collection
                        </span>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                                Shop <span className="text-primary italic">Treasures</span>
                            </h1>
                            {/* Compact Mobile Filter Icon */}
                            <button
                                onClick={() => setMobileFiltersOpen(true)}
                                className="lg:hidden p-2.5 bg-muted/50 border border-border/50 rounded-xl text-foreground active:scale-95 transition-all"
                            >
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Sort Dropdown (Desktop only, mobile moves to drawer) */}
                    <div className="hidden md:flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-full border border-border/50">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Sort By</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-transparent border-none pr-6 text-sm font-bold focus:outline-none cursor-pointer text-foreground"
                            >
                                <option value="newest">New Arrivals</option>
                                <option value="price-low-high">Lowest Price</option>
                                <option value="price-high-low">Highest Price</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-primary" />
                        </div>
                    </div>
                </div>

                {/* Mobile Unified Filter Bar - Always Fixed Right Filter */}
                <div className="lg:hidden flex items-center justify-between gap-2 mb-6 sticky top-[80px] z-30 bg-[#FFF0D2]/95 backdrop-blur-xl py-2 px-3 -mx-4 border-b border-primary/10 shadow-sm overflow-hidden min-h-[52px]">
                    {/* Categories Scroll Area - Always flex-1 to push icon right */}
                    <div className="flex-1 flex overflow-x-auto items-center gap-1.5 scrollbar-hide py-1">
                        <button
                            onClick={() => handleCategoryClick('all')}
                            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight transition-all duration-300 border ${selectedCategory === 'all' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white/50 text-muted-foreground border-[#DCC8B0]/30'}`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => handleCategoryClick(cat.slug)}
                                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight transition-all duration-300 border ${selectedCategory === cat.slug ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white/50 text-muted-foreground border-[#DCC8B0]/30'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Fixed Filter Icon - Always Rendered & Fixed Right */}
                    <div className="flex items-center pl-2 border-l border-primary/10 shrink-0 bg-[#FFF0D2] z-10 shadow-[-10px_0_15px_-5px_rgba(255,240,210,1)] ml-auto">
                        <button
                            onClick={() => setMobileFiltersOpen(true)}
                            className="p-2.5 bg-[#2D241E] text-[#FFF0D2] rounded-full active:scale-95 transition-all shadow-md flex items-center justify-center"
                        >
                            <Filter size={15} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 items-start mt-0">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block w-60 shrink-0 sticky top-[165px] h-fit z-20">
                        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto pr-2 scrollbar-hide space-y-4">

                            {/* Categories List */}
                            <div className="space-y-1">
                                <button
                                    onClick={() => handleCategoryClick('all')}
                                    className={`w-full text-left py-2 px-3 rounded-lg text-sm transition-all duration-300 font-medium flex items-center justify-between group ${selectedCategory === 'all' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                                >
                                    All Products
                                </button>

                                {categories.map(cat => {
                                    const isSelected = selectedCategory === cat.slug;
                                    const isExpanded = expandedCategory === cat._id;

                                    return (
                                        <div key={cat._id} className="relative">
                                            <div className={`flex items-center justify-between rounded-lg transition-all duration-300 group ${isSelected && !selectedSubcategory ? 'bg-primary/10' : 'hover:bg-muted'}`}>
                                                <button
                                                    onClick={() => handleCategoryClick(cat.slug)}
                                                    className={`flex-1 text-left py-2 px-3 text-sm font-medium transition-colors ${isSelected && !selectedSubcategory ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                                                >
                                                    {cat.name}
                                                </button>
                                                {cat.subcategories?.length > 0 && (
                                                    <button
                                                        onClick={(e) => toggleCategoryExpand(cat._id, e)}
                                                        className={`p-2 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                                                    >
                                                        <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Subcategories with AnimatePresence */}
                                            <AnimatePresence>
                                                {cat.subcategories?.length > 0 && isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="ml-3 pl-3 border-l border-primary/20 space-y-0.5 py-1 mb-1">
                                                            {cat.subcategories.map(sub => (
                                                                <button
                                                                    key={sub._id}
                                                                    onClick={() => handleCategoryClick(cat.slug, sub.slug)}
                                                                    className={`w-full text-left py-1.5 px-3 text-xs rounded-md transition-colors ${selectedSubcategory === sub.slug ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
                                                                >
                                                                    {sub.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Price Filter Card */}
                            <div className="bg-card/50 border border-border rounded-xl p-3 shadow-sm">
                                <h3 className="text-xs font-serif font-bold mb-2 uppercase tracking-wide flex items-center gap-2">
                                    Price Range
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[9px]">₹</span>
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={priceRange.min}
                                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                                className="w-full pl-4 pr-1 py-1 text-[10px] bg-background border border-border rounded-md focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <Minus size={10} className="text-muted-foreground" />
                                        <div className="relative flex-1">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[9px]">₹</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={priceRange.max}
                                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                                className="w-full pl-4 pr-1 py-1 text-[10px] bg-background border border-border rounded-md focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>


                    {/* Main Content (Scrollable Products) */}
                    <div className="flex-1 w-full">
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse bg-muted rounded-2xl h-96"></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {filteredProducts.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 gap-y-6">
                                        {filteredProducts.map(product => (
                                            <motion.div
                                                key={product._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                layout
                                            >
                                                <ProductCard product={product} />
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-muted/20 border border-dashed border-border rounded-3xl">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <Filter className="text-muted-foreground opacity-50" size={32} />
                                        </div>
                                        <h3 className="text-xl font-serif font-bold text-foreground mb-2">No products found</h3>
                                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                            Try adjusting your price range or explore different categories.
                                        </p>
                                        <button
                                            onClick={clearFilters}
                                            className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div >

            {/* Mobile Filter Drawer (Bottom Sheet Style) */}
            < AnimatePresence >
                {mobileFiltersOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex justify-end"
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />

                        {/* Side Drawer */}
                        <motion.div
                            initial={{ translateX: '100%' }}
                            animate={{ translateX: 0 }}
                            exit={{ translateX: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-[85%] max-w-sm h-full bg-white shadow-2xl p-6 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-5 shrink-0">
                                <h3 className="text-xl font-bold font-serif text-foreground">Sort & Filter</h3>
                                <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 bg-muted rounded-full transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="overflow-y-auto flex-1 space-y-6 scrollbar-hide pb-4">
                                {/* Sort Options (List Style) */}
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2.5">Sort By</h4>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'New Arrivals', value: 'newest' },
                                            { label: 'Lowest Price', value: 'price-low-high' },
                                            { label: 'Highest Price', value: 'price-high-low' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSortBy(opt.value)}
                                                className={`w-full flex items-center justify-between py-2.5 px-4 rounded-xl border-2 transition-all ${sortBy === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-[#DCC8B0]/20 bg-transparent text-foreground'}`}
                                            >
                                                <span className="font-bold text-xs">{opt.label}</span>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${sortBy === opt.value ? 'border-primary' : 'border-gray-300'}`}>
                                                    {sortBy === opt.value && <div className="w-2 h-2 bg-primary rounded-full transition-all" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile Price Filter */}
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2.5">Price Range (₹)</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={priceRange.min}
                                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-[#FFF0D2]/50 border border-[#DCC8B0]/30 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <div className="text-muted-foreground font-black text-xs">—</div>
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={priceRange.max}
                                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-[#FFF0D2]/50 border border-[#DCC8B0]/30 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2.5 pt-4 border-t border-[#DCC8B0]/30 shrink-0">
                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="w-full py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest shadow-md shadow-primary/20 text-[11px] active:scale-95 transition-all"
                                >
                                    Update Results
                                </button>
                                <button
                                    onClick={() => { clearFilters(); setMobileFiltersOpen(false); }}
                                    className="w-full py-3 bg-white/50 text-foreground rounded-xl font-bold uppercase tracking-widest text-[11px] border border-[#DCC8B0]/30 active:scale-95 transition-all"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </div >
    );
}
