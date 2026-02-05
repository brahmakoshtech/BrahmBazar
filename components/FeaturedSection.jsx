'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import api from '@/services/api';
import ProductCard from '@/components/ProductCard';

export default function FeaturedSection({ activeCoupons }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const { data } = await api.get('/api/products/highlighted');
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch featured products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    if (loading) return null;
    if (products.length === 0) return null;

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/5 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <div className="absolute -left-20 top-40 w-64 h-64 bg-primary/5 rounded-full blur-3xl p-10"></div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} className="text-primary animate-pulse" />
                            <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs md:text-sm">
                                Divine Selection
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-serif font-medium text-foreground leading-tight">
                            Featured <span className="text-primary italic">Highlights</span>
                        </h2>
                        <p className="mt-4 text-muted-foreground text-sm md:text-base max-w-md">
                            Handpicked sacred tools, energized and ready to elevate your spiritual journey.
                        </p>
                    </div>

                    <Link
                        href="/shop"
                        className="hidden md:flex items-center gap-2 text-primary font-bold tracking-wider uppercase text-xs hover:text-foreground transition-colors group"
                    >
                        View All Collections <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Featured Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                    {products.map((product, idx) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="h-full"
                        >
                            <ProductCard product={product} activeCoupons={activeCoupons} />
                        </motion.div>
                    ))}
                </div>

                <div className="mt-10 md:hidden text-center">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 text-primary font-bold tracking-wider uppercase text-xs hover:text-foreground transition-colors"
                    >
                        View All Collections <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
