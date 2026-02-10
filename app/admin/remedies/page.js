'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import Modal from '@/components/ui/Modal';
import { Plus, Trash, Image as ImageIcon, Check, X, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

// Custom Dropdown Component with Premium Theme
const CustomSelect = ({ value, onChange, options, placeholder, className, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Find label for value
    const selectedOption = options.find(o => o.value === value);
    const label = selectedOption ? selectedOption.label : placeholder;

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest focus:outline-none disabled:opacity-50 transition-all px-3 py-1.5 rounded-lg hover:bg-primary/5 ${value ? 'text-primary' : 'text-muted-foreground'
                    }`}
            >
                <span>{label}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white rounded-xl shadow-2xl border border-primary/20 py-2 z-50 flex flex-col animate-in fade-in zoom-in-95 duration-150 origin-top-left overflow-hidden">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`text-left px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all ${value === opt.value
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-primary hover:text-white'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                    {options.length === 0 && (
                        <div className="px-5 py-3 text-xs text-muted-foreground italic">No options</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function AdminRemediesPage() {
    const [types, setTypes] = useState([]);
    const [remedies, setRemedies] = useState([]);
    const [activeTab, setActiveTab] = useState('shop');
    const [loading, setLoading] = useState(true);

    // View Mode: 'remedies' or 'products'
    const [viewMode, setViewMode] = useState('remedies');
    const [products, setProducts] = useState([]);

    // Filter States for Remedies
    const [filterSection, setFilterSection] = useState('all');

    // Filter States for Products
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [isRemedyModalOpen, setIsRemedyModalOpen] = useState(false);

    // Form Data
    const [newType, setNewType] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        subcategory: '',
        image: '',
        section: 'must_have'
    });

    // Fetch Initial Data
    useEffect(() => {
        fetchTypes();
        fetchCategories(); // Fetch categories globally as they are needed for filters
    }, []);

    // Fetch Remedies when tab changes or filterSection changes (only if in remedies mode)
    useEffect(() => {
        // Fetch remedies whenever tab changes to ensure we have the list for comparison in Product Mode
        fetchRemedies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, filterSection, viewMode]);

    // ...

    // Fetch Products when filters change (only if in products mode)
    useEffect(() => {
        if (viewMode === 'products') {
            const timer = setTimeout(() => {
                fetchProducts();
            }, 500); // Debounce search
            return () => clearTimeout(timer);
        }
    }, [viewMode, selectedCategory, selectedSubcategory, searchQuery]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    const fetchTypes = async () => {
        try {
            const { data } = await api.get('/api/admin/remedies/types');
            setTypes(data);
            if (data.length > 0 && !activeTab) setActiveTab(data[0].slug);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load types');
        }
    };

    const fetchRemedies = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/remedies?type=${activeTab}`;
            // Only filter by section if we are explicitly viewing the Remedies list. 
            // In 'products' mode, we need ALL remedies to show "Added" status correctly.
            if (viewMode === 'remedies' && filterSection !== 'all') {
                url += `&section=${filterSection}`;
            }

            const { data } = await api.get(url);
            setRemedies(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let url = `/api/products?keyword=${searchQuery}`;
            if (selectedCategory) url += `&category=${selectedCategory}`;
            if (selectedSubcategory) url += `&subcategory=${selectedSubcategory}`;

            const { data } = await api.get(url);
            setProducts(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddType = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/remedies/types', { name: newType });
            toast.success('Type added successfully');
            setNewType('');
            setIsTypeModalOpen(false);
            fetchTypes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add type');
        }
    };

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddRemedy = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('type', activeTab);
            data.append('section', formData.section);
            data.append('title', formData.title);
            data.append('description', formData.description);

            // Optional fields
            if (formData.price) data.append('price', formData.price);
            if (formData.stock) data.append('stock', formData.stock);
            if (formData.category) data.append('category', formData.category);
            if (formData.subcategory) data.append('subcategory', formData.subcategory);

            // Image handling
            if (selectedFile) {
                data.append('image', selectedFile);
            } else if (formData.image) {
                data.append('image', formData.image);
            }

            await api.post('/api/admin/remedies', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Remedy created & synced to Products');
            setIsRemedyModalOpen(false);
            setFormData({
                title: '',
                description: '',
                price: '',
                stock: '',
                category: '',
                subcategory: '',
                image: '',
                section: 'must_have'
            });
            setSelectedFile(null);
            setPreviewUrl('');
            fetchRemedies();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create remedy');
        }
    };

    const handleDeleteRemedy = async (id) => {
        if (!window.confirm('Are you sure? This will also remove the synced Product.')) return;
        try {
            await api.delete(`/api/admin/remedies/${id}`);
            toast.success('Remedy deleted');
            fetchRemedies();
        } catch (error) {
            toast.error('Failed to delete remedy');
        }
    };

    // Derived subcategories based on selection
    const activeSubcategories = selectedCategory
        ? categories.find(c => c._id === selectedCategory || c.name === selectedCategory)?.subcategories || []
        : [];

    // Option Lists
    const sectionOptions = [
        { value: 'all', label: 'All Sections' },
        { value: 'must_have', label: 'Must Have' },
        { value: 'good_to_have', label: 'Good To Have' }
    ];

    const categoryOptions = [
        { value: '', label: 'All Categories' },
        ...categories.map(c => ({ value: c.name, label: c.name }))
    ];

    const subCategoryOptions = [
        { value: '', label: 'All Subcategories' },
        ...activeSubcategories.map(s => ({ value: s.name, label: s.name }))
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Remedies Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage dynamic remedy types and sync products automatically.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsTypeModalOpen(true)}
                        className="px-6 py-2.5 rounded-full border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-all"
                    >
                        + Add Type
                    </button>
                    <button
                        onClick={() => setIsRemedyModalOpen(true)}
                        className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        + Add Remedy
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-primary/10 pb-4">
                {types.map((type) => (
                    <button
                        key={type._id || type.slug}
                        onClick={() => {
                            setActiveTab(type.slug);
                            if (viewMode === 'products') setViewMode('remedies'); // Switch back to remedies if tab clicked
                        }}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === type.slug
                            ? 'bg-foreground text-white shadow-md'
                            : 'bg-white/50 text-muted-foreground hover:bg-white hover:text-foreground'
                            }`}
                    >
                        {type.name}
                    </button>
                ))}
            </div>

            {/* Filter Row - Enhanced */}
            <div className="flex flex-wrap items-center gap-6 bg-white/40 p-4 rounded-2xl border border-primary/5 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Filter By:</span>

                {/* 1. All Sections Filter (Remedies Mode Key) */}
                <CustomSelect
                    value={filterSection}
                    onChange={(val) => {
                        setFilterSection(val);
                        setViewMode('remedies');
                    }}
                    options={sectionOptions}
                    placeholder="All Sections"
                    className="z-50"
                />

                <div className="h-6 w-px bg-primary/10"></div>

                {/* 2. All Products Button */}
                <button
                    onClick={() => setViewMode('products')}
                    className={`text-xs font-bold uppercase tracking-widest transition-colors ${viewMode === 'products' ? 'text-primary underline decoration-2 underline-offset-4' : 'text-muted-foreground hover:text-primary'
                        }`}
                >
                    All Products
                </button>

                {/* Products Mode Filters */}
                {viewMode === 'products' && (
                    <>
                        {/* 3. Category Filter */}
                        <CustomSelect
                            value={selectedCategory}
                            onChange={(val) => {
                                setSelectedCategory(val);
                                setSelectedSubcategory('');
                            }}
                            options={categoryOptions}
                            placeholder="Category"
                            className="z-40"
                        />

                        {/* 4. SubCategory Filter */}
                        <CustomSelect
                            value={selectedSubcategory}
                            onChange={(val) => setSelectedSubcategory(val)}
                            options={subCategoryOptions}
                            placeholder="SubCategory"
                            disabled={!selectedCategory}
                            className="z-30"
                        />

                        {/* 5. Search Box */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-full bg-white/50 border border-primary/10 text-xs focus:outline-none focus:border-primary/30 text-foreground"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* List Content */}
            {loading ? (
                <div className="text-center py-20 text-muted-foreground text-xs uppercase tracking-widest">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
                    {/* View Mode: Remedies */}
                    {viewMode === 'remedies' && remedies.map((remedy) => (
                        <div key={remedy._id} className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-primary/10 shadow-sm hover:shadow-lg transition-all group relative">
                            <div className="absolute top-4 right-4 z-10">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${remedy.section === 'must_have' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {remedy.section.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <div className="h-48 w-full bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                                {remedy.product?.images?.[0] ? (
                                    <img
                                        src={remedy.product.images[0]}
                                        alt={remedy.product.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                            </div>

                            <h3 className="font-serif font-bold text-lg text-foreground mb-1">{remedy.product?.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{remedy.product?.description}</p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="font-mono font-bold text-primary">
                                    {remedy.product?.price ? `₹${remedy.product.price}` : 'Free / Quote'}
                                </span>
                                <button
                                    onClick={() => handleDeleteRemedy(remedy._id)}
                                    className="p-2 rounded-full hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* View Mode: Products */}
                    {viewMode === 'products' && products.map((product) => {
                        // Check if this product is already in the current remedies list
                        const existingRemedy = remedies.find(r => r.product?._id === product._id);

                        return (
                            <div
                                key={product._id}
                                className={`bg-white/60 backdrop-blur-md rounded-3xl p-5 border shadow-sm hover:shadow-lg transition-all group relative ${existingRemedy
                                    ? existingRemedy.section === 'must_have' ? 'border-red-200 ring-1 ring-red-100' : 'border-green-200 ring-1 ring-green-100'
                                    : 'border-primary/10'
                                    }`}
                            >
                                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 items-end">
                                    <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-blue-100 text-blue-600">
                                        {product.category || 'Product'}
                                    </span>
                                    {existingRemedy && (
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${existingRemedy.section === 'must_have' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            <Check size={10} strokeWidth={4} />
                                            {existingRemedy.section === 'must_have' ? 'Must Have' : 'Good To Have'}
                                        </span>
                                    )}
                                </div>

                                <div className="h-48 w-full bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-serif font-bold text-lg text-foreground mb-1">{product.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{product.description}</p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary/5">
                                    <span className="font-mono font-bold text-primary">
                                        {product.price ? `₹${product.price}` : 'Free'}
                                    </span>

                                    <div className="flex gap-2">
                                        {!existingRemedy ? (
                                            <>
                                                {(filterSection === 'all' || filterSection === 'must_have') && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await api.post('/api/admin/remedies/add-from-product', {
                                                                    productId: product._id,
                                                                    type: activeTab,
                                                                    tag: 'must_have'
                                                                });
                                                                toast.success('Added to Must Have');
                                                                fetchRemedies(); // Refresh to show added status
                                                            } catch (err) {
                                                                toast.error(err.response?.data?.message || 'Failed to add');
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
                                                    >
                                                        + Must Have
                                                    </button>
                                                )}
                                                {(filterSection === 'all' || filterSection === 'good_to_have') && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await api.post('/api/admin/remedies/add-from-product', {
                                                                    productId: product._id,
                                                                    type: activeTab,
                                                                    tag: 'good_to_have'
                                                                });
                                                                toast.success('Added to Good To Have');
                                                                fetchRemedies(); // Refresh to show added status
                                                            } catch (err) {
                                                                toast.error(err.response?.data?.message || 'Failed to add');
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-[9px] font-bold uppercase tracking-widest hover:bg-green-100 transition-colors"
                                                    >
                                                        + Good To Have
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <span className={`text-[10px] font-bold uppercase tracking-widest py-1.5 ${existingRemedy.section === 'must_have' ? 'text-red-400' : 'text-green-400'
                                                }`}>
                                                Added ({existingRemedy.section === 'must_have' ? 'Must' : 'Good'})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                    }

                    {
                        ((viewMode === 'remedies' && remedies.length === 0) || (viewMode === 'products' && products.length === 0)) && (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-muted-foreground text-sm">No items found.</p>
                            </div>
                        )
                    }
                </div >
            )
            }

            {/* Add Type Modal */}
            <Modal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} title="New Remedy Type">
                <form onSubmit={handleAddType} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Type Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-sm"
                            placeholder="e.g. Puja, Anushthan"
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90">
                        Create Type
                    </button>
                </form>
            </Modal>

            {/* Add Remedy Modal */}
            <Modal isOpen={isRemedyModalOpen} onClose={() => setIsRemedyModalOpen(false)} title={`Add ${activeTab} Remedy`}>
                <form onSubmit={handleAddRemedy} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Common Fields */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-sm"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Description</label>
                        <textarea
                            required
                            rows="3"
                            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-sm"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Conditional Fields based on Active Tab */}
                    {activeTab === 'shop' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-sm"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-sm"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Category</label>
                                    <CustomSelect
                                        value={formData.category}
                                        onChange={(val) => setFormData({ ...formData, category: val, subcategory: '' })}
                                        options={categories.map(c => ({ value: c.name, label: c.name }))}
                                        placeholder="Select Category"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Sub Category</label>
                                    <CustomSelect
                                        value={formData.subcategory}
                                        onChange={(val) => setFormData({ ...formData, subcategory: val })}
                                        options={
                                            formData.category
                                                ? (categories.find(c => c.name === formData.category)?.subcategories || []).map(s => ({ value: s.name, label: s.name }))
                                                : []
                                        }
                                        placeholder="Select Sub Category"
                                        disabled={!formData.category}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Optional Price for Others */}
                    {activeTab !== 'shop' && (
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Price (Optional)</label>
                            <input
                                type="number"
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-sm"
                                placeholder="Leave 0 for free/quote"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Image Upload</label>
                        <div className="flex items-center gap-4">
                            {/* Preview */}
                            {previewUrl && (
                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-primary/20 shadow-sm relative group">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                                        className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            {/* File Input */}
                            <label className="flex-1 cursor-pointer">
                                <div className="w-full p-3 rounded-xl bg-gray-50 border border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary transition-all flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <ImageIcon size={16} />
                                    <span className="font-medium text-xs uppercase tracking-widest">
                                        {selectedFile ? 'Change Image' : 'Select Image'}
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {/* Fallback URL input (optional, can be hidden if file only) */}
                        <div className="mt-2 text-[10px] text-muted-foreground text-center">- OR -</div>
                        <input
                            type="text"
                            className="w-full p-2 mt-2 rounded-xl bg-transparent border-b border-gray-200 focus:outline-none focus:border-primary text-xs text-center placeholder-gray-300"
                            placeholder="Paste Image URL"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        />
                    </div>

                    {/* Tag Selection */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Tag</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="section"
                                    value="must_have"
                                    checked={formData.section === 'must_have'}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    className="accent-primary"
                                />
                                <span className="text-sm">Must Have</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="section"
                                    value="good_to_have"
                                    checked={formData.section === 'good_to_have'}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    className="accent-primary"
                                />
                                <span className="text-sm">Good To Have</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90 mt-4">
                        Save Remedy
                    </button>
                    <p className="text-[10px] text-center text-muted-foreground mt-2">
                        This will automatically create a synced product.
                    </p>
                </form>
            </Modal>
        </div >
    );
}
