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
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="w-48 h-10 rounded-lg bg-neutral-900 border border-white/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-2xl bg-neutral-900 border border-white/10" />
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Coupons</h1>
                    <p className="text-gray-400 mt-1">Manage discount codes</p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus size={20} />}
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-white hover:text-black text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
                >
                    Create Coupon
                </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search coupons..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-white/10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 text-white placeholder-gray-600 transition-all font-sans"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Coupons List */}
            {filteredCoupons.length === 0 ? (
                <EmptyState
                    icon={<Ticket size={48} className="text-gray-600" />}
                    title="No coupons found"
                    description="Create a discount code to attract customers."
                    actionLabel="Create Coupon"
                    onAction={() => handleOpenModal()}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCoupons.map((coupon) => (
                        <div key={coupon._id} className="group bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-white/5 shadow-lg hover:border-primary/30 transition-all p-6 relative flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold text-white font-mono tracking-wider">{coupon.code}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${coupon.isActive ? 'bg-green-900/40 text-green-400 border-green-500/30' : 'bg-red-900/40 text-red-400 border-red-500/30'}`}>
                                            {coupon.isActive ? 'Active' : 'Expired'}
                                        </span>
                                    </div>
                                    <p className="text-primary font-bold mt-1">
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                    </p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(coupon)} className="p-2 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(coupon._id)} className="p-2 bg-white/10 rounded-full hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto space-y-2 text-sm text-gray-400">
                                <div className="flex justify-between py-2 border-t border-white/5">
                                    <span>Min Order:</span>
                                    <span className="text-white">₹{coupon.minOrderAmount}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> Expires:</span>
                                    <span className={new Date(coupon.expiryDate) < new Date() ? 'text-red-400' : 'text-white'}>
                                        {new Date(coupon.expiryDate).toLocaleDateString()}
                                    </span>
                                </div>
                                {(coupon.applicableCategory) && (
                                    <div className="text-[10px] bg-white/5 rounded px-2 py-1 mt-1 border border-white/10">
                                        <span className="text-gray-400">Valid on: </span>
                                        <span className="text-primary">{coupon.applicableCategory}</span>
                                        {coupon.applicableSubcategory && <span className="text-gray-300"> ({coupon.applicableSubcategory})</span>}
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Coupon Code</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all uppercase font-mono"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white transition-all"
                                value={formData.discountType}
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat Amount (₹)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Value</label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white transition-all"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Min Order Amount</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white transition-all"
                                value={formData.minOrderAmount}
                                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expiration Date</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white transition-all"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Target Category (Optional)</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white transition-all"
                                value={formData.applicableCategory}
                                onChange={(e) => setFormData({ ...formData, applicableCategory: e.target.value, applicableSubcategory: '' })}
                            >
                                <option value="">All Categories</option>
                                {categoriesData.map(cat => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subcategory (Optional)</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white transition-all"
                                value={formData.applicableSubcategory}
                                onChange={(e) => setFormData({ ...formData, applicableSubcategory: e.target.value })}
                                disabled={!formData.applicableCategory}
                            >
                                <option value="">All Subcategories</option>
                                {formData.applicableCategory && categoriesData.find(c => c.name === formData.applicableCategory)?.subcategories?.map((sub, idx) => (
                                    <option key={idx} value={sub.slug}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-5 h-5 rounded bg-neutral-900 border-gray-600 text-primary focus:ring-primary focus:ring-offset-gray-900"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-300">Active Status</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5">Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={submitting} className="bg-primary hover:bg-white hover:text-black text-black font-bold border-none">
                            {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
