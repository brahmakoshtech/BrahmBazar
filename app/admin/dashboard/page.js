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
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} height="120px" className="w-full bg-neutral-900 shadow-sm border border-white/10" />
                ))}
            </div>
            <Skeleton height="400px" className="w-full bg-neutral-900 shadow-sm border border-white/10" />
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Dashboard Overview</h1>
                    <p className="text-gray-400 mt-1">Welcome back. Your spiritual store insights.</p>
                </div>
                <div className="text-sm text-primary font-medium border border-primary/20 px-4 py-2 rounded-full bg-primary/10">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-neutral-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 hover:border-primary/30 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300 border border-white/5`}>
                                {stat.icon}
                            </div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {idx === 0 ? '+12% this month' : 'Updated now'}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                            <p className="text-3xl font-serif font-bold text-white tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders Section */}
            <div className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        Recent Orders
                    </h2>
                    <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:text-white flex items-center gap-1 group transition-colors">
                        View All
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats.recentOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-xs text-primary/80 bg-primary/10 px-2 py-1 rounded border border-primary/20">
                                            #{order._id.substring(0, 8)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {(order.user?.name || 'G')[0]}
                                            </div>
                                            <div className="text-sm font-medium text-gray-200">
                                                {order.user?.name || 'Guest User'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-white">
                                        ₹{order.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.paymentStatus === 'Paid'
                                            ? 'bg-green-900/20 text-green-400 border-green-900/30'
                                            : 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${order.paymentStatus === 'Paid' ? 'bg-green-400' : 'bg-yellow-400'
                                                }`}></span>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/orders/${order._id}`} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                            Manage
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
