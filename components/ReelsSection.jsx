'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';

export default function ReelsSection() {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchReels = async () => {
            try {
                const { data } = await api.get('/api/reels');
                setReels(data);
            } catch (error) {
                console.error('Failed to fetch reels:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReels();
    }, []);

    // Infinite Scroll Animation Logic
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || reels.length < 4) return; // Only scroll if enough items

        let animationFrameId;
        let scrollPos = 0;
        const speed = 0.5; // Adjust for smoother/faster scroll

        const animate = () => {
            scrollPos += speed;
            if (scrollPos >= scrollContainer.scrollWidth / 2) {
                scrollPos = 0; // Reset to start for infinite loop illusion
            }
            scrollContainer.scrollLeft = scrollPos;
            animationFrameId = requestAnimationFrame(animate);
        };

        // Start animation
        animationFrameId = requestAnimationFrame(animate);

        // Pause on hover
        const stopAnimation = () => cancelAnimationFrame(animationFrameId);
        const startAnimation = () => {
            animationFrameId = requestAnimationFrame(animate);
        };

        scrollContainer.addEventListener('mouseenter', stopAnimation);
        scrollContainer.addEventListener('mouseleave', startAnimation);

        return () => {
            cancelAnimationFrame(animationFrameId);
            scrollContainer.removeEventListener('mouseenter', stopAnimation);
            scrollContainer.removeEventListener('mouseleave', startAnimation);
        };
    }, [reels]);

    const isScrollable = reels.length > 4;

    // Duplicate reels for infinite loop effect only if scrollable
    const displayReels = isScrollable ? [...reels, ...reels, ...reels] : reels;

    return (
        <section className="py-12 bg-[#FFF8F0] border-t-2 border-[#DCC8B0]/30 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0"></div>

            <div className="container mx-auto px-4 mb-12 text-center relative z-10">
                <div className="inline-block relative group cursor-default">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.3em] uppercase text-orange-500 opacity-60">Visual Stories</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-black text-[#2D241E] uppercase tracking-wider mb-4 relative z-10">
                        Sacred <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 drop-shadow-sm">Reels</span>
                    </h2>
                    <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto rounded-full opacity-80 group-hover:w-48 transition-all duration-700"></div>
                </div>
                <p className="text-sm md:text-base text-[#8C7A6B] mt-6 font-medium max-w-2xl mx-auto leading-relaxed">
                    Immerse yourself in the divine energy through our curated visual journeys.
                </p>
            </div>

            {/* Slider Container */}
            <div
                ref={scrollRef}
                className={`flex gap-4 md:gap-6 w-full pb-4 px-4 select-none ${isScrollable ? 'overflow-x-hidden' : 'overflow-x-auto justify-center'}`}
                style={{ scrollBehavior: 'auto' }} // Disable smooth scroll for JS animation
            >
                {displayReels.map((reel, index) => (
                    <ReelCard key={`${reel._id}-${index}`} reel={reel} />
                ))}
            </div>
        </section>
    );
}

function ReelCard({ reel }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }, []);

    const togglePlay = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div
            className="flex-shrink-0 w-[200px] h-[320px] md:w-[220px] md:h-[360px] relative rounded-xl overflow-hidden group transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_50px_rgba(234,88,12,0.3)]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Gradient Border Wrapper */}
            <div className="absolute inset-0 p-[2px] rounded-xl bg-gradient-to-br from-orange-400 via-transparent to-orange-400 opacity-30 group-hover:opacity-100 transition-opacity duration-500 z-30 pointer-events-none"></div>

            {/* Inner Content */}
            <div className="relative w-full h-full rounded-[0.7rem] overflow-hidden bg-black">
                <video
                    ref={videoRef}
                    src={reel.videoUrl}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    loop
                    muted={isMuted}
                    playsInline
                />

                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]"></div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Trending</span>
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

                {/* Title */}
                {reel.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-white text-lg font-serif font-bold line-clamp-2 drop-shadow-lg leading-tight mb-2">
                            {reel.title}
                        </p>
                        <div className="h-0.5 w-12 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                    </div>
                )}

                {/* Center Play Button (Glassmorphism) */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 z-20 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-orange-600 hover:border-orange-500 hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.3)] group/btn"
                    >
                        {isPlaying ?
                            <Pause size={28} fill="currentColor" className="opacity-90 group-hover/btn:opacity-100" /> :
                            <Play size={28} fill="currentColor" className="ml-1 opacity-90 group-hover/btn:opacity-100" />
                        }
                    </button>
                </div>

                {/* Mute Toggle */}
                <button
                    onClick={toggleMute}
                    className={`absolute top-4 right-4 p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/40 transition-all z-30 hover:scale-110 duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            </div>
        </div>
    );
}
