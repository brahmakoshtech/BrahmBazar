'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Ticket, Search, Calendar } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { success, error: toastError } = useToast();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0,
        expiryDate: '',
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);

    const [categoriesData, setCategoriesData] = useState([]);

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/api/coupons');
            setCoupons(data);
        } catch (err) {
            console.error(err);
            toastError('Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategoriesData(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCoupons();
        fetchCategories();
    }, []);

    const resetForm = () => {
        setFormData({
            code: '',
            discountType: 'percentage',
            discountValue: 0,
            minOrderAmount: 0,
            expiryDate: '',
            isActive: true,
            applicableCategory: '',
            applicableSubcategory: ''
        });
        setEditingCoupon(null);
    };

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minOrderAmount: coupon.minOrderAmount || 0,
                expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
                isActive: coupon.isActive,
                applicableCategory: coupon.applicableCategory || '',
                applicableSubcategory: coupon.applicableSubcategory || ''
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingCoupon) {
                await api.put(`/api/coupons/${editingCoupon._id}`, formData);
                success('Coupon updated successfully');
            } else {
                await api.post('/api/coupons', formData);
                success('Coupon created successfully');
            }
            setIsModalOpen(false);
            fetchCoupons();
        } catch (err) {
            toastError(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to disable/delete this coupon?')) return;
        try {
            await api.delete(`/api/coupons/${id}`);
            success('Coupon disabled');
            fetchCoupons();
        } catch (err) {
            toastError('Failed to delete coupon');
        }
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="p-8 space-y-6 animate-pulse">
            <div className="flex justify-between items-center mb-8">
                <div className="w-64 h-12 bg-white/40 rounded-full border border-primary/10" />
                <div className="w-40 h-10 bg-white/40 rounded-full border border-primary/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-56 w-full bg-white/40 rounded-3xl border border-primary/10 shadow-sm" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground italic">Promotion Ledger</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Govern the sacred discount passages.</p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus size={16} />}
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-foreground text-white font-bold px-8 py-3.5 rounded-full shadow-xl shadow-primary/10 transition-all uppercase text-[10px] tracking-widest border-none"
                >
                    Forge Coupon
                </Button>
            </div>

            {/* Search */}
            <div className="relative mb-10 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                <input
                    type="text"
                    placeholder="Search sacred codes..."
                    className="w-full pl-12 pr-6 py-4 rounded-full bg-white/60 backdrop-blur-md border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 text-foreground placeholder-gray-400 transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Coupons List */}
            {filteredCoupons.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-primary/10 p-20 text-center animate-in fade-in slide-in-from-bottom-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Ticket size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-foreground mb-2">No Tokens Found</h3>
                    <p className="text-muted-foreground mb-8">Establish your first discount ritual to begin.</p>
                    <Button onClick={() => handleOpenModal()} className="rounded-full px-8 uppercase text-[10px] tracking-widest font-bold">Forge Token</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCoupons.map((coupon) => (
                        <div key={coupon._id} className="group bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-primary/10 shadow-lg hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all p-8 relative flex flex-col animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-serif font-bold text-foreground italic">{coupon.code}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[9px] uppercase font-bold tracking-widest border shadow-sm ${coupon.isActive ? 'bg-green-500 text-white border-green-600' : 'bg-red-500 text-white border-red-600'}`}>
                                            {coupon.isActive ? 'Active' : 'Expired'}
                                        </span>
                                    </div>
                                    <div className="text-primary font-serif font-bold text-lg italic bg-primary/5 w-fit px-4 py-1 rounded-full border border-primary/10">
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <button onClick={() => handleOpenModal(coupon)} className="p-3 bg-white shadow-xl rounded-full text-foreground hover:bg-foreground hover:text-background transition-all">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(coupon._id)} className="p-3 bg-white shadow-xl rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="flex justify-between py-3 border-t border-primary/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>Threshold</span>
                                    <span className="text-foreground">₹{coupon.minOrderAmount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-2 text-muted-foreground"><Calendar size={12} className="text-primary" /> Expiration</span>
                                    <span className={new Date(coupon.expiryDate) < new Date() ? 'text-red-500' : 'text-foreground font-serif italic'}>
                                        {new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                {(coupon.applicableCategory) && (
                                    <div className="text-[9px] font-bold uppercase tracking-widest bg-primary/5 rounded-2xl px-4 py-2 border border-primary/10 mt-2 flex items-center justify-between">
                                        <span className="text-muted-foreground">Domain:</span>
                                        <div className="text-right">
                                            <span className="text-primary">{coupon.applicableCategory}</span>
                                            {coupon.applicableSubcategory && <span className="text-muted-foreground ml-1">({coupon.applicableSubcategory})</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE/EDIT MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCoupon ? 'Edit Coupon' : 'New Coupon'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Sacred Code</label>
                        <input
                            type="text"
                            required
                            className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground placeholder-gray-400 transition-all font-bold text-sm font-mono uppercase tracking-[0.1em]"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Benefit Type</label>
                            <select
                                className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground transition-all font-bold text-sm appearance-none cursor-pointer"
                                value={formData.discountType}
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat Amount (₹)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Magnitude</label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground transition-all font-bold text-sm"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Minimum Offer</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground transition-all font-bold text-sm"
                                value={formData.minOrderAmount}
                                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Sacred Expiry</label>
                            <input
                                type="date"
                                required
                                className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground transition-all font-bold text-sm appearance-none"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Domain Exclusion (Optional)</label>
                            <select
                                className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground transition-all font-bold text-sm appearance-none cursor-pointer"
                                value={formData.applicableCategory}
                                onChange={(e) => setFormData({ ...formData, applicableCategory: e.target.value, applicableSubcategory: '' })}
                            >
                                <option value="">All Sacred Goods</option>
                                {categoriesData.map(cat => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Specific Lineage (Optional)</label>
                            <select
                                className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-primary/10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground transition-all font-bold text-sm appearance-none cursor-pointer disabled:opacity-30"
                                value={formData.applicableSubcategory}
                                onChange={(e) => setFormData({ ...formData, applicableSubcategory: e.target.value })}
                                disabled={!formData.applicableCategory}
                            >
                                <option value="">Entire Category</option>
                                {formData.applicableCategory && categoriesData.find(c => c.name === formData.applicableCategory)?.subcategories?.map((sub, idx) => (
                                    <option key={idx} value={sub.slug}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10 w-fit">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-6 h-6 rounded-lg bg-white border-primary/20 text-primary focus:ring-primary"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label htmlFor="isActive" className="text-[10px] font-bold text-foreground uppercase tracking-widest cursor-pointer">Manifest Code (Active)</label>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-primary/10 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full px-8 text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Withdraw</Button>
                        <Button type="submit" variant="primary" isLoading={submitting} className="rounded-full px-10 bg-primary text-white shadow-xl shadow-primary/20 uppercase text-[10px] tracking-widest font-bold border-none">
                            {editingCoupon ? 'Finalize Changes' : 'Manifest Ritual'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
