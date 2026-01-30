'use client';

import { useState, Suspense } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

function DeveloperLoginForm() {
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

            if (data.role !== 'developer') {
                setError('Access Denied. Developers only.');
            } else {
                localStorage.setItem('userInfo', JSON.stringify(data));
                router.push('/developer/dashboard');
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
            <div className="max-w-md w-full bg-neutral-900/60 p-8 rounded-2xl border border-white/10 font-mono">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-green-500 tracking-wide">
                        &lt;Developer /&gt;
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        System access point
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
                                className="appearance-none block w-full px-4 py-3 bg-black border border-green-500/30 rounded-lg placeholder-gray-600 focus:outline-none focus:border-green-500 text-green-400 transition-all font-mono"
                                placeholder="dev@system.local"
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
                                className="appearance-none block w-full px-4 py-3 bg-black border border-green-500/30 rounded-lg placeholder-gray-600 focus:outline-none focus:border-green-500 text-green-400 transition-all font-mono"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3.5 px-4 border border-green-600 text-sm font-bold rounded-lg text-green-500 hover:bg-green-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 transition-all font-mono"
                    >
                        {loading ? 'Initializing...' : 'Execute Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function DeveloperLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono">Loading...</div>}>
            <DeveloperLoginForm />
        </Suspense>
    );
}
