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

            <div className="container mx-auto px-4 mb-8 text-center relative z-10">
                <div className="inline-block relative">
                    <h2 className="text-3xl md:text-4xl font-serif font-black text-[#5A4633] uppercase Tracking-wide mb-2">
                        Sacred <span className="text-orange-600">Reels</span>
                    </h2>
                    <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
                </div>
                <p className="text-sm md:text-base text-[#8C7A6B] mt-3 font-medium max-w-2xl mx-auto">
                    Immersion in the divine energy of our authentic spiritual tools.
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
            className="flex-shrink-0 w-[200px] h-[350px] md:w-[240px] md:h-[420px] relative rounded-2xl overflow-hidden shadow-xl border border-[#DCC8B0] group bg-black"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <video
                ref={videoRef}
                src={reel.videoUrl}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
            // Auto-play is handled by ref logic, usually 'muted' allows autoplay
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

            {/* Title */}
            {reel.title && (
                <div className="absolute bottom-4 left-4 right-4 z-20">
                    <p className="text-white text-sm font-bold line-clamp-2 drop-shadow-md leading-tight">
                        {reel.title}
                    </p>
                </div>
            )}

            {/* Controls appearing on Hover */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'bg-black/20 backdrop-blur-[1px]' : 'opacity-0'}`}>
                <button
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-orange-500 hover:scale-110 transition-all shadow-lg border border-white/30"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
            </div>

            {/* Mute Toggle (Always visible slightly or on hover) */}
            <button
                onClick={toggleMute}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-20"
            >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
        </div>
    );
}
