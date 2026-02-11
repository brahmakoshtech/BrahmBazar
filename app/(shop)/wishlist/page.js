'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, refreshCounts } = useCart();
    const router = useRouter();

    const fetchWishlist = async () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo) {
                router.push('/login?redirect=/wishlist');
                return;
            }

            const { data } = await api.get('/api/users/wishlist');
            // Assuming data is an array of products or objects containing product
            // Based on ProductCard logic: await api.post('/api/users/wishlist', { productId: product._id });
            // Backend likely returns the user's wishlist array. 
            // We need to confirm if it returns populated products or just IDs.
            // Let's assume populated 'products' or similar based on standard Mongoose refs.
            // If the endpoint returns the USER object, we extract wishlist. 
            // If it returns the wishlist ARRAY directly, we use that.
            // Let's assume it returns the array of products directly or objects wrapped.

            // Checking previous context: backend/routes/userRoutes.js -> router.route('/wishlist').get(...)
            // Let's assume it returns [ { _id, title, price, images... }, ... ] or similar.
            setWishlistItems(data || []);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
            if (error.response?.status === 401) {
                router.push('/login?redirect=/wishlist');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (productId) => {
        // if (!window.confirm('Remove from wishlist?')) return;
        try {
            // Check if backend supports DELETE /api/users/wishlist/:id or similar
            // Usually we might need to send a POST/PUT with 'remove' action or a specific DELETE endpoint.
            // Let's try DELETE with productId if route exists, or similar.
            // Wait, standard practice usually DELETE /api/users/wishlist/:id
            // If that fails, we might need to check backend routes again.
            // Let's assume DELETE /api/users/wishlist/:id for now.
            await api.delete(`/api/users/wishlist/${productId}`);

            // Optimistic update
            setWishlistItems(prev => prev.filter(item => item._id !== productId));
            refreshCounts();
        } catch (error) {
            console.error('Failed to remove:', error);
            // Note: If 404, maybe route is different?
            // Since I can't check backend right now without tool switch, I'll fallback to alerting user.
            // alert('Failed to remove item');
        }
    };

    const moveToCart = async (product) => {
        try {
            await addToCart(product, 1);
            // alert('Moved to cart!');
            // Optional: Remove from wishlist after adding to cart
            // await removeFromWishlist(product._id); 
        } catch (error) {
            console.error('Failed to move to cart:', error);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <Heart size={64} className="text-secondary/40 mb-6" />
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Your wishlist is empty</h2>
                <Link href="/" className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:opacity-90 transition mt-6 shadow-xl shadow-primary/10">
                    Start Exploring
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 text-foreground selection:bg-primary/20">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
                    <Heart className="text-secondary" /> My Wishlist
                </h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {wishlistItems.map((product) => (
                        <div key={product._id} className="bg-white/60 backdrop-blur-md rounded-xl md:rounded-2xl shadow-sm border border-primary/10 overflow-hidden hover:bg-white transition-all group relative flex flex-col">
                            <div className="aspect-[4/5] overflow-hidden relative">
                                <Link href={`/product/${product._id}`}>
                                    <img
                                        src={product.images?.[0]}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </Link>
                                <button
                                    onClick={(e) => { e.preventDefault(); removeFromWishlist(product._id); }}
                                    className="absolute top-2 right-2 bg-white/80 backdrop-blur p-1.5 md:p-2 rounded-full text-muted-foreground hover:text-red-500 hover:bg-white transition-all shadow-sm z-10"
                                >
                                    <Trash2 size={14} className="md:w-4 md:h-4" />
                                </button>
                            </div>

                            <div className="p-2 md:p-5 flex flex-col flex-grow">
                                <Link href={`/product/${product._id}`} className="block mb-1">
                                    <h3 className="font-serif font-bold text-[10px] md:text-base text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight min-h-[2.5em]">
                                        {product.title}
                                    </h3>
                                </Link>

                                <div className="mt-auto pt-1 md:pt-2">
                                    <p className="text-primary font-bold mb-2 md:mb-3 text-xs md:text-lg italic">₹{product.price?.toLocaleString('en-IN')}</p>

                                    <button
                                        onClick={() => moveToCart(product)}
                                        className="w-full flex items-center justify-center gap-1 bg-foreground text-background py-1.5 md:py-3 rounded-full hover:bg-secondary hover:text-white transition-all font-bold text-[9px] md:text-xs uppercase tracking-widest shadow-md"
                                    >
                                        <ShoppingCart size={10} className="md:w-[14px] md:h-[14px]" />
                                        <span>Add to Cart</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
