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
        <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full bg-neutral-900/60 p-8 rounded-2xl border border-white/10">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-white tracking-wide">
                        Admin Portal
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Secure access for administrators
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
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="appearance-none block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white transition-all"
                                placeholder="admin@example.com"
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
                                className="appearance-none block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 transition-all"
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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
            <AdminLoginForm />
        </Suspense>
    );
}
