'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import SupportChat from '@/components/SupportChat';
import { useToast } from '@/context/ToastContext';
import { AnimatePresence, motion } from 'framer-motion';

export default function AuthTabs({ initialTab = 'login' }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    // Shared State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const { error: toastError } = useToast();

    // Reset state when switching tabs
    useEffect(() => {
        setError(null);
        // We might want to keep email filled if switching tabs
    }, [activeTab]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setShowSupport(false);

        try {
            const { data } = await api.post('/api/users/login', { email, password });

            if (data.role === 'admin' || data.role === 'developer') {
                const msg = 'User not found';
                setError(msg);
                toastError('Account does not exist. Please register first.');
            } else {
                localStorage.setItem('userInfo', JSON.stringify(data));

                // Sync Guest Cart logic
                try {
                    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                    if (guestCart.length > 0) {
                        const validItems = guestCart.filter(item => item && item.product && item.product._id);
                        const cartPromises = validItems.map(item =>
                            api.post('/api/cart', { productId: item.product._id, quantity: item.quantity })
                        );
                        await Promise.all(cartPromises);
                        localStorage.removeItem('guestCart');
                    }
                } catch (syncError) {
                    console.error('Cart sync failed:', syncError);
                }

                if (data.role === 'user') {
                    router.push(redirect);
                } else {
                    router.push(redirect);
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid email or password';
            setError(msg);

            if (msg === 'User not found') {
                toastError('Account does not exist. Please register first.');
            } else if (msg === 'Account deactivated') {
                setShowSupport(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data } = await api.post('/api/users/register', { name, email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            router.push('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to register';
            setError(msg);

            if (msg === 'User already exists') {
                toastError('This email already exists. Try logging in.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-white/70 backdrop-blur-xl rounded-[24px] shadow-[0_10px_40px_rgba(214,158,46,0.15)] border border-white/80 overflow-hidden relative z-10 text-[#2D2420]">
            {/* Decorative Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D69E2E] to-transparent opacity-80" />

            {/* Header / Logo Area - Ultra Compact */}
            <div className="pt-5 pb-2 px-6 text-center flex flex-col items-center justify-center relative">
                {/* Golden Glow behind logo */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#D69E2E] rounded-full blur-[40px] opacity-20 pointer-events-none" />

                <div className="relative w-12 h-12 mb-2 transition-transform duration-700 hover:rotate-[360deg]">
                    <Image
                        src="/images/Brahmokosh.png"
                        alt="BRAHMAKOSH Logo"
                        fill
                        className="object-contain drop-shadow-sm"
                        priority
                    />
                </div>
                <h2 className="text-xl font-serif font-semibold tracking-wide text-[#2D2420]">
                    {activeTab === 'login' ? 'Welcome Back' : 'Begin Journey'}
                </h2>
                <p className="mt-0.5 text-[9px] text-[#5A4A42] tracking-[0.2em] uppercase font-bold">
                    {activeTab === 'login' ? 'Access your sacred space' : 'Join our spiritual community'}
                </p>
            </div>

            {/* Premium Tabs - Compact */}
            <div className="flex px-12 gap-6 mb-2 relative z-10">
                <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative ${activeTab === 'login' ? 'text-[#B58324] font-extrabold' : 'text-[#8C7A6F] hover:text-[#5A4A42]'
                        }`}
                >
                    Sign In
                    {activeTab === 'login' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B58324]"
                        />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative ${activeTab === 'register' ? 'text-[#B58324] font-extrabold' : 'text-[#8C7A6F] hover:text-[#5A4A42]'
                        }`}
                >
                    Sign Up
                    {activeTab === 'register' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B58324]"
                        />
                    )}
                </button>
            </div>

            {/* Form Container */}
            <div className="px-6 pb-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                    >
                        <form className="space-y-4 relative z-10" onSubmit={activeTab === 'login' ? handleLogin : handleRegister}>
                            {error && (
                                <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex flex-col gap-1">
                                    <span className="text-red-600 text-[10px] font-bold tracking-wide flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-red-500" />
                                        {error}
                                    </span>
                                    {showSupport && (
                                        <button
                                            type="button"
                                            onClick={() => setShowSupport(true)}
                                            className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 mt-1 text-left underline underline-offset-2"
                                        >
                                            Contact Support
                                        </button>
                                    )}
                                </div>
                            )}

                            {activeTab === 'register' && (
                                <div className="group relative">
                                    <label className="absolute left-3 -top-2 bg-white/90 px-1 text-[8px] font-bold text-[#8C7A6F] uppercase tracking-[0.2em] transition-colors group-focus-within:text-[#B58324]">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-white/50 border border-[#DCC8B0] rounded-xl text-[#2D2420] placeholder:text-[#2D2420]/30 text-xs focus:outline-none focus:border-[#B58324] focus:bg-white focus:shadow-[0_0_15px_rgba(214,158,46,0.1)] transition-all duration-300 font-medium"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="group relative">
                                <label className="absolute left-3 -top-2 bg-white/90 px-1 text-[8px] font-bold text-[#8C7A6F] uppercase tracking-[0.2em] transition-colors group-focus-within:text-[#B58324]">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-white/50 border border-[#DCC8B0] rounded-xl text-[#2D2420] placeholder:text-[#2D2420]/30 text-xs focus:outline-none focus:border-[#B58324] focus:bg-white focus:shadow-[0_0_15px_rgba(214,158,46,0.1)] transition-all duration-300 font-medium"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="username"
                                />
                            </div>

                            <div className="group relative">
                                <div className="flex items-center justify-between absolute right-3 -top-2 z-10">
                                    {activeTab === 'login' && (
                                        <Link
                                            href="/forgot-password"
                                            className="bg-white/90 px-1 text-[8px] font-bold uppercase tracking-wider text-[#8C7A6F] hover:text-[#B58324] transition-colors"
                                        >
                                            Forgot?
                                        </Link>
                                    )}
                                </div>
                                <label className="absolute left-3 -top-2 bg-white/90 px-1 text-[8px] font-bold text-[#8C7A6F] uppercase tracking-[0.2em] transition-colors group-focus-within:text-[#B58324] z-10">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 bg-white/50 border border-[#DCC8B0] rounded-xl text-[#2D2420] placeholder:text-[#2D2420]/30 text-xs focus:outline-none focus:border-[#B58324] focus:bg-white focus:shadow-[0_0_15px_rgba(214,158,46,0.1)] transition-all duration-300 font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete={activeTab === 'login' ? "current-password" : "new-password"}
                                />
                                {activeTab === 'register' && (
                                    <p className="mt-1.5 text-[8px] text-[#8C7A6F] font-medium pl-3 tracking-wide">Must be at least 6 characters</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative group overflow-hidden py-3 px-4 border border-[#B58324]/20 rounded-xl transition-all duration-300 transform active:scale-[0.98] mt-2 shadow-lg shadow-[#D69E2E]/20"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#D69E2E] to-[#B58324] opacity-100 group-hover:brightness-110 transition-all" />
                                <span className="relative flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                                    {loading ? (
                                        <span className="animate-pulse">Processing...</span>
                                    ) : (
                                        <>
                                            {activeTab === 'login' ? 'Enter Space' : 'Begin Path'}
                                            <span className="text-xs">→</span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                    </motion.div>
                </AnimatePresence>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#DCC8B0]/50"></div>
                    </div>
                    <div className="relative flex justify-center text-[8px] uppercase">
                        <span className="bg-white/70 backdrop-blur px-2 text-[#8C7A6F] font-bold tracking-[0.2em]">Or continue with</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => window.location.href = 'https://store.brahmakosh.com/auth/google'}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-[#DCC8B0] rounded-xl text-[10px] font-bold text-[#2D2420] bg-white hover:bg-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#B58324]/50 transition-all duration-300 transform active:scale-[0.98] shadow-sm"
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                        <path d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.16-3.16C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                {/* Additional Action Buttons */}
                <div className="flex gap-3 md:gap-4 mt-4">
                    <button
                        type="button"
                        onClick={() => router.push('/terms')}
                        className="flex-1 py-3 px-4 rounded-xl border border-[#DCC8B0] text-[#5A4A42] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#FAF9F6] bg-white transition-all duration-300 shadow-sm text-center"
                    >
                        Terms & Conditions
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push(redirect)}
                        className="flex-1 py-3 px-4 rounded-xl border border-[#DCC8B0] text-[#5A4A42] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#FAF9F6] bg-white transition-all duration-300 shadow-sm text-center"
                    >
                        Back
                    </button>
                </div>
            </div>

            {showSupport && (
                <SupportChat
                    onClose={() => setShowSupport(false)}
                    predefinedMessage="My account has been deactivated. I would like to request reactivation."
                />
            )}
        </div>
    );
}
