'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { Package, User as UserIcon, Heart } from 'lucide-react';

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: userData } = await api.get('/api/users/profile');
                const { data: ordersData } = await api.get('/api/orders/myorders');
                setUser(userData);
                setOrders(ordersData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!user) return <div className="text-center p-10">Please login to view your dashboard.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl min-h-[60vh]">
            <h1 className="text-3xl font-serif font-bold text-white tracking-wide mb-8">My Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Profile Card */}
                <div className="bg-neutral-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 hover:border-primary/30 transition-all group flex items-center gap-4">
                    <div className="bg-primary/10 p-4 rounded-full border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                        <UserIcon className="text-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{user.name}</h2>
                        <p className="text-gray-400 text-sm mb-1">{user.email}</p>
                        <Link href="/profile" className="text-primary text-xs font-medium uppercase tracking-wider hover:text-white transition-colors">Edit Profile</Link>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-neutral-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 hover:border-primary/30 transition-all group flex items-center gap-4">
                    <div className="bg-green-900/20 p-4 rounded-full border border-green-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Package className="text-green-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{orders.length} Orders</h2>
                        <Link href="/user/orders" className="text-green-500 text-xs font-medium uppercase tracking-wider hover:text-white transition-colors">View History</Link>
                    </div>
                </div>

                {/* Wishlist Card */}
                <div className="bg-neutral-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 hover:border-primary/30 transition-all group flex items-center gap-4">
                    <div className="bg-red-900/20 p-4 rounded-full border border-red-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Heart className="text-red-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Wishlist</h2>
                        <Link href="/wishlist" className="text-red-500 text-xs font-medium uppercase tracking-wider hover:text-white transition-colors">View Saved Items</Link>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-primary">Recent</span> Orders
            </h2>

            {orders.length === 0 ? (
                <div className="bg-neutral-900/30 rounded-2xl border border-white/5 p-12 text-center">
                    <Package size={48} className="mx-auto text-gray-700 mb-4" />
                    <p className="text-gray-400">No recent orders found. Start your spiritual journey today.</p>
                </div>
            ) : (
                <div className="bg-neutral-900/50 backdrop-blur-sm shadow-lg rounded-2xl border border-white/5 overflow-hidden">
                    <ul className="divide-y divide-white/5">
                        {orders.slice(0, 5).map((order) => (
                            <li key={order._id} className="hover:bg-white/5 transition-colors duration-200">
                                <div className="px-6 py-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm font-mono font-medium text-primary/80 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                            #{order._id.substring(0, 8)}
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wider border ${order.orderStatus === 'Delivered'
                                                    ? 'bg-green-900/20 text-green-400 border-green-500/30'
                                                    : order.orderStatus === 'Cancelled'
                                                        ? 'bg-red-900/20 text-red-400 border-red-500/30'
                                                        : 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30'
                                                }`}>
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="text-gray-400 flex items-center gap-1">
                                            <span className="text-gray-600">Placed on</span> {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-white font-bold text-lg">
                                            ₹{order.totalAmount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
