'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, ShieldCheck, MapPin, Phone, User, Globe } from 'lucide-react';

export default function CheckoutPage() {
    const { cartCount, refreshCounts } = useCart();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

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

        try {
            const payload = {
                shippingAddress: {
                    fullName: formData.fullName,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: formData.country,
                    phone: formData.phone
                },
                paymentMethod: formData.paymentMethod
            };

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
                        cartItems: cartItems
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
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-center">
                <ShieldCheck size={48} className="text-gray-600 mb-4" />
                <h2 className="text-xl font-serif font-bold text-white mb-2">Your cart is empty</h2>
                <button onClick={() => router.push('/')} className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors">Return to Home</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black py-12 md:py-16 font-sans text-white selection:bg-primary/30">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header Phase */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">Checkout</h1>
                    <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
                        <span className="text-primary font-medium">Cart</span>
                        <span className="opacity-50">&gt;</span>
                        <span className="text-white font-bold tracking-wide">Shipping & Payment</span>
                        <span className="opacity-50">&gt;</span>
                        <span>Confirmation</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

                    {/* LEFT COLUMN: Forms */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. SHIPPING DETAILS */}
                        <div className="bg-neutral-900/50 p-6 md:p-8 rounded-2xl shadow-xl border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-5">
                                <div className="bg-primary text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                                <h2 className="text-xl font-serif font-bold text-white tracking-wide">Shipping Details</h2>
                            </div>

                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Address</label>
                                        <input
                                            name="address"
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="Flat No, Building, Street"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">PIN Code</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="000000"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            required
                                            readOnly
                                            className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-white/10 text-gray-500 cursor-not-allowed outline-none"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* 2. PAYMENT METHOD */}
                        <div className="bg-neutral-900/50 p-6 md:p-8 rounded-2xl shadow-xl border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-5">
                                <div className="bg-primary text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                                <h2 className="text-xl font-serif font-bold text-white tracking-wide">Payment Method</h2>
                            </div>

                            <div className="space-y-4">
                                <label className={`relative flex items-center p-5 border rounded-xl cursor-pointer transition-all duration-300 group ${formData.paymentMethod === 'COD' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={formData.paymentMethod === 'COD'}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 accent-primary bg-black border-white/30"
                                    />
                                    <div className="ml-5 flex-1">
                                        <span className={`block font-bold text-lg ${formData.paymentMethod === 'COD' ? 'text-primary' : 'text-white'}`}>Cash on Delivery</span>
                                        <span className="block text-sm text-gray-400 mt-1">Pay with reverence when your sacred order arrives.</span>
                                    </div>
                                    <Truck className={`${formData.paymentMethod === 'COD' ? 'text-primary' : 'text-gray-600 group-hover:text-gray-400'}`} />
                                </label>

                                <label className={`relative flex items-center p-5 border rounded-xl cursor-pointer transition-all duration-300 group ${formData.paymentMethod === 'Card' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Card"
                                        checked={formData.paymentMethod === 'Card'}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 accent-primary bg-black border-white/30"
                                    />
                                    <div className="ml-5 flex-1">
                                        <span className={`block font-bold text-lg ${formData.paymentMethod === 'Card' ? 'text-primary' : 'text-white'}`}>Pay Online</span>
                                        <span className="block text-sm text-gray-400 mt-1">Secure Cards, UPI, Netbanking via Stripe.</span>
                                    </div>
                                    <CreditCard className={`${formData.paymentMethod === 'Card' ? 'text-primary' : 'text-gray-600 group-hover:text-gray-400'}`} />
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Order Summary (Sticky) */}
                    <div className="lg:col-span-1 lg:sticky lg:top-8">
                        <div className="bg-neutral-900 p-6 md:p-8 rounded-2xl shadow-2xl border border-white/10">
                            <h2 className="text-xl font-serif font-bold text-white mb-6 tracking-wide">Your Order</h2>

                            {/* COUPON INPUT */}
                            <div className="mb-6 relative">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Coupon Code"
                                        className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase font-mono"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={appliedCoupon}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={!couponCode || applyingCoupon || appliedCoupon}
                                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase disabled:opacity-50 transition-all border border-white/5"
                                    >
                                        {applyingCoupon ? '...' : appliedCoupon ? 'Applied' : 'Apply'}
                                    </button>
                                </div>
                                {couponMessage && (
                                    <p className={`text-xs mt-2 ${couponMessage.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
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

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="flex gap-4 items-start">
                                        <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                                            <img src={item.product?.images?.[0]} alt={item.title} className="w-full h-full object-cover opacity-90" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-white line-clamp-2">{item.product?.title}</h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                <p className="text-sm font-bold text-primary">₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-white/10 pt-6 space-y-3">
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-200">
                                        ₹{cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-sm text-green-400">
                                        <span>Discount ({appliedCoupon.code})</span>
                                        <span className="font-medium">-₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>GST (18%)</span>
                                    <span className="font-medium text-gray-200">
                                        ₹{Math.round(Math.max(0, (cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) - (appliedCoupon?.discountAmount || 0))) * 0.18).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Shipping</span>
                                    <span className="text-primary font-bold text-xs uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Free</span>
                                </div>
                                <div className="flex justify-between text-lg font-serif font-bold text-white pt-4 border-t border-white/10 mt-2">
                                    <span>Total</span>
                                    <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={submitting}
                                className={`w-full mt-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-primary/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
                                    ${submitting ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-primary text-black hover:bg-secondary'}
                                `}
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span>
                                ) : (
                                    <>
                                        {formData.paymentMethod === 'Card' ? 'Pay Securely' : 'Place Order'}
                                    </>
                                )}
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
                                <ShieldCheck size={14} className="text-primary/50" />
                                <span>SSL Encrypted & Secure Payment</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
