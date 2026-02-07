'use client';

import { useState, useEffect, use, useMemo } from 'react';
import api from '@/services/api';
import { ShoppingCart, Heart, Truck, ShieldCheck, ArrowLeft, Plus, Minus, ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailsPage({ params }) {
    const { id } = use(params);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [visibleRelated, setVisibleRelated] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(4);
    const router = useRouter();
    const { success, error } = useToast();
    const [activeCoupons, setActiveCoupons] = useState([]);

    // Fetch active coupons
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const { data } = await api.get('/api/coupons/active');
                setActiveCoupons(data);
            } catch (err) {
                console.error('Failed to fetch coupons', err);
            }
        };
        fetchCoupons();
    }, []);

    const bestCoupon = useMemo(() => {
        if (!product || activeCoupons.length === 0) return null;

        let best = null;
        let maxDiscount = 0;

        activeCoupons.forEach(coupon => {
            // Check Category Match
            let isMatch = false;
            if (coupon.applicableCategory) {
                if (product.category?.toLowerCase() === coupon.applicableCategory.toLowerCase()) {
                    isMatch = true;
                    if (coupon.applicableSubcategory) {
                        if (product.subcategory?.toLowerCase() !== coupon.applicableSubcategory.toLowerCase()) {
                            isMatch = false;
                        }
                    }
                }
            } else {
                isMatch = true;
            }

            if (isMatch) {
                // Calculate discount
                let discount = 0;
                if (coupon.discountType === 'percentage') {
                    discount = ((product.price || 0) * coupon.discountValue) / 100;
                    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                        discount = coupon.maxDiscountAmount;
                    }
                } else {
                    discount = coupon.discountValue;
                }

                if (discount > maxDiscount) {
                    maxDiscount = discount;
                    best = { ...coupon, savings: discount };
                }
            }
        });

        return best;
    }, [product, activeCoupons]);

    // Update items per view based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setItemsPerView(2);
            } else {
                setItemsPerView(4);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/api/products/${id}`);
                setProduct(data);
                if (data.images && data.images.length > 0) {
                    setMainImage(data.images[0]);
                }
            } catch (err) {
                console.error('Failed to fetch product:', err);
                error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    // Fetch Related Products & Manage Recently Viewed
    useEffect(() => {
        if (!product) return;

        const loadRecommendations = async () => {
            // 1. Fetch Related Products
            try {
                if (product.category) {
                    const { data } = await api.get(`/api/products?category=${product.category}`);
                    // Filter out current product
                    setRelatedProducts(data.filter(p => p._id !== product._id));
                }
            } catch (err) {
                console.error('Failed to load related products', err);
            }

            // 2. Manage Recently Viewed (LocalStorage)
            try {
                let viewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]');

                // Remove current product if exists to avoid duplicates
                viewed = viewed.filter(p => p._id !== product._id);

                // Add current product to beginning
                viewed.unshift({
                    _id: product._id,
                    title: product.title,
                    price: product.price,
                    images: product.images, // Storing all or just one usually better
                    category: product.category,
                    stock: product.stock
                });

                // Keep only last 6
                if (viewed.length > 6) viewed = viewed.slice(0, 6);

                localStorage.setItem('recently_viewed', JSON.stringify(viewed));

                // Update state (exclude current product for display if desired, or show logic)
                // We show previously viewed items, excluding current one usually makes sense or show all history?
                // Standard is "Recently Viewed" history.
                setRecentlyViewed(viewed.filter(p => p._id !== product._id).slice(0, 4));
            } catch (err) {
                console.error('LocalStorage error', err);
            }
        };

        loadRecommendations();
    }, [product]);

    // Auto-rotate images every 5 seconds
    useEffect(() => {
        if (!product || !product.images || product.images.length <= 1) return;

        const interval = setInterval(() => {
            setMainImage((prevImage) => {
                const currentIndex = product.images.indexOf(prevImage);
                const nextIndex = (currentIndex + 1) % product.images.length;
                return product.images[nextIndex];
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [product, mainImage]);

    const handleQuantityChange = (type) => {
        if (type === 'increase' && quantity < product.stock) {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const addToCart = async (redirect = false) => {
        // Check authentication
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            const currentPath = window.location.pathname;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }

        setAdding(true);
        try {
            await api.post('/api/cart', { productId: product._id, quantity });

            if (redirect) {
                router.push('/cart');
            } else {
                success(`Added ${quantity} ${product.title} to cart`);
            }
        } catch (err) {
            console.error('Failed to add to cart:', err);
            error(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 container max-w-7xl mx-auto px-4 py-20">
                <div className="bg-neutral-900 animate-pulse aspect-[4/5] rounded-2xl w-full border border-white/10"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-neutral-900 rounded w-1/4 animate-pulse"></div>
                    <div className="h-10 bg-neutral-900 rounded w-3/4 animate-pulse"></div>
                    <div className="h-8 bg-neutral-900 rounded w-1/4 animate-pulse"></div>
                    <div className="h-32 bg-neutral-900 rounded w-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
    return (
        <div className="min-h-screen bg-transparent text-foreground py-8">
            <div className="container max-w-7xl mx-auto px-4">
                <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors group">
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white rounded-2xl overflow-hidden relative border border-border/50 shadow-xl">
                            {mainImage ? (
                                <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                            )}
                            {product.stock === 0 && (
                                <div className="absolute top-4 right-4 bg-red-900/90 text-white px-3 py-1 text-sm font-bold uppercase tracking-wider rounded border border-red-500/30 backdrop-blur-md">
                                    Out of Stock
                                </div>
                            )}
                        </div>
                        {/* Thumbnail Gallery */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-5 gap-4">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${mainImage === img ? 'border-primary opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:border-primary/30'}`}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-6 md:mb-8 border-b border-border pb-6 md:pb-8">
                            <span className="text-xs md:text-sm font-bold text-primary uppercase tracking-widest mb-2 block">
                                {product.category}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
                                {product.title}
                            </h1>
                            <div className="flex items-baseline gap-3">
                                {bestCoupon ? (
                                    <>
                                        <span className="text-lg md:text-xl text-muted-foreground line-through decoration-red-500/50">
                                            ₹{product.price?.toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-2xl md:text-4xl font-bold text-primary">
                                            ₹{(product.price ? (product.price - bestCoupon.savings) : 0).toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-[10px] md:text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20 font-bold uppercase tracking-wider">
                                            {bestCoupon.code} Applied
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-2xl md:text-4xl font-bold text-primary">₹{product.price?.toLocaleString('en-IN')}</span>
                                )}
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div className="space-y-8">
                            {/* Quantity Selector */}
                            {product.stock > 0 && (
                                <div className="flex items-center gap-6 mb-8">
                                    <span className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Quantity</span>
                                    <div className="flex items-center bg-white border border-border rounded-full overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => handleQuantityChange('decrease')}
                                            disabled={quantity <= 1}
                                            className="px-5 py-3 hover:bg-muted disabled:opacity-30 transition-colors text-foreground"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-10 text-center font-bold text-foreground text-lg">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange('increase')}
                                            disabled={quantity >= product.stock}
                                            className="px-5 py-3 hover:bg-muted disabled:opacity-30 transition-colors text-foreground"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => addToCart(false)}
                                    disabled={product.stock === 0}
                                    isLoading={adding}
                                    icon={<ShoppingCart size={18} />}
                                    className="flex-1 py-4 text-sm md:text-base border-primary/30 text-primary hover:bg-primary/5 rounded-full"
                                >
                                    Add to Cart
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => addToCart(true)}
                                    disabled={product.stock === 0}
                                    className="flex-1 py-4 text-sm md:text-base rounded-full shadow-lg shadow-primary/20"
                                >
                                    Buy Now
                                </Button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-10 grid grid-cols-3 gap-3 md:gap-6 pt-8 border-t border-border">
                            <div className="flex flex-col items-center text-center gap-2 p-4 bg-white/50 rounded-xl border border-border transition-colors group">
                                <Truck size={24} className="text-secondary" />
                                <span className="text-[9px] md:text-xs font-bold uppercase text-foreground tracking-widest">Free Shipping</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 p-4 bg-white/50 rounded-xl border border-border transition-colors group">
                                <ShieldCheck size={24} className="text-secondary" />
                                <span className="text-[9px] md:text-xs font-bold uppercase text-foreground tracking-widest">100% Authentic</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 p-4 bg-white/50 rounded-xl border border-border transition-colors group">
                                <Heart size={24} className="text-secondary" />
                                <span className="text-[9px] md:text-xs font-bold uppercase text-foreground tracking-widest">Energized</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Description Section */}
                <div className="mt-16 border-t border-border pt-12 max-w-3xl">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">Product Description</h2>
                    <div className="text-muted-foreground leading-relaxed font-light text-sm md:text-base">
                        <p>{product.description}</p>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24 border-t border-border pt-12 relative">
                        <div className="flex justify-between items-end mb-8 relative z-10">
                            <div>
                                <span className="text-primary font-bold tracking-widest uppercase text-xs mb-1 block">Handpicked for you</span>
                                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                                    Related <span className="text-primary italic">Treasures</span>
                                </h2>
                            </div>

                            {/* Carousel Controls */}
                            {relatedProducts.length > itemsPerView && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setVisibleRelated(prev => Math.max(0, prev - 1))}
                                        disabled={visibleRelated === 0}
                                        className="p-2 rounded-full border border-white/10 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-gray-500"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={() => setVisibleRelated(prev => Math.min(relatedProducts.length - itemsPerView, prev + 1))}
                                        disabled={visibleRelated >= relatedProducts.length - itemsPerView}
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
                                animate={{ x: `-${visibleRelated * (100 / itemsPerView)}%` }}
                                transition={{ duration: 0.8, ease: "circOut" }}
                            >
                                {relatedProducts.map(p => (
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

                {/* Recently Viewed Section */}
                {recentlyViewed.length > 0 && (
                    <div className="mt-24 mb-12">
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-8 flex items-center gap-4">
                            <span className="h-px bg-border flex-grow"></span>
                            Recently Viewed
                            <span className="h-px bg-border flex-grow"></span>
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {recentlyViewed.map(p => (
                                <ProductCard key={p._id} product={p} activeCoupons={activeCoupons} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
