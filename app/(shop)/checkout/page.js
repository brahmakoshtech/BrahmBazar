'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, ShieldCheck, MapPin, Phone, User, Globe, Trash2, Edit2, Plus } from 'lucide-react';

export default function CheckoutPage() {
    const { cartCount, refreshCounts } = useCart();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isNewAddress, setIsNewAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);

    const fetchAddresses = async (forceSelectId = null) => {
        try {
            const { data } = await api.get('/api/checkout/address');
            setSavedAddresses(data);
            if (data && data.length > 0) {
                if (forceSelectId) {
                    setSelectedAddressId(forceSelectId);
                } else if (!selectedAddressId) {
                    const defaultAddr = data.find(a => a.isDefault) || data[0];
                    setSelectedAddressId(defaultAddr._id);
                }

                // If we forced a selection (completed save), ensure form is closed
                if (forceSelectId || !editingAddressId) {
                    setIsNewAddress(false);
                }
            } else {
                setIsNewAddress(true);
            }
        } catch (err) {
            console.error("Failed to fetch addresses", err);
            setIsNewAddress(true);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleDeleteAddress = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await api.delete(`/api/user/address/delete/${id}`);
            // If deleted address was selected, reset selection handled by fetch?
            if (selectedAddressId === id) setSelectedAddressId(null);
            fetchAddresses();
        } catch (err) {
            alert('Failed to delete address');
        }
    };

    const handleEditAddress = (e, addr) => {
        e.stopPropagation();
        setFormData(prev => ({
            ...prev,
            fullName: addr.fullName,
            address: addr.addressLine1,
            city: addr.city,
            state: addr.state,
            postalCode: addr.pincode,
            country: addr.country,
            phone: addr.phone,
        }));
        setEditingAddressId(addr._id);
        setIsNewAddress(true);
    };

    const handleCancelAddress = () => {
        setIsNewAddress(false);
        setEditingAddressId(null);
        setFormData(prev => ({ ...prev, fullName: '', address: '', city: '', state: '', postalCode: '', phone: '' }));
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop bubbling
        setSubmitting(true);
        try {
            let savedId;
            // Map form data to backend schema
            const payload = {
                fullName: formData.fullName,
                phone: formData.phone,
                addressLine1: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.postalCode,
                country: formData.country || 'India'
            };

            if (editingAddressId) {
                // Update
                const { data } = await api.put(`/api/user/address/update/${editingAddressId}`, payload);
                savedId = data._id;
                setEditingAddressId(null);
            } else {
                // Create New
                const { data } = await api.post('/api/user/address/add', {
                    ...payload,
                    isDefault: savedAddresses.length === 0
                });
                savedId = data._id;
            }

            // Refresh and Select
            await fetchAddresses(savedId);
            setIsNewAddress(false);
            setFormData(prev => ({ ...prev, fullName: '', address: '', city: '', state: '', postalCode: '', phone: '' }));

        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save address');
        } finally {
            setSubmitting(false);
        }
    };

    // Form State matches Backend Order Schema
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        phone: '',
        paymentMethod: 'COD' // Default
    });

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount }
    const [couponMessage, setCouponMessage] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setApplyingCoupon(true);
        setCouponMessage('');
        try {
            // Need to calculate subtotal first to send validation request
            // Or better, send cartItems and let backend calculate eligibility and amount
            const subTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

            const { data } = await api.post('/api/coupons/apply', {
                couponCode,
                cartTotal: subTotal,
                cartItems: cartItems // Send items for category validation
            });

            setAppliedCoupon({
                code: data.couponCode,
                discountAmount: data.discountAmount
            });
            setCouponMessage('Coupon applied successfully!');
            // Update total with discount (Need to account for GST? Usually discount is on price)
            // Let's assume Discount reduces the Taxable Value. 
            // So New Subtotal = Subtotal - Discount. 
            // New GST = (Subtotal - Discount) * 0.18
            // Check logic below in rendering.

        } catch (err) {
            setCouponMessage(err.response?.data?.message || 'Invalid Coupon');
            setAppliedCoupon(null);
        } finally {
            setApplyingCoupon(false);
        }
    };

    // Auto-Apply Coupon Logic
    useEffect(() => {
        const autoApplyCoupon = async () => {
            if (cartItems.length === 0 || appliedCoupon) return; // Don't override if already applied or empty

            try {
                const { data: coupons } = await api.get('/api/coupons/active');
                if (!coupons || coupons.length === 0) return;

                // Find best coupon
                let bestCoupon = null;
                let maxDiscount = 0;

                const cartTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

                // Helper to calc discount (simplified version of backend logic for client-side estimation)
                const calculatePotentialDiscount = (coupon) => {
                    // Check Min Order
                    if (cartTotal < (coupon.minOrderAmount || 0)) return 0;

                    let eligibleAmount = 0;

                    if (coupon.applicableCategory) {
                        let hasItem = false;
                        cartItems.forEach(item => {
                            let isMatch = false;
                            if (item.product.category?.toLowerCase() === coupon.applicableCategory.toLowerCase()) {
                                isMatch = true;
                                if (coupon.applicableSubcategory && item.product.subcategory?.toLowerCase() !== coupon.applicableSubcategory.toLowerCase()) {
                                    isMatch = false;
                                }
                            }
                            if (isMatch) {
                                eligibleAmount += (item.product.price * item.quantity);
                                hasItem = true;
                            }
                        });
                        if (!hasItem) return 0;
                    } else {
                        eligibleAmount = cartTotal;
                    }

                    if (eligibleAmount === 0) return 0;

                    let discount = 0;
                    if (coupon.discountType === 'percentage') {
                        discount = (eligibleAmount * coupon.discountValue) / 100;
                        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) discount = coupon.maxDiscountAmount;
                    } else {
                        discount = coupon.discountValue;
                        if (discount > eligibleAmount) discount = eligibleAmount;
                    }
                    return discount;
                };

                coupons.forEach(c => {
                    const discount = calculatePotentialDiscount(c);
                    if (discount > maxDiscount) {
                        maxDiscount = discount;
                        bestCoupon = c;
                    }
                });

                if (bestCoupon && maxDiscount > 0) {
                    setCouponCode(bestCoupon.code);
                    // Automatically trigger apply
                    // We can't call handleApplyCoupon directly easily inside useEffect due to dependencies loop risk or async nature.
                    // Instead, we just set the code and let the user click OR we call the API directly here.
                    // Better UX: Call API directly.

                    const { data } = await api.post('/api/coupons/apply', {
                        couponCode: bestCoupon.code,
                        cartTotal: cartTotal,
                        cartItems: cartItems
                    });

                    setAppliedCoupon({
                        code: data.couponCode,
                        discountAmount: data.discountAmount
                    });
                    setCouponMessage(`Best offer '${bestCoupon.code}' auto-applied!`);
                }

            } catch (err) {
                console.error("Auto-apply failed", err);
            }
        };

        // Delay slightly to ensure cart is ready? 
        // cartItems dependency handles it.
        if (cartItems.length > 0 && !appliedCoupon) {
            autoApplyCoupon();
        }
    }, [cartItems]); // Run when cart loads. Warning: if cartItems change, it might re-apply. 
    // Usually acceptable: if I add more items, maybe a better coupon applies?
    // But if I manually removed a coupon, I don't want it re-applied.
    // We need a 'userManuallyRemoved' flag?
    // For now, simplicity: If appliedCoupon is null, try to apply.

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponMessage('');
        // To prevent auto-reapply immediately, we might need state.
        // But the useEffect has [cartItems] dependency. Removing coupon doesn't change cartItems.
        // So it WON'T re-run automatically just by removing coupon.
        // It WILL re-run if I add an item. That's actually good feature.
    };

    // Recalculate Total when Cart or Coupon changes
    useEffect(() => {
        if (cartItems.length > 0) {
            const subTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
            const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
            const taxableAmount = Math.max(0, subTotal - discount);
            const gst = taxableAmount * 0.18;
            const grandTotal = Math.round(taxableAmount + gst);
            setTotal(grandTotal);
        }
    }, [cartItems, appliedCoupon]);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const { data } = await api.get('/api/cart');
                const items = Array.isArray(data) ? data : (data.items || []);
                setCartItems(items);
                // Initial calc handled by the other useEffect
            } catch (error) {
                console.error('Failed to fetch cart:', error);
                router.push('/cart');
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (editingAddressId) {
            try {
                await api.put(`/api/user/address/update/${editingAddressId}`, {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    addressLine1: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.postalCode,
                    country: formData.country || 'India'
                });

                await fetchAddresses();
                setEditingAddressId(null);
                setIsNewAddress(false);
                setFormData(prev => ({
                    ...prev,
                    fullName: '', address: '', city: '', state: '', postalCode: '', phone: ''
                }));

            } catch (err) {
                alert(err.response?.data?.message || 'Failed to update address');
            } finally {
                setSubmitting(false);
            }
            return;
        }

        try {
            let payload = {
                paymentMethod: formData.paymentMethod
            };

            if (isNewAddress) {
                payload.shippingAddress = {
                    fullName: formData.fullName,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: formData.country,
                    phone: formData.phone
                };
            } else {
                payload.addressId = selectedAddressId;
            }

            // 1. Create Order
            const { data: orderData } = await api.post('/api/checkout', {
                ...payload,
                couponCode: appliedCoupon ? (appliedCoupon.code || appliedCoupon) : null
            });

            // 2. Clear Cart
            refreshCounts();

            // 3. Handle Payment Flow
            if (formData.paymentMethod === 'Card') {
                try {
                    const { data: sessionData } = await api.post('/api/payment/create-checkout-session', {
                        orderId: orderData._id,
                        cartItems: cartItems,
                        addressId: selectedAddressId
                    });

                    if (sessionData.url) {
                        window.location.href = sessionData.url;
                    } else {
                        throw new Error('Failed to retrieve payment URL');
                    }
                } catch (paymentError) {
                    console.error('Payment Session Creation Failed:', paymentError);
                    alert(paymentError.response?.data?.message || 'Order created but payment failed. Redirecting to order details...');
                    router.push(`/order-success/${orderData._id}`);
                }
            } else {
                router.push(`/order-success/${orderData._id}`);
            }

        } catch (error) {
            console.error('Checkout failed:', error);
            alert(error.response?.data?.message || 'Checkout failed. Please try again.');
        } finally {
            if (formData.paymentMethod !== 'Card') {
                setSubmitting(false);
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                <ShieldCheck size={48} className="text-secondary mb-4 opacity-40" />
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">Your cart is empty</h2>
                <button
                    onClick={() => router.push('/')}
                    className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition-all"
                >
                    Return to Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent py-4 md:py-8 font-sans text-foreground selection:bg-primary/20">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header Phase */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">Checkout</h1>
                    <div className="flex items-center justify-center gap-2 md:gap-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                        <span className="text-secondary">Cart</span>
                        <span className="opacity-30">/</span>
                        <span className="text-foreground">Shipping</span>
                        <span className="opacity-30">/</span>
                        <span>Payment</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8 items-start">

                    {/* LEFT COLUMN: Forms */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* 1. SHIPPING DETAILS */}
                        <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-primary/10">
                            <div className="flex items-center gap-3 mb-4 border-b border-primary/10 pb-3">
                                <div className="bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">1</div>
                                <h2 className="text-lg font-serif font-bold text-foreground tracking-wide">Shipping Details</h2>
                            </div>

                            {/* Saved Addresses Selection */}
                            {savedAddresses.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {savedAddresses.map((addr) => (
                                        <div key={addr._id}>
                                            {editingAddressId === addr._id ? (
                                                /* EDIT FORM Inline */
                                                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 animate-in fade-in">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">Edit Address</h3>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Full Name</label>
                                                            <input
                                                                type="text"
                                                                name="fullName"
                                                                value={formData.fullName}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Phone</label>
                                                            <input
                                                                type="tel"
                                                                name="phone"
                                                                value={formData.phone}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Address</label>
                                                            <input
                                                                name="address"
                                                                value={formData.address}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">City</label>
                                                            <input
                                                                name="city"
                                                                value={formData.city}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">State</label>
                                                            <input
                                                                name="state"
                                                                value={formData.state}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Pincode</label>
                                                            <input
                                                                name="postalCode"
                                                                value={formData.postalCode}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Country</label>
                                                            <input
                                                                name="country"
                                                                value={formData.country}
                                                                readOnly
                                                                className="w-full px-3 py-2 text-sm rounded-lg bg-primary/5 border border-primary/10 text-muted-foreground cursor-not-allowed"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3 mt-4 pt-3 border-t border-primary/10">
                                                        <button
                                                            onClick={handleSaveAddress}
                                                            disabled={submitting}
                                                            className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-bold block"
                                                        >
                                                            {submitting ? 'Updating...' : 'Update Address'}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelAddress}
                                                            disabled={submitting}
                                                            className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground border border-primary/10 hover:bg-white transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* VIEW CARD */
                                                <div
                                                    onClick={() => {
                                                        if (editingAddressId) return;
                                                        setSelectedAddressId(addr._id);
                                                        setIsNewAddress(false);
                                                    }}
                                                    className={`group relative p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${selectedAddressId === addr._id && !isNewAddress && !editingAddressId ? 'border-primary bg-primary/5 shadow-sm' : 'border-primary/10 hover:border-primary/30'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 ${selectedAddressId === addr._id && !isNewAddress && !editingAddressId ? 'border-primary' : 'border-gray-400'}`}>
                                                        {selectedAddressId === addr._id && !isNewAddress && !editingAddressId && <div className="w-2 h-2 rounded-full bg-primary" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-foreground text-xs md:text-sm">{addr.fullName} <span className="text-[10px] md:text-xs font-normal text-muted-foreground ml-2">{addr.phone}</span></p>
                                                        <p className="text-xs md:text-sm text-muted-foreground mt-0.5 leading-tight">
                                                            {addr.addressLine1}{addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, {addr.city}, {addr.state} - {addr.pincode}
                                                        </p>
                                                        {addr.isDefault && <span className="inline-block mt-1 text-[8px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Default</span>}
                                                    </div>

                                                    {/* Action Buttons - Only show if not editing anything else */}
                                                    {!editingAddressId && (
                                                        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => handleEditAddress(e, addr)}
                                                                className="p-1.5 hover:bg-white rounded-md text-muted-foreground hover:text-primary transition-colors"
                                                                title="Edit Address"
                                                            >
                                                                <Edit2 size={12} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteAddress(e, addr._id)}
                                                                className="p-1.5 hover:bg-white rounded-md text-muted-foreground hover:text-red-500 transition-colors"
                                                                title="Delete Address"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* New Address Option - Only show if NOT editing */}
                                    {!editingAddressId && (
                                        <div
                                            onClick={() => {
                                                setIsNewAddress(true);
                                                setEditingAddressId(null);
                                                setFormData(prev => ({ ...prev, fullName: '', address: '', city: '', state: '', postalCode: '', phone: '' }));
                                                setSelectedAddressId(null);
                                            }}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${isNewAddress ? 'border-primary bg-primary/5 shadow-sm' : 'border-primary/10 hover:border-primary/30'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isNewAddress ? 'border-primary' : 'border-gray-400'}`}>
                                                {isNewAddress && <div className="w-2 h-2 rounded-full bg-primary" />}
                                            </div>
                                            <span className="font-bold text-xs md:text-sm text-foreground">Add New Address</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* NEW Address Form - Only for Adding New (isNewAddress=true & editing=null) */}
                            {(isNewAddress && !editingAddressId) || (savedAddresses.length === 0 && !editingAddressId) ? (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 bg-primary/5 p-4 rounded-xl border border-primary/10 mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">Add New Address</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Full Name</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary"
                                                placeholder="Enter Full Name"
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary"
                                                placeholder="+91"
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Address</label>
                                            <input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary"
                                                placeholder="Address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">City</label>
                                            <input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary"
                                                placeholder="City"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">State</label>
                                            <input
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary"
                                                placeholder="State"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Pincode</label>
                                            <input
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary"
                                                placeholder="000 000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Country</label>
                                            <input
                                                name="country"
                                                value={formData.country}
                                                readOnly
                                                className="w-full px-3 py-2 text-sm rounded-lg bg-primary/5 border border-primary/10 text-muted-foreground cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-4 pt-3 border-t border-primary/10">
                                        <button
                                            onClick={handleSaveAddress}
                                            disabled={submitting}
                                            className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-bold shadow-sm"
                                        >
                                            {submitting ? 'Saving...' : 'Save & Use Address'}
                                        </button>
                                        {savedAddresses.length > 0 && (
                                            <button
                                                onClick={handleCancelAddress}
                                                disabled={submitting}
                                                className="px-4 py-2.5 rounded-lg text-sm font-bold text-muted-foreground border border-primary/10 hover:bg-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* 2. PAYMENT METHOD */}
                        <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-primary/10">
                            <div className="flex items-center gap-3 mb-4 border-b border-primary/10 pb-3">
                                <div className="bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">2</div>
                                <h2 className="text-lg font-serif font-bold text-foreground tracking-wide">Payment Method</h2>
                            </div>

                            <div className="space-y-3">
                                <label className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 group ${formData.paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-primary/10 hover:border-primary/30 hover:bg-white/40'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={formData.paymentMethod === 'COD'}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <div className="ml-4 flex-1">
                                        <span className={`block font-bold text-base ${formData.paymentMethod === 'COD' ? 'text-secondary' : 'text-foreground'}`}>Cash on Delivery</span>
                                        <span className="block text-xs text-muted-foreground mt-0.5">Pay when your sacred order arrives.</span>
                                    </div>
                                    <Truck size={20} className={`${formData.paymentMethod === 'COD' ? 'text-secondary' : 'text-muted-foreground opacity-40'}`} />
                                </label>

                                <label className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 group ${formData.paymentMethod === 'Card' ? 'border-primary bg-primary/5' : 'border-primary/10 hover:border-primary/30 hover:bg-white/40'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Card"
                                        checked={formData.paymentMethod === 'Card'}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <div className="ml-4 flex-1">
                                        <span className={`block font-bold text-base ${formData.paymentMethod === 'Card' ? 'text-secondary' : 'text-foreground'}`}>Pay Online</span>
                                        <span className="block text-xs text-muted-foreground mt-0.5">Cards, UPI, Netbanking (Secure via Stripe).</span>
                                    </div>
                                    <CreditCard size={20} className={`${formData.paymentMethod === 'Card' ? 'text-secondary' : 'text-muted-foreground opacity-40'}`} />
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Order Summary (Sticky) */}
                    <div className="lg:col-span-1 lg:sticky lg:top-4">
                        <div className="bg-neutral-900 p-5 rounded-2xl shadow-2xl border border-white/10">
                            <h2 className="text-lg font-serif font-bold text-white mb-4 tracking-wide">Your Order</h2>

                            {/* COUPON INPUT */}
                            <div className="mb-4 relative">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Coupon Code"
                                        className="flex-1 bg-white border border-primary/10 rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none uppercase font-mono"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={appliedCoupon}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={!couponCode || applyingCoupon || appliedCoupon}
                                        className="bg-primary hover:opacity-90 text-white px-3 py-2 rounded-lg text-[10px] font-bold uppercase disabled:opacity-50 transition-all"
                                    >
                                        {applyingCoupon ? '...' : appliedCoupon ? 'Applied' : 'Apply'}
                                    </button>
                                </div>
                                {couponMessage && (
                                    <p className={`text-[10px] mt-1 ${couponMessage.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                                        {couponMessage}
                                    </p>
                                )}
                                {appliedCoupon && (
                                    <button
                                        onClick={handleRemoveCoupon}
                                        className="text-[10px] text-red-500 hover:text-red-400 mt-1 underline"
                                    >
                                        Remove Coupon
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3 mb-4 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="flex gap-3 items-start">
                                        <div className="w-12 h-12 bg-white/5 rounded-md overflow-hidden border border-white/10 flex-shrink-0">
                                            <img src={item.product?.images?.[0]} alt={item.title} className="w-full h-full object-cover opacity-90" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xs md:text-sm font-bold text-foreground line-clamp-2 leading-tight text-white/90">{item.product?.title}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Qty: {item.quantity}</p>
                                                <p className="text-xs md:text-sm font-bold text-primary italic">₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-primary/10 pt-4 space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-white/80">
                                        ₹{cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-xs text-green-500 font-bold">
                                        <span>Discount ({appliedCoupon.code})</span>
                                        <span className="font-medium">-₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>GST (18%)</span>
                                    <span className="font-medium text-white/80">
                                        ₹{Math.round(Math.max(0, (cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) - (appliedCoupon?.discountAmount || 0))) * 0.18).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground items-center">
                                    <span>Shipping</span>
                                    <span className="text-white font-bold text-[9px] uppercase bg-secondary px-1.5 py-0.5 rounded-full">Free</span>
                                </div>
                                <div className="flex justify-between text-lg font-serif font-bold text-white pt-3 border-t border-primary/10 mt-1">
                                    <span>Total</span>
                                    <span className="text-primary italic">₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || isNewAddress || editingAddressId}
                                className={`w-full mt-6 py-3 rounded-full font-bold text-base shadow-lg hover:shadow-primary/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
                                    ${submitting || isNewAddress || editingAddressId ? 'bg-muted cursor-not-allowed text-muted-foreground' : 'bg-foreground text-background hover:bg-secondary hover:text-white'}
                                `}
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2 font-bold"><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Processing...</span>
                                ) : (
                                    <>
                                        {(isNewAddress || editingAddressId) ? 'Save Address First' : (formData.paymentMethod === 'Card' ? 'Pay Securely' : 'Place Order')}
                                    </>
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                                <ShieldCheck size={12} className="text-secondary" />
                                <span>Secured by BRAHMAKOSH</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
