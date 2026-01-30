'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import api from '@/services/api';

const defaultSlides = [
    {
        _id: 'default-1',
        image: '/images/hero-awaken.png',
        title: 'Awaken Your Inner Light',
        subtitle: 'Begin your sacred journey. Align your energy with the cosmos through authentic spiritual tools.',
        cta: 'Start the Journey',
        link: '/category/all'
    },
    {
        _id: 'default-2',
        image: '/images/hero-balance.png',
        title: 'Balance & Protection',
        subtitle: 'Ancient Vedic wisdom to shield your aura and harmonize your life force.',
        cta: 'Find Your Balance',
        link: '/category/all'
    },
    {
        _id: 'default-3',
        image: '/images/hero-transform.png',
        title: 'Transform Your Reality',
        subtitle: 'Powerful Yantras and Parad aimed at manifesting abundance and spiritual growth.',
        cta: 'Experience Transformation',
        link: '/category/all'
    }
];

export default function HeroSection() {
    const [current, setCurrent] = useState(0);
    const [slides, setSlides] = useState(defaultSlides);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data } = await api.get('/api/banners');
                // Filter for Home Hero position and Active status
                const heroBanners = data.filter(
                    b => b.position === 'home-hero' && b.isActive
                );

                if (heroBanners.length > 0) {
                    // Sort by display order
                    heroBanners.sort((a, b) => a.displayOrder - b.displayOrder);

                    // Map to slide format
                    const mappedSlides = heroBanners.map(b => ({
                        _id: b._id,
                        image: b.image,
                        title: b.title,
                        subtitle: 'Discover the divine energy of our authentic collection.', // Banners might not have subtitle, use generic or add to schema later
                        cta: 'Explore Now', // Generic CTA or add to schema
                        link: b.link || '/category/all'
                    }));
                    setSlides(mappedSlides);
                }
            } catch (err) {
                console.error("Failed to fetch hero banners", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return; // Don't auto-scroll if only 1 slide

        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <section className="relative h-[85vh] w-full overflow-hidden bg-foreground text-white">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={loading ? 'loading' : slides[current]._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div className="relative w-full h-full">
                        {/* If using remote images (Cloudinary/Unsplash), width/height must be set or fill used correctly with domains config. 
                            Since we use 'fill', it works generally but requires domain in next.config or unoptimized. 
                            For safety with external URLs (like banner.image), we use standard img tag or unoptimized Image if needed.
                            Let's use standard img for flexibility with external URLs without config changes right now. */}
                        <img
                            src={slides[current].image}
                            alt={slides[current].title}
                            className="w-full h-full object-cover opacity-80"
                        />
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center max-w-7xl">
                <motion.div
                    key={current + "-text"}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="max-w-2xl space-y-6"
                >
                    <span className="text-primary font-bold tracking-[0.3em] uppercase text-sm md:text-base">
                        Rudra Divine Spiritual Store
                    </span>

                    <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight drop-shadow-lg">
                        {slides[current].title}
                    </h1>

                    <p className="text-lg md:text-2xl text-gray-200 font-light max-w-xl">
                        {slides[current].subtitle}
                    </p>

                    <div className="pt-4">
                        <Link href={slides[current].link || '#'}>
                            <button className="bg-primary text-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(214,158,46,0.5)]">
                                {slides[current].cta} <ChevronRight size={20} />
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Progress Indicators */}
                {slides.length > 1 && (
                    <div className="absolute bottom-12 left-4 md:left-0 right-0 flex justify-center gap-3">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`h-1 rounded-full transition-all duration-300 ${idx === current ? 'w-12 bg-primary' : 'w-4 bg-gray-600'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
