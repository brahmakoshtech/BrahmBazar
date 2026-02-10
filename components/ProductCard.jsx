'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Ticket, Flame, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';
import { useMemo } from 'react';

export default function ProductCard({ product, activeCoupons = [] }) {
    const { refreshCounts, addToCart } = useCart();

    const bestCoupon = useMemo(() => {
        if (!activeCoupons || activeCoupons.length === 0 || !product) return null;

        let best = null;
        let maxDiscount = 0;

        activeCoupons.forEach(coupon => {
            // Check Category Match
            let isMatch = false;
            if (coupon.applicableCategory) {
                if (product.category?.toLowerCase() === coupon.applicableCategory.toLowerCase()) {
                    isMatch = true;
                    if (coupon.applicableSubcategory) {
                        // If coupon has subcategory, product MUST match it
                        if (product.subcategory?.toLowerCase() !== coupon.applicableSubcategory.toLowerCase()) {
                            isMatch = false;
                        }
                    }
                }
            } else {
                // Global coupon (no category restriction) - technically applicable to all
                // But usually we prefer specific badges. Let's assume global coupons also show.
                isMatch = true;
            }

            if (isMatch) {
                // Calculate discount for this product
                let discount = 0;
                if (coupon.discountType === 'percentage') {
                    discount = (product.price * coupon.discountValue) / 100;
                    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                        discount = coupon.maxDiscountAmount;
                    }
                } else {
                    discount = coupon.discountValue; // Flat discount
                }

                if (discount > maxDiscount) {
                    maxDiscount = discount;
                    best = { ...coupon, savings: discount };
                }
            }
        });

        return best;
    }, [activeCoupons, product]);

    if (!product) return null;

    return (
        <div className="group bg-card rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 relative flex flex-col h-full border border-border/50">

            {/* Image Container - Square Aspect Ratio for balanced look */}
            <Link href={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-muted">
                <img
                    src={product.images?.[0] || 'https://via.placeholder.com/400x500?text=No+Image'}
                    alt={product.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Overlay Gradient (Subtle) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {product.isTrending && (
                        <span className="bg-orange-500/90 text-white backdrop-blur-md text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-widest shadow-md flex items-center gap-1">
                            <Flame size={10} className="fill-white" /> Trending
                        </span>
                    )}
                    {product.isNewArrival && (
                        <span className="bg-blue-500/90 text-white backdrop-blur-md text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-widest shadow-md flex items-center gap-1">
                            <Sparkles size={10} className="fill-white" /> New
                        </span>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                        <span className="bg-orange-500/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">
                            Low Stock
                        </span>
                    )}
                    {product.stock === 0 && (
                        <span className="bg-red-900/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">
                            Sold Out
                        </span>
                    )}
                    {/* Coupon Badge */}
                    {bestCoupon && product.stock > 0 && (
                        <span className="bg-primary/95 text-white backdrop-blur-md text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-widest shadow-md flex items-center gap-1">
                            <Ticket size={10} className="fill-white" />
                            {bestCoupon.discountType === 'percentage' ? `${bestCoupon.discountValue}% OFF` : `₹${bestCoupon.discountValue} OFF`}
                        </span>
                    )}
                </div>

                {/* Wishlist Button - Floating Top Right */}
                {/* Wishlist Button - Floating Top Right */}
                <button
                    onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const userInfo = localStorage.getItem('userInfo');
                        if (!userInfo) {
                            // Redirect to login with return url
                            const currentPath = window.location.pathname;
                            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
                            return;
                        }
                        try {
                            await api.post('/api/users/wishlist', { productId: product._id });
                            refreshCounts();
                        } catch (error) {
                            console.error('Wishlist error', error);
                        }
                    }}
                    className="absolute top-3 right-3 z-20 bg-white/80 backdrop-blur-md p-1.5 md:p-2 rounded-full text-foreground/70 hover:text-red-500 hover:bg-white transition-all transform hover:scale-110 opacity-100 md:opacity-0 md:group-hover:opacity-100 translate-x-0 md:translate-x-2 md:group-hover:translate-x-0 duration-300 shadow-sm"
                    title="Add to Wishlist"
                >
                    <Heart className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>

            </Link>

            {/* Content Details */}
            <div className="p-2.5 md:p-3 lg:p-4 flex flex-col flex-grow relative">
                {/* Category & Savings */}
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] md:text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">{product.category}</span>
                    {bestCoupon && product.stock > 0 && (
                        <span className="text-[8px] md:text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100 uppercase tracking-tighter">
                            -₹{Math.round(bestCoupon.savings)}
                        </span>
                    )}
                </div>

                {/* Title */}
                <Link href={`/product/${product._id}`} className="block mb-1 group-hover:text-primary transition-colors pr-6 md:pr-10">
                    <h3 className="font-serif font-bold text-[#5A4033] text-[13px] md:text-base lg:text-lg leading-[1.2] line-clamp-2 h-[2.4em]">
                        {product.title}
                    </h3>
                </Link>

                {/* Price Section */}
                <div className="mt-auto flex items-center gap-2 pt-1">
                    {bestCoupon && bestCoupon.savings > 0 ? (
                        <>
                            <span className="text-sm md:text-xl font-bold text-primary">
                                ₹{(Math.max(0, (product.price || 0) - bestCoupon.savings)).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] md:text-sm text-[#8C7A6B] line-through opacity-50">
                                ₹{product.price?.toLocaleString('en-IN')}
                            </span>
                        </>
                    ) : (
                        <span className="text-base md:text-xl font-bold text-primary">₹{product.price?.toLocaleString('en-IN')}</span>
                    )}
                </div>

                {/* Add to Cart - More Compact on Mobile */}
                <button
                    onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const userInfo = localStorage.getItem('userInfo');
                        if (!userInfo) {
                            const currentPath = window.location.pathname;
                            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
                            return;
                        }
                        try {
                            await addToCart(product, 1);
                        } catch (error) {
                            console.error('Cart error', error);
                        }
                    }}
                    disabled={product.stock === 0}
                    className="absolute bottom-2.5 right-2 bg-primary/10 hover:bg-primary text-primary hover:text-white p-1.5 md:p-2.5 rounded-full transition-all duration-500 shadow-sm border border-primary/20 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed group/cart"
                    title="Add to Cart"
                >
                    <ShoppingCart size={14} className="md:w-[18px] md:h-[18px] transition-transform group-hover/cart:rotate-12" />
                </button>
            </div>
        </div >
    );
}

