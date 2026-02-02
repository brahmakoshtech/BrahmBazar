'use client';

import { useState } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] opacity-60" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] opacity-60" />
            </div>

            <div className="max-w-md w-full bg-white/60 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-[#D69E2E]/10 border border-white/40 relative z-10">
                <div className="mb-8 text-center flex flex-col items-center justify-center">
                    <div className="relative w-24 h-24 mb-4 filter drop-shadow-sm">
                        <Image
                            src="/images/Brahmokosh.png"
                            alt="BRAHMAKOSH Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-foreground tracking-wide">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground tracking-wide uppercase font-bold">
                        Join our community of seekers
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <span className="text-red-700 text-sm font-bold">{error}</span>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1 ml-1" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                className="appearance-none block w-full px-5 py-3.5 bg-white border border-[#DCC8B0] rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-medium"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1 ml-1" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="appearance-none block w-full px-5 py-3.5 bg-white border border-[#DCC8B0] rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-medium"
                                placeholder="seeker@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1 ml-1" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-5 py-3.5 bg-white border border-[#DCC8B0] rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="mt-2 text-[10px] text-muted-foreground font-medium pl-1">Must be at least 6 characters</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-[0.1em] rounded-xl text-white bg-primary hover:bg-[#B58324] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all transform active:scale-[0.98]"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#DCC8B0]/50"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white/80 backdrop-blur px-2 text-muted-foreground font-bold tracking-wider">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.location.href = 'https://store.brahmakosh.com/auth/google'}
                        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-[#DCC8B0] rounded-xl text-sm font-bold text-foreground bg-white hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all transform active:scale-[0.98] shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.16-3.16C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </button>

                    <p className="mt-4 text-center text-sm text-muted-foreground font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold text-primary hover:text-foreground transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
