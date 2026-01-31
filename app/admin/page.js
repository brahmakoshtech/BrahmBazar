'use client';

import { useState, Suspense } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

function AdminLoginForm() {
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
            const { data } = await api.post('/api/users/login', { email, password });

            if (data.role !== 'admin') {
                setError('Access Denied. Admins only.');
            } else {
                localStorage.setItem('userInfo', JSON.stringify(data));
                router.push('/admin/dashboard');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid email or password';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full bg-white/60 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-primary/10 shadow-2xl">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-serif font-bold text-foreground tracking-tight">
                        Admin Portal
                    </h2>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Secure Authentication
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6">
                            <span className="text-red-600 text-xs font-bold uppercase tracking-widest">{error}</span>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="appearance-none block w-full px-4 py-4 bg-white/50 border border-primary/10 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all font-medium"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-4 bg-white/50 border border-primary/10 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-4 px-4 border border-transparent text-xs font-bold uppercase tracking-[0.2em] rounded-full text-white bg-foreground hover:bg-secondary disabled:opacity-70 transition-all shadow-xl shadow-foreground/10 active:scale-[0.98]"
                    >
                        {loading ? 'Verifying...' : 'Access Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>}>
            <AdminLoginForm />
        </Suspense>
    );
}
