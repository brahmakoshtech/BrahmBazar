'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';

import { useToast } from '@/context/ToastContext';
import EmptyState from '@/components/ui/EmptyState';

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const { success, error, info } = useToast();

    const [userManuallyRemoved, setUserManuallyRemoved] = useState(false);

    // Coupon State
    const [activeCoupons, setActiveCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    // Fetch Active Public Coupons
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const { data } = await api.get('/api/coupons/active');
                setActiveCoupons(data);
            } catch (err) {
                console.error("Failed to fetch coupons", err);
            }
        };
        fetchCoupons();
    }, []);

    // Calculate Best Coupon Helper
    const getBestCoupon = () => {
        if (!cartItems.length || !activeCoupons.length) return null;
        let best = null;
        let maxSavings = 0;

        activeCoupons.forEach(coupon => {
            // Check Min Order
            if (coupon.minOrderAmount && total < coupon.minOrderAmount) return;

            let savings = 0;
            // 1. Category Specific
            if (coupon.applicableCategory) {
                const eligibleItems = cartItems.filter(item =>
                    item.product?.category?.toLowerCase() === coupon.applicableCategory.toLowerCase() &&
                    (!coupon.applicableSubcategory || item.product?.subcategory?.toLowerCase() === coupon.applicableSubcategory.toLowerCase())
                );

                if (eligibleItems.length === 0) return; // Not applicable

                const eligibleTotal = eligibleItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

                if (coupon.discountType === 'percentage') {
                    savings = (eligibleTotal * coupon.discountValue) / 100;
                    if (coupon.maxDiscountAmount) savings = Math.min(savings, coupon.maxDiscountAmount);
                } else {
                    // Flat discount implies it applies provided category items exist
                    savings = coupon.discountValue;
                }

            } else {
                // 2. Global Coupon
                if (coupon.discountType === 'percentage') {
                    savings = (total * coupon.discountValue) / 100;
                    if (coupon.maxDiscountAmount) savings = Math.min(savings, coupon.maxDiscountAmount);
                } else {
                    savings = coupon.discountValue;
                }
            }

            if (savings > maxSavings) {
                maxSavings = savings;
                best = { ...coupon, savings };
            }
        });
        return best;
    };

    // Auto Apply Effect
    useEffect(() => {
        if (loading || cartItems.length === 0 || activeCoupons.length === 0) return;

        // Only auto-apply if nothing is applied AND we haven't been "removed" by user
        if (!appliedCoupon && !userManuallyRemoved) {
            const best = getBestCoupon();
            // Only apply if it offers actual savings
            if (best && best.savings > 0) {
                applyCoupon(best.code, true);
            }
        }
    }, [cartItems, activeCoupons, total, loading, appliedCoupon, userManuallyRemoved]);

    const applyCoupon = async (codeOverride = null, isAuto = false) => {
        const code = typeof codeOverride === 'string' ? codeOverride : couponCode;
        if (!code) return;

        setApplyingCoupon(true);
        try {
            // Usually discount is on Subtotal
            const { data } = await api.post('/api/coupons/apply', {
                couponCode: code,
                cartTotal: total,
                cartItems
            });

            setDiscountAmount(data.discountAmount);
            setAppliedCoupon(data.couponCode);
            setCouponCode(data.couponCode); // Sync input

            if (isAuto) {
                // Don't toast for auto-apply to avoid annoyance, or use a subtle 'info'
                // success(`Best coupon '${data.couponCode}' auto-applied!`);
            } else {
                success(`Coupon '${data.couponCode}' applied! Saved ₹${data.discountAmount}`);
                setUserManuallyRemoved(false); // Reset this so if they clear it later, it doesn't fight, but for now they manually applied it.
            }
        } catch (err) {
            console.error(err);
            if (!isAuto) error(err.response?.data?.message || 'Failed to apply coupon');
            // If auto-fail, just silent
            setDiscountAmount(0);
            setAppliedCoupon(null);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode('');
        setUserManuallyRemoved(true); // User explicitly removed it, don't auto-apply again this session
        info('Coupon removed');
    };

    // Recommendations State
    const [recommendations, setRecommendations] = useState([]);
    const [visibleRecs, setVisibleRecs] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(4);

    // Update items per view based on screen size
    useEffect(() => {
        const handleResize = () => {
            setItemsPerView(window.innerWidth < 768 ? 2 : 4);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch Recommendations based on Cart Items
    useEffect(() => {
        if (cartItems.length === 0) return;

        const fetchRecommendations = async () => {
            try {
                // Use the first item's category to fetch text-based recommendations
                // Or simply fetch generic featured/latest products if simpler
                const sampleItem = cartItems[0];
                let endpoint = '/api/products';

                if (sampleItem?.product?.category) {
                    endpoint += `?category=${sampleItem.product.category}`;
                }

                const { data } = await api.get(endpoint);

                // Filter out items that are ALREADY in the cart
                const cartIds = new Set(cartItems.map(item => item.product._id));
                const filtered = data.filter(p => !cartIds.has(p._id));

                setRecommendations(filtered);
            } catch (err) {
                console.error('Failed to load recommendations:', err);
            }
        };

        fetchRecommendations();
    }, [cartItems]);

    const calculateTotal = (items) => {
        const sum = items.reduce((acc, item) => {
            const price = item.product?.price || 0;
            return acc + (price * item.quantity);
        }, 0);
        setTotal(sum);
    };

    const fetchCart = async () => {
        try {
            const userInfo = localStorage.getItem('userInfo');

            if (!userInfo) {
                // GUEST MODE
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                setCartItems(guestCart);
                calculateTotal(guestCart);
                setLoading(false);
                return;
            }

            // USER MODE
            const { data } = await api.get('/api/cart');
            // Support both array response or object with items
            const items = Array.isArray(data) ? data : (data.items || []);
            setCartItems(items);
            calculateTotal(items);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
            error('Failed to load your cart');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();

        // Listen for storage events (guest mode updates across tabs)
        const handleStorageChange = () => fetchCart();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const updateQuantity = async (itemId, newQty) => {
        if (newQty < 1) return;

        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            // GUEST MODE
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            const itemIndex = guestCart.findIndex(item => item.product._id === itemId);
            if (itemIndex > -1) {
                guestCart[itemIndex].quantity = newQty;
                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                fetchCart();
                window.dispatchEvent(new Event('storage'));
            }
            return;
        }

        // USER MODE
        try {
            await api.put(`/api/cart/${itemId}`, { quantity: newQty });
            fetchCart();
        } catch (err) {
            console.error('Failed to update quantity:', err);
            error('Failed to update quantity');
        }
    };

    const removeItem = async (itemId) => {
        // Optional: Removing window.confirm for a smoother UI if using toast undo? 
        // For now, let's keep it simple or simple toast

        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            // GUEST MODE
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            const newCart = guestCart.filter(item => item.product._id !== itemId);
            localStorage.setItem('guestCart', JSON.stringify(newCart));
            fetchCart();
            window.dispatchEvent(new Event('storage'));
            info('Item removed from cart');
            return;
        }

        try {
            await api.delete(`/api/cart/${itemId}`);
            fetchCart();
            info('Item removed from cart');
        } catch (err) {
            console.error('Failed to remove item:', err);
            error('Failed to remove item');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <EmptyState
                    icon={<ShoppingBag size={64} />}
                    title="Your cart is empty"
                    description="Looks like you haven't added anything yet. Explore our premium collection today."
                    actionLabel="Start Shopping"
                    actionLink="/"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black py-12 md:py-20 font-sans text-white">
            <div className="container mx-auto px-4 max-w-7xl">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8 flex items-center gap-4">
                    <ShoppingBag className="text-primary" size={36} />
                    <span>Shopping Cart <span className="text-lg font-medium text-gray-500 ml-2">({cartItems.length} items)</span></span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item._id} className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl shadow-sm border border-white/5 p-6 flex flex-col sm:flex-row gap-6 transition-all hover:bg-neutral-900 group">
                                {/* Product Image */}
                                <div className="w-full sm:w-32 h-32 bg-black rounded-xl overflow-hidden flex-shrink-0 relative border border-white/10">
                                    <img
                                        src={item.product?.images?.[0] || 'https://via.placeholder.com/150'}
                                        alt={item.product?.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                                                {item.product?.category}
                                            </p>
                                            <h3 className="font-serif font-bold text-lg text-white hover:text-primary transition-colors leading-tight">
                                                <Link href={`/product/${item.product?._id}`}>
                                                    {item.product?.title}
                                                </Link>
                                            </h3>
                                        </div>
                                        <p className="font-bold text-xl text-white">
                                            ₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}
                                        </p>
                                    </div>

                                    {/* Validations / Controls */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center border border-white/10 rounded-lg bg-black">
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white/5 rounded-l-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                            >
                                                -
                                            </button>
                                            <span className="w-10 text-center font-bold text-white text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white/5 rounded-r-lg transition-all"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.product?._id)}
                                            className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm font-medium transition-colors group/delete"
                                        >
                                            <div className="p-2 rounded-full bg-transparent group-hover/delete:bg-red-900/20 transition-colors">
                                                <Trash2 size={18} />
                                            </div>
                                            <span className="group-hover/delete:underline">Remove</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary - Sticky */}
                    <div className="lg:col-span-1">
                        <div className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 p-8 sticky top-24">
                            <h2 className="text-xl font-serif font-bold text-white mb-6 border-b border-white/10 pb-4">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-white">₹{total.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>GST (18%)</span>
                                    <span className="font-medium text-white">₹{Math.round(Math.max(0, total - discountAmount) * 0.18).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-400 text-sm items-center">
                                    <span>Shipping</span>
                                    <span className="text-primary font-bold text-[10px] uppercase bg-primary/10 border border-primary/20 px-2 py-1 rounded-full tracking-wide">Free</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-white/10 pt-6 mb-8">
                                {/* COUPON SECTION */}
                                <div className="mb-6">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Coupon Code"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary uppercase font-mono text-sm"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        />
                                        {appliedCoupon && couponCode === appliedCoupon ? (
                                            <button
                                                onClick={removeCoupon}
                                                className="bg-red-900/20 text-red-400 px-4 rounded-lg font-bold border border-red-500/20 hover:bg-red-900/40 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => applyCoupon()}
                                                disabled={!couponCode || applyingCoupon}
                                                className="bg-white/10 text-white px-4 rounded-lg font-bold hover:bg-white/20 transition-colors disabled:opacity-50"
                                            >
                                                {applyingCoupon ? '...' : (appliedCoupon ? 'Replace' : 'Apply')}
                                            </button>
                                        )}
                                    </div>
                                    {appliedCoupon && !userManuallyRemoved && (
                                        <div className="mt-2 text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded inline-block animate-pulse">
                                            ✨ Best coupon auto-applied
                                        </div>
                                    )}
                                    {/* Available Coupons Hint */}
                                    {!appliedCoupon && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-400 mb-2">Available Coupons:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {activeCoupons.slice(0, 3).map(coupon => (
                                                    <button
                                                        key={coupon._id}
                                                        onClick={() => setCouponCode(coupon.code)}
                                                        className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded border-dashed hover:bg-primary/20 transition-colors"
                                                    >
                                                        {coupon.code}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-base font-bold text-white mb-1">Total Amount</span>
                                        {appliedCoupon && (
                                            <span className="text-xs text-green-400 flex items-center gap-1">
                                                Coupon applied: -₹{discountAmount.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {appliedCoupon && (
                                            <span className="block text-sm text-gray-400 line-through mb-1">
                                                ₹{Math.round(total * 1.18).toLocaleString('en-IN')}
                                            </span>
                                        )}
                                        <span className="block text-2xl font-extrabold text-primary leading-none mb-1">
                                            ₹{Math.round((Math.max(0, total - discountAmount) * 1.18)).toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-medium">Inclusive of all taxes</span>
                                    </div>
                                </div>
                            </div>

                            <Link href="/checkout" className="block w-full">
                                <button className="w-full bg-primary text-black py-4 rounded-xl font-bold hover:bg-white transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 group transform active:scale-[0.98]">
                                    Proceed to Checkout
                                    <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={20} />
                                </button>
                            </Link>

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <p className="text-center text-xs text-gray-500 mb-4 font-medium uppercase tracking-wider">Secure Payment via</p>
                                <div className="flex justify-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 hover:opacity-100">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-6 object-contain" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 object-contain" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 object-contain" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations Section (Carousel) */}
            {recommendations.length > 0 && (
                <div className="mt-24 border-t border-white/10 pt-16 relative">
                    <div className="flex justify-between items-end mb-10 px-4">
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-white">
                                You May Also <span className="text-primary">Like</span>
                            </h2>
                        </div>

                        {/* Carousel Controls */}
                        {recommendations.length > itemsPerView && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setVisibleRecs(prev => Math.max(0, prev - 1))}
                                    disabled={visibleRecs === 0}
                                    className="p-2 rounded-full border border-white/10 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-gray-500"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setVisibleRecs(prev => Math.min(recommendations.length - itemsPerView, prev + 1))}
                                    disabled={visibleRecs >= recommendations.length - itemsPerView}
                                    className="p-2 rounded-full border border-white/10 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-gray-500"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Carousel Track */}
                    <div className="overflow-hidden -mx-3">
                        <motion.div
                            className="flex"
                            animate={{ x: `-${visibleRecs * (100 / itemsPerView)}%` }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                        >
                            {recommendations.map(p => (
                                <div
                                    key={p._id}
                                    className="flex-shrink-0 px-3 transition-all duration-500"
                                    style={{ width: `${100 / itemsPerView}%` }}
                                >
                                    <ProductCard product={p} activeCoupons={activeCoupons} />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}
