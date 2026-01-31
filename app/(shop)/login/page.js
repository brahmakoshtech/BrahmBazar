'use client';

import { useState, Suspense } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SupportChat from '@/components/SupportChat';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSupport, setShowSupport] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setShowSupport(false);

        try {
            const { data } = await api.post('/api/users/login', { email, password });

            if (data.role === 'admin') {
                setError('This login is for customers only. Please use the Admin Portal.');
            } else if (data.role === 'developer') {
                setError('Restricted: Please use the Developer Portal.');
            } else {
                localStorage.setItem('userInfo', JSON.stringify(data));

                // SYNC GUEST CART
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
                    router.push('/user/dashboard');
                } else {
                    router.push(redirect);
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid email or password';
            setError(msg);
            if (msg === 'Account deactivated') {
                setShowSupport(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            {/* Background Gradient/Effects */}
            <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent opacity-30 pointer-events-none"></div>

            <div className="max-w-md w-full bg-neutral-900/60 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl border border-white/10 relative z-10">
                <div className="mb-8 text-center">
                    <span className="text-3xl mb-4 block filter drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">🕉️</span>
                    <h2 className="text-3xl font-serif font-bold text-white tracking-wide">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-400 tracking-wide uppercase">
                        Continue your sacred journey
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md flex flex-col gap-2">
                            <span className="text-red-400 text-sm font-medium">{error}</span>
                            {showSupport && (
                                <button
                                    type="button"
                                    onClick={() => setShowSupport(true)}
                                    className="text-sm font-bold underline text-red-300 hover:text-red-200 text-left"
                                >
                                    Contact Support for Activation
                                </button>
                            )}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="appearance-none block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 text-white transition-all"
                                placeholder="seeker@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider" htmlFor="password">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-semibold text-primary hover:text-white transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 text-white transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-primary hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all transform active:scale-[0.98]"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <p className="mt-4 text-center text-sm text-gray-500">
                        New to BRAHMAKOSH?{' '}
                        <Link href="/register" className="font-bold text-primary hover:text-white transition-colors">
                            Begin your journey
                        </Link>
                    </p>
                </form>
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

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-primary">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
