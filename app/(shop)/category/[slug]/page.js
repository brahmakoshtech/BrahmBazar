'use client';

import { useState, useEffect, use, useMemo, Suspense } from 'react';
import api from '@/services/api';
import ProductCard from '@/components/ProductCard';
import { useSearchParams } from 'next/navigation';
import { Filter, ChevronDown, X, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CategoryContent({ params }) {
    const { slug } = use(params);
    const [allProducts, setAllProducts] = useState([]); // Store all fetched products
    const [filteredProducts, setFilteredProducts] = useState([]); // Store filtered result
    const [loading, setLoading] = useState(true);

    // Filter States
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [tempPriceRange, setTempPriceRange] = useState({ min: '', max: '' }); // For input fields
    const [sortBy, setSortBy] = useState('Featured');
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

    // Data
    const [categoriesData, setCategoriesData] = useState([]);
    const searchParams = useSearchParams();
    const urlSubcategory = searchParams.get('subcategory');

    // Initialize selected category based on slug
    useEffect(() => {
        if (slug) {
            // Capitalize first letter to match checkbox labels/data likely format
            // const formattedSlug = slug.charAt(0).toUpperCase() + slug.slice(1); // Removed: Use case-insensitive match or mapped name
            // Better: wait for categories to load to match exact name, or just use slug if backend supports it.
            // For now, let's just trigger the initial selection logic once categories are loaded or valid.
            // actually, we can just push the slug or name.

            // We'll rely on string matching.
            // But wait, the previous code hardcoded 'Rudraksha'.
            // Let's assume the slug matches the category name roughly or we find it.
        }

        if (urlSubcategory) {
            setSelectedSubcategories([urlSubcategory]);
        }
    }, [slug, urlSubcategory]);

    // Coupons State
    const [activeCoupons, setActiveCoupons] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productsRes, categoriesRes, couponsRes] = await Promise.all([
                    api.get('/api/products'),
                    api.get('/api/categories'),
                    api.get('/api/coupons/active')
                ]);

                setAllProducts(productsRes.data);
                setCategoriesData(categoriesRes.data);
                setActiveCoupons(couponsRes.data);

                // initial selection
                if (slug) {
                    const foundCat = categoriesRes.data.find(c => c.slug === slug);
                    if (foundCat) setSelectedCategories([foundCat.name]);
                    else setSelectedCategories([slug.charAt(0).toUpperCase() + slug.slice(1)]);
                }

            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    // Apply Filters & Sort
    useEffect(() => {
        let result = [...allProducts];

        // 1. Category Filter
        // If categories are selected, product must match ONE of them.
        // If valid categories selected (length > 0), filter. 
        // Note: The URL slug category is added to selectedCategories on mount.
        if (selectedCategories.length > 0) {
            result = result.filter(p => {
                return selectedCategories.some(cat =>
                    p.category.toLowerCase() === cat.toLowerCase() ||
                    p.category.toLowerCase().includes(cat.toLowerCase())
                );
            });
        }

        // 1.5 Subcategory Filter
        if (selectedSubcategories.length > 0) {
            result = result.filter(p => {
                return p.subcategory && selectedSubcategories.some(sub =>
                    p.subcategory.toLowerCase() === sub.toLowerCase() ||
                    // handle slug vs name mismatch? p.subcategory is likely a name or slug. 
                    // in productController we saved whatever was sent. The UI sends name. 
                    p.subcategory.toLowerCase().includes(sub.toLowerCase())
                );
            });
        }
        // If selectedCategories is empty (user unchecked everything), maybe show all? 
        // Or show nothing? Usually show All or keep the Slug one.  
        // For this UX, if nothing selected, we might default to showing the Slug category or All.
        // But better UX: If they uncheck the main one, they probably want to explore others, 
        // but if they uncheck EVERYTHING, showing '0 results' is technically correct filter behavior.

        // 2. Price Filter
        if (priceRange.min !== '') {
            result = result.filter(p => p.price >= Number(priceRange.min));
        }
        if (priceRange.max !== '') {
            result = result.filter(p => p.price <= Number(priceRange.max));
        }

        // 3. Sort
        switch (sortBy) {
            case 'Price: Low to High':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'Price: High to Low':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'Newest Arrivals':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'Featured':
            default:
                // If 'Featured', maybe sort by some 'isFeatured' flag or default fetch order
                // For now, keep as is (random/fetch order)
                break;
        }

        setFilteredProducts(result);
    }, [allProducts, selectedCategories, priceRange, sortBy]);


    // Handlers
    const handleCategoryChange = (catName) => {
        setSelectedCategories(prev => {
            if (prev.includes(catName)) {
                return prev.filter(c => c !== catName);
            } else {
                return [...prev, catName];
            }
        });
    };

    const handleSubcategoryChange = (subSlug) => {
        setSelectedSubcategories(prev => {
            if (prev.includes(subSlug)) return prev.filter(s => s !== subSlug);
            return [...prev, subSlug];
        });
    };

    const handlePriceApply = () => {
        setPriceRange(tempPriceRange);
    };

    // State for Banners (Existing logic)
    const [banners, setBanners] = useState([]);
    const [bannerLoading, setBannerLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data } = await api.get('/api/banners');
                const categoryBanners = data.filter(b =>
                    b.isActive &&
                    (b.link?.toLowerCase().includes(slug.toLowerCase()) || b.position === 'category-top')
                );
                setBanners(categoryBanners.sort((a, b) => a.displayOrder - b.displayOrder));
            } catch (err) {
                console.error("Failed to fetch banners", err);
            } finally {
                setBannerLoading(false);
            }
        };
        if (slug) fetchBanners();
    }, [slug]);

    // const categoriesList = ['Rudraksha', 'Gemstones', 'Yantras', 'Malas', 'Spiritual Idols', 'Parads', 'Sphatiks'];

    // Derive available subcategories from selected categories
    const availableSubcats = useMemo(() => {
        return categoriesData
            .filter(c => selectedCategories.includes(c.name))
            .flatMap(c => c.subcategories || []);
    }, [categoriesData, selectedCategories]);

    return (
        <main className="min-h-screen bg-transparent text-foreground">
            {/* Dynamic Split Banner Header (Existing) */}
            <div className="relative w-full min-h-[50vh] flex flex-col md:flex-row mb-12 border-b border-[#DCC8B0]/30 shadow-sm">
                <div className="w-full md:w-1/2 bg-foreground flex flex-col justify-center p-8 md:p-16 relative z-10 text-[#FFF0D2]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    <span className="text-primary font-bold tracking-[0.2em] uppercase mb-4 text-sm animate-fade-in-up">Sacred Collection</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 md:mb-6 leading-tight animate-fade-in-up delay-100">
                        {slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Collection'}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md font-light leading-relaxed animate-fade-in-up delay-200">
                        Discover the divine energy of our authentic {slug} collection. curated for your spiritual journey.
                    </p>
                    <div className="mt-8 flex gap-2 animate-fade-in-up delay-300">
                        <div className="h-1 w-12 bg-primary rounded-full"></div>
                        <div className="h-1 w-4 bg-white/20 rounded-full"></div>
                        <div className="h-1 w-4 bg-white/20 rounded-full"></div>
                    </div>
                </div>

                {/* Banner Right Side (Existing) */}
                <div className="w-full md:w-1/2 bg-[#2D241E] relative overflow-hidden flex items-center justify-center p-4 min-h-[300px] md:min-h-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50"></div>
                    {bannerLoading ? (
                        <div className="grid grid-cols-2 gap-4 w-full h-full max-w-2xl">
                            <div className="bg-neutral-800 animate-pulse rounded-2xl h-64"></div>
                            <div className="bg-neutral-800 animate-pulse rounded-2xl h-64 mt-8"></div>
                            <div className="bg-neutral-800 animate-pulse rounded-2xl h-64 -mt-8"></div>
                            <div className="bg-neutral-800 animate-pulse rounded-2xl h-64"></div>
                        </div>
                    ) : banners.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl transform rotate-1 hover:rotate-0 transition-transform duration-1000">
                            {banners.map((banner, index) => (
                                <div key={banner._id} className={`relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group ${index % 2 === 0 ? 'mt-8' : '-mt-8'} hover:z-10 transition-all duration-500 hover:scale-105`} style={{ height: '300px' }}>
                                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <p className="text-white text-xs font-bold uppercase tracking-widest">{banner.title}</p>
                                    </div>
                                </div>
                            ))}
                            {/* Fill grid if only 1 banner */}
                            {banners.length === 1 && (
                                <div className="bg-neutral-900/50 rounded-2xl border border-white/5 flex items-center justify-center -mt-8">
                                    <span className="text-4xl">🕉️</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl opacity-50 transition-all duration-1000">
                            <div className="bg-neutral-800 rounded-2xl h-64 mt-8 bg-gradient-to-br from-primary/20 to-neutral-900 flex items-center justify-center border border-white/5">
                                <span className="text-4xl opacity-50">🕉️</span>
                            </div>
                            <div className="bg-neutral-800 rounded-2xl h-64 -mt-8 bg-gradient-to-br from-secondary/20 to-neutral-900 flex items-center justify-center border border-white/5">
                                <span className="text-4xl opacity-50">📿</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 pb-24 max-w-7xl">
                {/* Mobile Unified Filter Bar - Always Fixed Right Filter */}
                <div className="md:hidden flex items-center justify-between gap-2 mb-6 sticky top-[80px] z-30 bg-[#FFF0D2]/95 backdrop-blur-xl py-2 px-3 -mx-4 border-b border-[#DCC8B0]/30 shadow-sm overflow-hidden min-h-[52px]">
                    {/* Subcategories Scroll - flex-1 to push icon right */}
                    <div className="flex-1 flex overflow-x-auto items-center gap-1.5 scrollbar-hide py-1">
                        <button
                            onClick={() => setSelectedSubcategories([])}
                            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight transition-all duration-300 border ${selectedSubcategories.length === 0 ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white/50 text-muted-foreground border-[#DCC8B0]/30'}`}
                        >
                            All
                        </button>
                        {categoriesData.find(c => c.slug === slug)?.subcategories?.map((sub, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSubcategoryChange(sub.slug)}
                                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight transition-all duration-300 border ${selectedSubcategories.includes(sub.slug) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white/50 text-muted-foreground border-[#DCC8B0]/30'}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>

                    {/* Fixed Filter Icon - Always Rendered & Fixed Right */}
                    <div className="flex items-center pl-2 border-l border-[#DCC8B0]/50 shrink-0 bg-[#FFF0D2] z-10 shadow-[-10px_0_15px_-5px_rgba(255,240,210,1)] ml-auto">
                        <button
                            onClick={() => setMobileFiltersOpen(true)}
                            className="p-2.5 bg-[#2D241E] text-[#FFF0D2] rounded-full active:scale-95 transition-all shadow-md flex items-center justify-center"
                        >
                            <Filter size={15} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-10">
                    {/* SIDEBAR FILTERS */}
                    <aside className="hidden md:block w-64 flex-shrink-0 space-y-8 sticky top-36 h-fit">
                        {/* Categories */}
                        {/* Subcategories Filter - Only for current category */}
                        {categoriesData.find(c => c.slug === slug)?.subcategories?.length > 0 && (
                            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-[#DCC8B0] shadow-sm">
                                <h3 className="font-serif font-bold text-lg mb-4 text-foreground border-b border-[#DCC8B0] pb-2">Subcategories</h3>
                                <ul className="space-y-3 text-sm text-foreground/80">
                                    {categoriesData.find(c => c.slug === slug).subcategories.map((sub, idx) => (
                                        <li key={idx}>
                                            <label className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors group">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-[#DCC8B0] bg-white text-primary focus:ring-primary focus:ring-offset-[#FFF0D2] accent-primary w-4 h-4"
                                                    checked={selectedSubcategories.includes(sub.slug)}
                                                    onChange={() => handleSubcategoryChange(sub.slug)}
                                                />
                                                <span className={`group-hover:translate-x-1 transition-transform ${selectedSubcategories.includes(sub.slug) ? 'text-primary font-bold' : ''}`}>
                                                    {sub.name}
                                                </span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Subcategories (Dynamic) - REMOVED (Nested above) */}

                        {/* Price Filter */}
                        {/* Price Filter */}
                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-[#DCC8B0] shadow-sm">
                            <h3 className="font-serif font-bold text-lg mb-4 text-foreground border-b border-[#DCC8B0] pb-2">Price Range</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full bg-white border border-[#DCC8B0] rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-muted-foreground"
                                        value={tempPriceRange.min}
                                        onChange={(e) => setTempPriceRange({ ...tempPriceRange, min: e.target.value })}
                                    />
                                    <span className="text-foreground/50">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full bg-white border border-[#DCC8B0] rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-muted-foreground"
                                        value={tempPriceRange.max}
                                        onChange={(e) => setTempPriceRange({ ...tempPriceRange, max: e.target.value })}
                                    />
                                </div>
                                <button
                                    onClick={handlePriceApply}
                                    className="w-full bg-foreground text-[#FFF0D2] py-2 rounded text-sm font-bold hover:bg-primary hover:text-foreground transition-colors shadow-md"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* PRODUCT GRID */}
                    <div className="flex-1">
                        {/* Sort Options */}
                        <div className="hidden md:flex justify-between items-center mb-8">
                            <p className="text-foreground/70 text-sm">Showing <span className="font-bold text-primary">{filteredProducts.length}</span> results</p>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-foreground/70">Sort By:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-white border border-[#DCC8B0] text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none hover:border-primary/50 transition-colors cursor-pointer shadow-sm"
                                >
                                    <option>Featured</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Newest Arrivals</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-32">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredProducts.map((product) => (
                                        <div key={product._id} className="h-full">
                                            <ProductCard product={product} activeCoupons={activeCoupons} />
                                        </div>
                                    ))}
                                </div>
                                {filteredProducts.length === 0 && (
                                    <div className="text-center py-32 bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-white/5 shadow-lg">
                                        <div className="text-6xl mb-4">🧘</div>
                                        <p className="text-xl text-gray-400 mb-6 font-light">
                                            No divine treasures found.
                                            <br />
                                            <span className="text-sm">Try adjusting your filters.</span>
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {mobileFiltersOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex justify-end"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
                        <motion.div
                            initial={{ translateX: '100%' }}
                            animate={{ translateX: 0 }}
                            exit={{ translateX: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-[85%] max-w-sm h-full bg-[#FFF0D2] shadow-2xl p-6 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-5 shrink-0">
                                <h3 className="text-xl font-bold font-serif text-foreground">Sort & Filter</h3>
                                <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 bg-white/50 rounded-full transition-colors border border-[#DCC8B0]/30">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="overflow-y-auto flex-1 space-y-6 scrollbar-hide pb-4">
                                {/* Sort Options */}
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2.5">Sort By</h4>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Featured', value: 'Featured' },
                                            { label: 'Price: Low-High', value: 'Price: Low to High' },
                                            { label: 'Price: High-Low', value: 'Price: High to Low' },
                                            { label: 'Newest Arrivals', value: 'Newest Arrivals' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSortBy(opt.value)}
                                                className={`w-full flex items-center justify-between py-2.5 px-4 rounded-xl border-2 transition-all ${sortBy === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-[#DCC8B0]/30 bg-white/30 text-foreground'}`}
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
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2.5">Price Range (₹)</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={tempPriceRange.min}
                                                onChange={(e) => setTempPriceRange({ ...tempPriceRange, min: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white/50 border border-[#DCC8B0]/30 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <div className="text-muted-foreground font-black text-xs">—</div>
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={tempPriceRange.max}
                                                onChange={(e) => setTempPriceRange({ ...tempPriceRange, max: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white/50 border border-[#DCC8B0]/30 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5 pt-4 border-t border-[#DCC8B0]/30 shrink-0">
                                <button
                                    onClick={() => { handlePriceApply(); setMobileFiltersOpen(false); }}
                                    className="w-full py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest shadow-md shadow-primary/20 text-[11px] active:scale-95 transition-all"
                                >
                                    Update Results
                                </button>
                                <button
                                    onClick={() => { setTempPriceRange({ min: '', max: '' }); setPriceRange({ min: '', max: '' }); setMobileFiltersOpen(false); }}
                                    className="w-full py-3 bg-white/50 text-foreground rounded-xl font-black uppercase tracking-widest text-[11px] border border-[#DCC8B0]/30 active:scale-95 transition-all"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

export default function CategoryPage({ params }) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-primary">Loading...</div>}>
            <CategoryContent params={params} />
        </Suspense>
    );
}
