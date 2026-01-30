'use client';

import { useState } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data } = await api.post('/api/users/register', { name, email, password });

            // Save user info and redirect
            localStorage.setItem('userInfo', JSON.stringify(data));
            router.push('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent opacity-30 pointer-events-none"></div>

            <div className="max-w-md w-full bg-neutral-900/60 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl border border-white/10 relative z-10">
                <div className="mb-8 text-center">
                    <span className="text-3xl mb-4 block filter drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">🕉️</span>
                    <h2 className="text-3xl font-serif font-bold text-white tracking-wide">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-400 tracking-wide uppercase">
                        Join our community of seekers
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md">
                            <span className="text-red-400 text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                className="appearance-none block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 text-white transition-all"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

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
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 text-white transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-primary hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all transform active:scale-[0.98]"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <p className="mt-4 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold text-primary hover:text-white transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
