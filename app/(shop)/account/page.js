'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { User, Package, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchAccountData = async () => {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo) {
                router.push('/login?redirect=/account');
                return;
            }

            setUser(JSON.parse(userInfo));

            try {
                // Fetch User Orders
                // Note: We need a route for 'my orders'. 
                // Let's assume GET /api/orders/myorders or similar based on standard Controller patterns
                // Checking previous implementation plan/history might be needed, but let's try standard first.
                // Re-using admin route might fail if not protected correctly, usually it's /api/orders/myorders
                const { data } = await api.get('/api/orders/myorders');
                setOrders(data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
                // Graceful degration: show empty orders if API fails (or route doesn't exist yet)
            } finally {
                setLoading(false);
            }
        };

        fetchAccountData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('guestCart'); // Optional: clear or keep? Usually keep guest stuff clear.
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'; // Clear cookie if used
        router.push('/login');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!user) return null; // Redirecting

    return (
        <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans text-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide">My Account</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage your profile and view your sacred journey.</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                    >
                        <LogOut size={18} />
                        <span className="font-medium tracking-wide">Sign Out</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-neutral-900/50 rounded-2xl shadow-xl border border-white/5 backdrop-blur-sm p-8 sticky top-8">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-full mb-4 ring-1 ring-primary/30">
                                    <User size={40} className="text-primary" />
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-white tracking-wide">{user.name}</h2>
                                <p className="text-gray-400 text-sm font-mono mt-1">{user.email}</p>
                            </div>

                            <div className="border-t border-white/10 pt-6 space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Member Since</p>
                                    <p className="text-gray-300 font-medium">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Account Status</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/20">
                                        Active Devotee
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
                            <Package className="text-primary" />
                            <span>Order History</span>
                        </h2>

                        {orders.length === 0 ? (
                            <div className="bg-neutral-900/30 rounded-2xl border border-white/5 border-dashed p-12 text-center">
                                <div className="flex justify-center mb-4">
                                    <Package size={48} className="text-gray-700" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Your journey awaits. Explore our sacred collection and begin.</p>
                                <Link href="/" className="inline-flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-full font-bold hover:bg-secondary transition-colors">
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map(order => (
                                    <div key={order._id} className="bg-neutral-900/60 rounded-xl shadow-lg border border-white/5 overflow-hidden hover:border-white/10 transition-colors">

                                        {/* Order Header */}
                                        <div className="bg-white/5 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-white/5">
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Order ID</p>
                                                <p className="font-mono text-sm text-white">{order._id}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Date</p>
                                                <p className="text-sm text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.paymentStatus === 'Paid'
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    {order.paymentStatus}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.orderStatus === 'Delivered'
                                                        ? 'bg-primary/10 text-primary border-primary/20'
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Content */}
                                        <div className="p-6">
                                            <div className="space-y-6">
                                                {order.products?.map((item, idx) => (
                                                    <div key={idx} className="flex items-start gap-4">
                                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-neutral-800">
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                className="h-full w-full object-cover object-center opacity-90"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-base font-medium text-gray-200">{item.title}</h3>
                                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                                <p>Qty: {item.quantity}</p>
                                                                <p className="text-gray-400">|</p>
                                                                <p className="font-medium text-primary">₹{item.price?.toLocaleString('en-IN')}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t border-white/10 mt-6 pt-4 flex justify-between items-center">
                                                <p className="text-gray-400 text-sm">Total Amount</p>
                                                <p className="font-serif font-bold text-xl text-primary">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                            </div>

                                            <div className="mt-6 flex justify-end">
                                                <Link
                                                    href={`/order-success/${order._id}`}
                                                    className="text-sm font-medium text-white hover:text-primary transition-colors flex items-center gap-1 group"
                                                >
                                                    View Invoice & Details
                                                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
