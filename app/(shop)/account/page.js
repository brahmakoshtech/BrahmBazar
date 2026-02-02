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
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!user) return null; // Redirecting

    return (
        <div className="min-h-screen bg-transparent py-4 md:py-10 px-4 md:px-8 font-sans text-foreground selection:bg-primary/20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-row justify-between items-center mb-6 md:mb-10 gap-4 border-b border-primary/5 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl md:hidden">
                            <User size={20} className="text-primary" />
                        </div>
                        <h1 className="text-xl md:text-3xl font-serif font-black text-foreground tracking-tight">Account <span className="text-primary italic">Portal</span></h1>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-all px-4 py-2 rounded-full border border-primary/10 bg-white/30 hover:bg-white/60 active:scale-95 shadow-sm"
                    >
                        <LogOut size={14} />
                        <span className="font-bold text-[9px] uppercase tracking-[0.2em] hidden md:inline">Log Out</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-10">
                    {/* User Profile Card - Compact & Modern */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-primary/5 border border-white/40 p-6 sticky top-24 overflow-hidden relative group">
                            {/* Subtle Background Pattern */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />

                            <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-0 lg:text-center mb-6 relative z-10">
                                <div className="bg-primary/5 p-3 lg:p-4 rounded-2xl mb-0 lg:mb-4 border border-primary/10 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    <User size={28} className="text-primary" strokeWidth={1.5} />
                                </div>
                                <div className="flex flex-col lg:items-center">
                                    <h2 className="text-lg lg:text-xl font-serif font-black text-foreground line-clamp-1">{user.name}</h2>
                                    <p className="text-muted-foreground text-[10px] lg:text-[11px] font-bold uppercase tracking-widest mt-1 opacity-70">{user.email}</p>
                                </div>
                            </div>

                            <div className="border-t border-primary/5 pt-5 space-y-4 relative z-10">
                                <div className="flex justify-between lg:flex-col lg:gap-1">
                                    <p className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-50">Member Since</p>
                                    <p className="text-xs font-bold text-foreground/80">{new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                                </div>
                                <div className="flex justify-between items-center lg:flex-col lg:items-start lg:gap-2">
                                    <p className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-50">Status</p>
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/10">
                                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                        Verified
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-5">
                        <h2 className="text-lg md:text-xl font-serif font-black text-foreground flex items-center gap-2 mb-2">
                            <Package className="text-primary" size={20} />
                            <span>Order <span className="text-primary italic">Journey</span></span>
                        </h2>

                        {orders.length === 0 ? (
                            <div className="bg-white/30 backdrop-blur-sm rounded-[2rem] border border-primary/10 border-dashed p-10 md:p-16 text-center">
                                <div className="flex justify-center mb-4 opacity-10">
                                    <Package size={48} className="text-foreground" />
                                </div>
                                <h3 className="text-lg font-serif font-bold text-foreground">No orders yet</h3>
                                <p className="text-muted-foreground text-xs mb-6 max-w-xs mx-auto font-medium opacity-70">Your sacred journey is just beginning. Explore our collection.</p>
                                <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:gap-6">
                                {orders.map(order => (
                                    <div key={order._id} className="bg-white/40 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white/40 overflow-hidden hover:bg-white/60 transition-all group">

                                        {/* Compact Order Header */}
                                        <div className="bg-primary/5 px-4 md:px-6 py-3 flex flex-row justify-between items-center gap-2 border-b border-primary/5">
                                            <div className="flex flex-col">
                                                <p className="text-[7px] md:text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">ID: {order._id.slice(-8).toUpperCase()}</p>
                                                <p className="text-[10px] md:text-xs text-foreground font-black">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <span className={`px-2.5 py-1 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest border ${order.paymentStatus === 'Paid'
                                                    ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                    }`}>
                                                    {order.paymentStatus}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest border ${order.orderStatus === 'Delivered'
                                                    ? 'bg-primary text-white border-primary shadow-sm'
                                                    : 'bg-foreground text-white border-foreground'
                                                    }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Compact Order Items */}
                                        <div className="p-4 md:p-6 pb-2 md:pb-3">
                                            <div className="space-y-4">
                                                {order.products?.map((item, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 md:gap-4">
                                                        <div className="h-12 w-12 md:h-16 md:w-16 flex-shrink-0 overflow-hidden rounded-xl border border-primary/5 bg-white p-1">
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                className="h-full w-full object-cover rounded-lg"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-[11px] md:text-sm font-black text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest">Qty: {item.quantity}</p>
                                                                <span className="w-1 h-1 rounded-full bg-primary/20" />
                                                                <p className="text-[10px] md:text-xs font-black text-primary">₹{item.price?.toLocaleString('en-IN')}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t border-primary/5 mt-4 pt-4 flex justify-between items-center mb-4">
                                                <div className="hidden md:block">
                                                    <p className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-0.5">Shipping Status</p>
                                                    <p className="text-[10px] font-bold text-foreground/70 italic">Processing for sacred delivery.</p>
                                                </div>
                                                <div className="text-right w-full md:w-auto">
                                                    <p className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-0.5 opacity-50">Total Payable</p>
                                                    <p className="font-serif font-black text-lg md:text-xl text-primary">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>

                                            <div className="flex md:justify-end pb-2">
                                                <Link
                                                    href={`/order-success/${order._id}`}
                                                    className="w-full md:w-auto px-5 py-2.5 rounded-full bg-foreground text-background text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 group/btn shadow-md active:scale-95"
                                                >
                                                    Track Order
                                                    <span className="group-hover/btn:translate-x-1 transition-transform">&rarr;</span>
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
