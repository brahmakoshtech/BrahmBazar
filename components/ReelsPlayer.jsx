'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ChevronUp,
    ChevronDown,
    ArrowLeft,
    Volume2,
    VolumeX,
    Play,
    Pause,
    Share2,
    Heart
} from 'lucide-react';
import api from '@/services/api';

export default function ReelsPlayer({ isModal = false }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialReelId = searchParams.get('id');

    const [reels, setReels] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true); // Auto-play usually requires mute initially
    const [isPlaying, setIsPlaying] = useState(true);

    // Refs for scrolling and video elements
    const containerRef = useRef(null);
    const videoRefs = useRef([]);

    // Fetch Reels
    useEffect(() => {
        const fetchReels = async () => {
            try {
                const { data } = await api.get('/api/reels');
                if (data && data.length > 0) {
                    setReels(data);

                    // Find index if initialReelId is present
                    if (initialReelId) {
                        const index = data.findIndex(r => r._id === initialReelId);
                        if (index !== -1) setCurrentIndex(index);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch reels:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReels();
    }, [initialReelId]);

    // Handle Scroll / Swipe to change active reel
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const scrollPosition = container.scrollTop;
        const height = container.clientHeight;

        // Calculate current index based on scroll position
        const index = Math.round(scrollPosition / height);

        if (index !== currentIndex && index >= 0 && index < reels.length) {
            setCurrentIndex(index);
            setIsPlaying(true); // Auto-play nex video
        }
    }, [currentIndex, reels.length]);

    // Attach Scroll Listener
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            // Throttle could be added here for performance
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll]);

    // Keyboard Navigation (Desktop)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') scrollToReel(currentIndex + 1);
            if (e.key === 'ArrowUp') scrollToReel(currentIndex - 1);
            if (e.key === 'm') setIsMuted(prev => !prev);
            if (e.key === ' ') {
                e.preventDefault(); // Prevent scroll
                togglePlay();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    // Sync Playback: Pause others, Play current
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (!video) return;

            if (index === currentIndex) {
                // Reset time if needed or just play
                if (isPlaying) {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.log("Autoplay prevented:", error);
                            // Ensure UI shows paused state if autoplay fails
                            if (!isMuted) setIsPlaying(false);
                        });
                    }
                } else {
                    video.pause();
                }
            } else {
                video.pause();
                video.currentTime = 0; // Reset others
            }
        });
    }, [currentIndex, isPlaying, reels]);

    // Helper: Scroll to specific index programmatically
    const scrollToReel = (index) => {
        if (index < 0 || index >= reels.length || !containerRef.current) return;

        containerRef.current.scrollTo({
            top: index * containerRef.current.clientHeight,
            behavior: 'smooth'
        });
        setCurrentIndex(index);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);
    const toggleMute = () => setIsMuted(!isMuted);

    if (loading) return <div className="h-screen w-full bg-black flex items-center justify-center text-white">Loading Sacred Reels...</div>;
    if (reels.length === 0) return <div className="h-screen w-full bg-black flex items-center justify-center text-white">No active reels found.</div>;

    return (
        <div className={`fixed inset-0 z-[60] flex flex-col h-[100dvh] ${isModal ? 'bg-[#FFF0D2]/80 backdrop-blur-xl' : 'bg-[#FFF0D2]'}`}>

            {/* BACK BUTTON */}
            <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 z-[60] p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                aria-label="Go Back"
            >
                <ArrowLeft size={24} />
            </button>

            {/* MAIN PLAYER CONTAINER */}
            <div className={`relative w-full h-full mx-auto flex flex-col items-center justify-center ${isModal ? 'md:py-4' : ''}`}>

                {/* VERTICAL SCROLL SNAP CONTAINER */}
                <div
                    ref={containerRef}
                    className="w-full h-full md:w-auto md:h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {reels.map((reel, index) => (
                        <div
                            key={reel._id}
                            className="w-full h-full snap-center snap-always flex items-center justify-center md:p-4"
                        >
                            {/* RESPONSIVE WRAPPER: Mobile=Block, Desktop=Flex */}
                            <div className="relative w-full h-full md:w-[480px] md:h-[85vh] flex md:flex-row items-end md:items-center justify-center">

                                {/* VIDEO CARD */}
                                <div className="relative w-full h-full md:rounded-2xl overflow-hidden shadow-2xl bg-black">
                                    <video
                                        ref={el => videoRefs.current[index] = el}
                                        src={reel.videoUrl}
                                        className="w-full h-full object-cover"
                                        loop
                                        playsInline
                                        muted={isMuted}
                                        onClick={togglePlay}
                                    />

                                    {/* GRADIENT OVERLAYS */}
                                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                                    {/* PLAY/PAUSE ICON (Centered) */}
                                    {!isPlaying && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                                            <div className="p-4 rounded-full bg-black/40 backdrop-blur-sm">
                                                <Play size={48} fill="white" className="text-white opacity-80" />
                                            </div>
                                        </div>
                                    )}

                                    {/* BOTTOM INFO AREA */}
                                    <div className="absolute bottom-6 left-4 right-16 md:right-4 z-10 text-left">
                                        <h3 className="text-white font-serif text-lg font-bold mb-1 drop-shadow-md line-clamp-2">
                                            {reel.title || 'Sacred Moments'}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex-shrink-0" />
                                            <span className="text-white/90 text-sm font-medium">BrahmKosh Official</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ACTION BUTTONS: Mixed Approach */}
                                {/* Mobile: Overlay (Absolute) | Desktop: Sidebar (Relative/Flex) */}
                                <div className={`
                                    flex flex-col gap-6 items-center z-20
                                    absolute right-4 bottom-20  /* Mobile Positioning */
                                    md:static md:ml-6 md:pb-0 md:h-auto md:justify-center /* Desktop Positioning */
                                `}>
                                    <button className="flex flex-col items-center gap-1 group">
                                        <div className="p-3 bg-black/40 md:bg-zinc-100 md:dark:bg-zinc-800 backdrop-blur-md md:backdrop-blur-none rounded-full md:hover:bg-zinc-200 md:dark:hover:bg-zinc-700 transition-colors shadow-md">
                                            <Heart size={24} className="text-white md:text-zinc-900 md:dark:text-white group-hover:text-red-500 transition-colors" />
                                        </div>
                                        <span className="text-xs font-semibold text-white md:text-zinc-900 md:dark:text-zinc-200 shadow-black drop-shadow-md md:shadow-none">Like</span>
                                    </button>

                                    <button className="flex flex-col items-center gap-1 group">
                                        <div className="p-3 bg-black/40 md:bg-zinc-100 md:dark:bg-zinc-800 backdrop-blur-md md:backdrop-blur-none rounded-full md:hover:bg-zinc-200 md:dark:hover:bg-zinc-700 transition-colors shadow-md">
                                            <Share2 size={24} className="text-white md:text-zinc-900 md:dark:text-white" />
                                        </div>
                                        <span className="text-xs font-semibold text-white md:text-zinc-900 md:dark:text-zinc-200 shadow-black drop-shadow-md md:shadow-none">Share</span>
                                    </button>

                                    <button onClick={toggleMute} className="flex flex-col items-center gap-1 group">
                                        <div className="p-3 bg-black/40 md:bg-zinc-100 md:dark:bg-zinc-800 backdrop-blur-md md:backdrop-blur-none rounded-full md:hover:bg-zinc-200 md:dark:hover:bg-zinc-700 transition-colors shadow-md">
                                            {isMuted ? <VolumeX size={24} className="text-white md:text-zinc-900 md:dark:text-white" /> : <Volume2 size={24} className="text-white md:text-zinc-900 md:dark:text-white" />}
                                        </div>
                                        <span className="text-xs font-semibold text-white md:text-zinc-900 md:dark:text-zinc-200 shadow-black drop-shadow-md md:shadow-none">{isMuted ? 'Unmute' : 'Mute'}</span>
                                    </button>

                                    {/* NAVIGATION ARROWS (Desktop Only) */}
                                    <div className="hidden md:flex flex-col gap-4 mt-4">
                                        <button
                                            onClick={() => scrollToReel(currentIndex - 1)}
                                            disabled={currentIndex === 0}
                                            className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 text-zinc-900 dark:text-white transition-all shadow-md"
                                        >
                                            <ChevronUp size={24} />
                                        </button>
                                        <button
                                            onClick={() => scrollToReel(currentIndex + 1)}
                                            disabled={currentIndex === reels.length - 1}
                                            className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 text-zinc-900 dark:text-white transition-all shadow-md"
                                        >
                                            <ChevronDown size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

            </div>

        </div>
    );
}
