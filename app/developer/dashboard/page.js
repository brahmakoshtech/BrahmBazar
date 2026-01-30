'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { Terminal, Server, Database, Activity, ShieldAlert } from 'lucide-react';

export default function DeveloperDashboard() {
    const [systemHealth, setSystemHealth] = useState({
        status: 'Online',
        uptime: '99.9%',
        dbStatus: 'Connected',
        latency: '24ms'
    });
    // In a real app, we'd have a specific endpoint for system health. 
    // Reusing admin stats for some data for now.
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            // Developers can access admin stats too
            try {
                const { data } = await api.get('/api/admin/summary');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-black text-gray-300 p-6 font-sans">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                <div className="p-3 bg-white/5 rounded-full border border-white/10">
                    <Terminal size={32} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-4xl font-serif font-bold text-white tracking-wide">Developer <span className="text-primary">Console</span></h1>
                    <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-1">System Administration Access</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-neutral-900/50 backdrop-blur-md p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-3 mb-3 text-gray-400">
                        <Activity size={20} className="group-hover:text-primary transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-wider">System Status</span>
                    </div>
                    <div className="text-3xl font-serif font-bold text-white flex items-center gap-2">
                        {systemHealth.status}
                        <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(0,255,0,0.5)]"></span>
                    </div>
                </div>
                <div className="bg-neutral-900/50 backdrop-blur-md p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-3 mb-3 text-gray-400">
                        <Server size={20} className="group-hover:text-primary transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-wider">Server Uptime</span>
                    </div>
                    <div className="text-3xl font-serif font-bold text-white">{systemHealth.uptime}</div>
                </div>
                <div className="bg-neutral-900/50 backdrop-blur-md p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-3 mb-3 text-gray-400">
                        <Database size={20} className="group-hover:text-primary transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-wider">Database</span>
                    </div>
                    <div className="text-3xl font-serif font-bold text-white">{systemHealth.dbStatus}</div>
                </div>
                <div className="bg-neutral-900/50 backdrop-blur-md p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-3 mb-3 text-gray-400">
                        <ShieldAlert size={20} className="group-hover:text-primary transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-wider">Admin Privileges</span>
                    </div>
                    <div className="text-3xl font-serif font-bold text-white">Active</div>
                </div>
            </div>

            {/* Logs Window - Premium Terminal Style */}
            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 mb-8 h-80 overflow-y-auto font-mono relative group">
                <div className="absolute top-4 right-4 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <div className="text-gray-500 mb-4 text-xs uppercase tracking-widest border-b border-white/5 pb-2">System Logs / Live Stream</div>
                <div className="space-y-2 text-sm">
                    <p><span className="text-blue-400 opacity-80">[INFO]</span> <span className="text-gray-400">Server started on port 5000</span></p>
                    <p><span className="text-blue-400 opacity-80">[INFO]</span> <span className="text-gray-400">Database connection established</span></p>
                    <p><span className="text-yellow-500 opacity-80">[WARN]</span> <span className="text-gray-300">High latency detected on /api/orders (simulated)</span></p>
                    <p><span className="text-blue-400 opacity-80">[INFO]</span> <span className="text-gray-400">User session created for {stats ? 'Admin' : 'User'}</span></p>
                    <p><span className="text-green-500 opacity-80">[SUCCESS]</span> <span className="text-gray-300">Payments module initialized</span></p>
                    <p className="animate-pulse text-primary">_</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-900/50 backdrop-blur-md p-8 rounded-xl border border-white/5 hover:border-primary/30 transition-all">
                    <h2 className="text-2xl font-serif font-bold text-white mb-6">Quick Links</h2>
                    <ul className="space-y-4">
                        <li>
                            <Link href="/developer/users" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-3 group">
                                <span className="text-primary/50 group-hover:text-primary">&gt;</span> Manage Users (CRUD)
                            </Link>
                        </li>
                        <li>
                            <Link href="/admin/dashboard" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-3 group">
                                <span className="text-primary/50 group-hover:text-primary">&gt;</span> Access Admin Dashboard
                            </Link>
                        </li>
                        <li>
                            <a href="/api-docs" className="text-gray-600 cursor-not-allowed flex items-center gap-3">
                                <span className="text-gray-700">&gt;</span> API Documentation (Coming Soon)
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="bg-neutral-900/50 backdrop-blur-md p-8 rounded-xl border border-white/5 hover:border-primary/30 transition-all">
                    <h2 className="text-2xl font-serif font-bold text-white mb-6">Environment Config</h2>
                    <div className="bg-black/50 p-4 rounded-lg border border-white/5 overflow-x-auto">
                        <pre className="text-xs text-gray-400 leading-relaxed">
                            {`NODE_ENV=development
PORT=5000
DB_HOST=cluster0...
CLIENT_URL=http://localhost:3000
STRIPE_ENABLED=true`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
