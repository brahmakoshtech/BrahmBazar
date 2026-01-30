'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Shield, Key, Terminal } from 'lucide-react';

export default function DeveloperSetupPage() {
    const [secretKey, setSecretKey] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/api/users/developer-init', { secretKey });
            // Update local storage with new token/role
            localStorage.setItem('userInfo', JSON.stringify(data));
            // Trigger storage event for Navbar update if needed
            window.dispatchEvent(new Event('storage'));
            alert('Success! You are now a Developer.');
            router.push('/admin/dashboard');
        } catch (error) {
            console.error('Setup failed:', error);
            alert(error.response?.data?.message || 'Invalid Secret Key');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Terminal className="text-green-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Developer Initialization</h1>
                    <p className="mt-2 text-gray-400 text-sm">Enter the master key to unlock system access.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Master Secret Key
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key className="text-gray-500" size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                className="block w-full pl-10 bg-gray-900 border border-gray-600 rounded-lg py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono"
                                placeholder="••••••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Initializing...' : (
                            <>
                                <Shield size={18} /> Initialize System
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => router.push('/')} className="text-gray-500 hover:text-white text-sm transition-colors">
                        Cancel and Return Home
                    </button>
                </div>
            </div>
        </div>
    );
}
