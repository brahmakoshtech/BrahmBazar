'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';

const HeroVideo = () => {
    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                // Fetch banners for home-hero position
                const { data } = await api.get('/api/banners?position=home-hero');
                if (data && data.length > 0) {
                    setBanner(data[0]); // Use the first active banner
                }
            } catch (error) {
                console.error('Failed to fetch banner:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanner();
    }, []);

    // 1. Dynamic Banner (Image)
    if (banner) {
        return (
            <div className="w-full relative h-[60vh] md:h-[80vh] bg-black overflow-hidden group">
                <img
                    src={banner.image}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay Gradient & Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 flex flex-col items-center justify-center text-center px-4">
                    <span className="text-white/90 text-sm md:text-base font-medium tracking-[0.2em] uppercase mb-4 animate-fadeIn">
                        Welcome to BRAHMAKOSH
                    </span>
                    <h1 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight drop-shadow-xl max-w-4xl leading-tight">
                        {banner.title}
                    </h1>
                    {banner.link && (
                        <Link
                            href={banner.link}
                            className="group bg-white text-black px-8 py-3.5 md:px-10 md:py-4 rounded-full font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                        >
                            Explore Now
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    // 2. Fallback Default Video
    return (
        <div className="w-full relative h-[60vh] md:h-[80vh] bg-black overflow-hidden">
            <video
                className="absolute inset-0 w-full h-full object-cover opacity-90"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/hero-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay Gradient & Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 flex flex-col items-center justify-center text-center px-4">
                <span className="text-white/90 text-sm md:text-base font-medium tracking-[0.2em] uppercase mb-4 animate-fadeIn">
                    Welcome to BRAHMAKOSH
                </span>
                <h1 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight drop-shadow-xl max-w-4xl leading-tight">
                    Awaken Your <span className="text-red-500">Divine</span> Potential
                </h1>
                <p className="text-gray-200 text-base md:text-lg max-w-2xl mb-10 leading-relaxed hidden md:block">
                    Explore our exclusive collection of authentic Rudraksha beans, precious gemstones, and spiritual accessories designed to enhance your well-being.
                </p>
                <a
                    href="#new-arrivals"
                    className="group bg-white text-black px-8 py-3.5 md:px-10 md:py-4 rounded-full font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                >
                    Shop Collection
                </a>
            </div>
        </div>
    );
};

export default HeroVideo;
