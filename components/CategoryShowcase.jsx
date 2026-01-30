'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import api from '@/services/api';

export default function CategoryShowcase() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Helper to determine column span for visual variety
    // Pattern: 2-col, 1-col, 1-col... or just purely responsive grid
    // Helper removed as we want uniform grid

    if (loading) return null;

    if (categories.length === 0) return null;

    return (
        <section className="py-20 bg-background relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-10 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-[60px]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="flex flex-col items-center mb-16 text-center">
                    <span className="text-secondary font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-3 block">
                        Divinely Curated
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif font-medium text-foreground mb-4">
                        Shop by <span className="text-primary italic">Category</span>
                    </h2>
                    <div className="flex gap-2 items-center opacity-70">
                        <div className="h-px w-12 bg-primary"></div>
                        <span className="text-primary text-xl">❖</span>
                        <div className="h-px w-12 bg-primary"></div>
                    </div>
                </div>

                {/* Horizontal Auto-Scroll Container (Infinite Loop) */}
                <div className="relative w-full overflow-hidden mask-gradient">
                    <div className="flex gap-5 w-max animate-scroll-slow hover:pause-animation">
                        {/* Duplicate content 3 times for seamless infinite scroll */}
                        {[...categories, ...categories, ...categories].map((cat, idx) => (
                            <div
                                key={`${cat._id}-${idx}`}
                                className="shrink-0 w-[160px] md:w-[220px] aspect-[3/4] group relative rounded-xl overflow-hidden cursor-pointer border border-primary/20 hover:border-primary/60 transition-all duration-500 shadow-sm hover:shadow-xl"
                            >
                                <Link href={`/category/${cat.slug}`} className="block w-full h-full relative">
                                    <Image
                                        src={cat.image || '/images/category-fallback.png'}
                                        alt={cat.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 160px, 220px"
                                    />

                                    {/* Elegant Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent group-hover:via-black/30 transition-all duration-500" />

                                    {/* Inner Border Frame */}
                                    <div className="absolute inset-2 border border-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 w-full p-4 text-center">
                                        <h3 className="text-white text-lg font-serif font-medium tracking-wide group-hover:text-primary transition-colors duration-300 drop-shadow-md">
                                            {cat.name}
                                        </h3>
                                        <div className="w-8 h-0.5 bg-primary mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-x-0 group-hover:scale-x-100" />
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Interaction hint */}
                <div className="flex justify-center mt-6 opacity-40 text-xs tracking-widest uppercase">
                    Hover to Pause
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
                .hover\:pause-animation:hover {
                    animation-play-state: paused;
                }
                .mask-gradient {
                    mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
            `}</style>
        </section>
    );
}
