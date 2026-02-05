'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import api from '@/services/api';

export default function CategoryShowcase() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/api/categories');
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleMouseEnter = () => {
        if (scrollRef.current) {
            const animations = scrollRef.current.getAnimations();
            animations.forEach(animation => {
                animation.updatePlaybackRate(0.2); // Slow down significantly
            });
        }
    };

    const handleMouseLeave = () => {
        if (scrollRef.current) {
            const animations = scrollRef.current.getAnimations();
            animations.forEach(animation => {
                animation.updatePlaybackRate(1); // Restore normal speed
            });
        }
    };

    // Helper to determine column span for visual variety
    // Pattern: 2-col, 1-col, 1-col... or just purely responsive grid
    // Helper removed as we want uniform grid

    if (loading) return null;

    if (categories.length === 0) return null;

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Soft Radial Gradient Background for Depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

            {/* Decorative Ambient Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 max-w-7xl relative z-10">

                {/* Glassy Panel Container */}
                <div className="relative backdrop-blur-md bg-white/40 dark:bg-black/20 rounded-[2.5rem] border border-primary/10 p-8 md:p-14 shadow-2xl shadow-primary/5">

                    {/* Section Header */}
                    <div className="flex flex-col items-center mb-12 text-center">
                        <span className="text-secondary font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs mb-4 block">
                            Divinely Curated
                        </span>
                        <h2 className="text-3xl md:text-5xl font-serif font-medium text-foreground mb-4">
                            Shop by <span className="text-primary italic">Category</span>
                        </h2>
                        <div className="flex gap-3 items-center opacity-60 mt-1">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                            <span className="text-primary text-xl">❖</span>
                            <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                        </div>
                    </div>

                    {/* Horizontal Auto-Scroll Container (Infinite Loop) */}
                    <div className="relative w-full overflow-hidden">
                        <div
                            ref={scrollRef}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            className="flex gap-6 md:gap-8 w-max animate-scroll-slow py-4"
                        >
                            {/* Duplicate content 3 times for seamless infinite scroll */}
                            {[...categories, ...categories, ...categories].map((cat, idx) => (
                                <div
                                    key={`${cat._id}-${idx}`}
                                    className="shrink-0 w-[180px] md:w-[240px] aspect-[3/4] group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 border border-white/50"
                                >
                                    <Link href={`/category/${cat.slug}`} className="block w-full h-full relative">
                                        <Image
                                            src={cat.image || '/images/category-fallback.png'}
                                            alt={cat.name}
                                            fill
                                            unoptimized={true}
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 768px) 180px, 240px"
                                        />

                                        {/* Premium Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                                        {/* Inner Glassy Frame Effect */}
                                        <div className="absolute inset-0 border-[1px] border-white/10 rounded-2xl pointer-events-none" />

                                        {/* Content */}
                                        <div className="absolute bottom-0 left-0 w-full p-5 text-center transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                                            <h3 className="text-white text-lg md:text-xl font-serif font-medium tracking-wide drop-shadow-lg">
                                                {cat.name}
                                            </h3>
                                            <div className="flex justify-center items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                <span className="h-px w-4 bg-primary" />
                                                <span className="text-[10px] text-primary uppercase tracking-widest">Explore</span>
                                                <span className="h-px w-4 bg-primary" />
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interaction hint */}
                    <div className="flex justify-center mt-8 opacity-40 text-[10px] tracking-[0.2em] uppercase text-foreground/60">
                        Hover to Slow
                    </div>
                </div>
            </div>
            <style jsx global>{`
                @keyframes scroll-slow {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); } /* Move 1/3 since we triplicated */
                }
                .animate-scroll-slow {
                    animation: scroll-slow 40s linear infinite;
                }
            `}</style>
        </section>
    );
}
