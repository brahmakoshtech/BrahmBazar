'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Ticket } from 'lucide-react';
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
        <div className="group bg-card rounded-xl overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 relative flex flex-col h-full border border-border hover:border-primary/50 hover:-translate-y-1">

            {/* Wishlist Button */}
            <button
                onClick={async (e) => {
                    e.stopPropagation();
                    try {
                        await api.post('/api/users/wishlist', { productId: product._id });
                        refreshCounts();
                        // Consider toast notification instead of alert
                    } catch (error) {
                        console.error('Wishlist error', error);
                    }
                }}
                className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-sm text-muted-foreground hover:text-primary hover:bg-white transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 border border-border"
                title="Add to Wishlist"
            >
                <Heart size={18} />
            </button>

            {/* Image Container - Aspect Square (Compact) */}
            <Link href={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-muted">
                <img
                    src={product.images?.[0] || 'https://via.placeholder.com/400x500?text=No+Image'}
                    alt={product.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.stock <= 5 && product.stock > 0 && (
                        <span className="bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-orange-400/20">
                            Low Stock
                        </span>
                    )}
                    {product.stock === 0 && (
                        <span className="bg-red-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-red-500/20">
                            Sold Out
                        </span>
                    )}
                    {/* Coupon Badge */}
                    {bestCoupon && product.stock > 0 && (
                        <span className="bg-primary/90 text-white backdrop-blur-sm text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-primary/20 flex items-center gap-1 animate-pulse">
                            <Ticket size={10} className="fill-white" />
                            {bestCoupon.discountType === 'percentage' ? `${bestCoupon.discountValue}% OFF` : `₹${bestCoupon.discountValue} OFF`}
                        </span>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow relative bg-card">
                <div className="mb-2 flex justify-between items-start">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{product.category}</span>
                    {bestCoupon && product.stock > 0 && (
                        <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            Save ₹{Math.round(bestCoupon.savings)}
                        </span>
                    )}
                </div>

                <Link href={`/product/${product._id}`} className="block flex-grow">
                    <h3 className="font-serif font-medium text-foreground text-lg leading-snug line-clamp-2 hover:text-primary transition-colors mb-2">
                        {product.title}
                    </h3>
                </Link>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <div className="flex flex-col items-start">
                        {bestCoupon && bestCoupon.savings > 0 ? (
                            <>
                                <span className="text-xs text-muted-foreground line-through decoration-red-500/50 decoration-1">
                                    ₹{product.price?.toLocaleString('en-IN')}
                                </span>
                                <span className="text-xl font-bold text-primary">
                                    ₹{(Math.max(0, (product.price || 0) - bestCoupon.savings)).toLocaleString('en-IN')}
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-bold text-primary">₹{product.price?.toLocaleString('en-IN')}</span>
                        )}
                    </div>

                    {/* Minimal Add Button */}
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            try {
                                await addToCart(product, 1);
                            } catch (error) {
                                console.error('Cart error', error);
                            }
                        }}
                        disabled={product.stock === 0}
                        className="bg-muted text-foreground p-2.5 rounded-full hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn border border-border"
                        title="Add to Cart"
                    >
                        <ShoppingCart size={20} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

