'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Package, Users, ArrowRight, TrendingUp } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        usersCount: 0,
        productsCount: 0,
        ordersCount: 0,
        totalSales: 0,
        recentOrders: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/api/admin/summary');
                setStats(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-[120px] w-full bg-white/40 rounded-3xl border border-primary/10 shadow-sm" />
                ))}
            </div>
            <div className="h-[400px] w-full bg-white/40 rounded-3xl border border-primary/10 shadow-sm" />
        </div>
    );

    if (error) return <div className="p-6 bg-red-900/20 text-red-400 rounded-lg border border-red-900/30">Error: {error}</div>;

    const statCards = [
        { title: 'Total Revenue', value: `₹${stats.totalSales.toLocaleString()}`, icon: <DollarSign size={24} />, color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Total Orders', value: stats.ordersCount, icon: <ShoppingBag size={24} />, color: 'text-blue-400', bg: 'bg-blue-900/10' },
        { title: 'Products', value: stats.productsCount, icon: <Package size={24} />, color: 'text-purple-400', bg: 'bg-purple-900/10' },
        { title: 'Total Users', value: stats.usersCount, icon: <Users size={24} />, color: 'text-orange-400', bg: 'bg-orange-900/10' },
    ];

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard Overview</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Welcome back. Your store's sacred insights.</p>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-primary border border-primary/20 px-6 py-3 rounded-full bg-white/60 backdrop-blur-md shadow-sm">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-primary/5 border border-primary/10 hover:border-primary/40 transition-all hover:bg-white group">
                        <div className="flex items-start justify-between mb-6">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300 border border-primary/5`}>
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">
                                {idx === 0 ? '+12% growth' : 'Real-time'}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em] mb-2">{stat.title}</h3>
                            <p className="text-3xl font-serif font-bold text-foreground italic leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl shadow-primary/5 border border-primary/10 overflow-hidden mb-20">
                <div className="p-8 border-b border-primary/5 flex items-center justify-between">
                    <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <TrendingUp size={20} className="text-secondary" />
                        </div>
                        Recent Orders
                    </h2>
                    <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-widest text-primary hover:text-foreground flex items-center gap-2 group transition-all">
                        View Database
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary/5">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Transaction</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Devotee</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Offering</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-right">Access</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {stats.recentOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-primary/5 transition-all group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                                            #{order._id.substring(order._id.length - 6).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-secondary text-white font-serif font-bold text-sm flex items-center justify-center shadow-lg shadow-secondary/20">
                                                {(order.user?.name || 'G')[0]}
                                            </div>
                                            <div className="text-sm font-bold text-foreground">
                                                {order.user?.name || 'Guest User'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-6 text-base font-bold text-primary italic">
                                        ₹{order.totalAmount.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${order.paymentStatus === 'Paid'
                                            ? 'bg-green-500 text-white border-green-600'
                                            : 'bg-amber-500 text-white border-amber-600'
                                            }`}>
                                            {order.paymentStatus === 'Paid' ? 'Cleared' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Link href={`/admin/orders/${order._id}`} className="px-6 py-2.5 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-md group-hover:shadow-lg">
                                            Review
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {stats.recentOrders.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package size={32} className="opacity-20" />
                                            <p>No active orders found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
