'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import Link from 'next/link';

export default function SecondaryBanners() {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data } = await api.get('/api/banners');
                // Filter for ALL Home Secondary position and Active status
                const secondaryBanners = data.filter(
                    b => b.position === 'home-secondary' && b.isActive
                );

                // Sort by display order if needed, or keeping them in fetched order
                secondaryBanners.sort((a, b) => a.displayOrder - b.displayOrder);

                setBanners(secondaryBanners);
            } catch (err) {
                console.error("Failed to fetch secondary banners", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    // Auto-rotate logic
    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [banners.length]);

    if (loading || banners.length === 0) return null;

    const banner = banners[currentIndex];

    return (
        <section className="py-12 bg-background container mx-auto px-4 max-w-7xl">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={banner._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden group cursor-pointer shadow-xl border border-primary/20"
                >
                    <Link href={banner.link || '#'}>
                        <div className="w-full h-full relative">
                            <img
                                src={banner.image}
                                alt={banner.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8 md:p-12">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="max-w-xl"
                                >
                                    <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block">
                                        {banner.tag || 'Limited Edition'}
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
                                        {banner.title}
                                    </h2>
                                    {banner.description && (
                                        <p className="text-gray-200 mb-6 line-clamp-2">
                                            {banner.description}
                                        </p>
                                    )}
                                    <button className="text-white border-b border-secondary pb-1 hover:text-secondary hover:border-white transition-colors">
                                        Explore Collection
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            {banners.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-secondary' : 'w-2 bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
