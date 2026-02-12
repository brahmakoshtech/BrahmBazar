'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { User, Package, LogOut, MapPin } from 'lucide-react';
import AddressManager from '@/components/AddressManager';
import Link from 'next/link';

export default function AccountPage() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // Default to 'orders' or 'profile'
    const [mobileView, setMobileView] = useState('menu'); // 'menu' | 'content'
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
        <div className="min-h-screen bg-transparent pt-0 md:pt-16 pb-20 md:py-10 px-4 md:px-8 font-sans text-foreground selection:bg-primary/20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-row justify-between items-center mb-4 md:mb-6 gap-4 border-b border-primary/5 pb-2 sticky top-20 md:top-32 z-30 bg-[#f9f2e8]/95 backdrop-blur-md py-2 -mx-4 px-4 md:-mx-8 md:px-8 transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl md:hidden">
                            <User size={18} className="text-primary" />
                        </div>
                        <h1 className="text-base md:text-3xl font-serif font-black text-foreground tracking-tight">Account <span className="text-primary italic">Portal</span></h1>
                    </div>

                    {/* Mobile Back Button in Header */}
                    {mobileView === 'content' && (
                        <button
                            onClick={() => setMobileView('menu')}
                            className="lg:hidden flex items-center gap-1 text-muted-foreground hover:text-primary font-bold text-[10px] uppercase tracking-wider border border-primary/10 px-3 py-1.5 rounded-full bg-white/50 active:scale-95 transition-all shadow-sm"
                        >
                            <span>&larr;</span> Menu
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-10">
                    {/* LEFT SIDEBAR NAVIGATION */}
                    <div className={`lg:col-span-1 ${mobileView === 'menu' ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl shadow-primary/5 border border-white/40 p-4 sticky top-32 md:top-40 overflow-hidden">
                            {/* Mobile User Info Summary */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/5 lg:hidden">
                                <div className="bg-primary/5 p-2 rounded-full">
                                    <User size={16} className="text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-foreground">{user.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                <button
                                    onClick={() => { setActiveTab('profile'); setMobileView('content'); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold tracking-wide ${activeTab === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/60 hover:text-primary'}`}
                                >
                                    <User size={18} />
                                    <span>My Profile</span>
                                </button>
                                <button
                                    onClick={() => { setActiveTab('orders'); setMobileView('content'); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold tracking-wide ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/60 hover:text-primary'}`}
                                >
                                    <Package size={18} />
                                    <span>Order Journey</span>
                                </button>
                                <button
                                    onClick={() => { setActiveTab('addresses'); setMobileView('content'); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold tracking-wide ${activeTab === 'addresses' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/60 hover:text-primary'}`}
                                >
                                    <MapPin size={18} />
                                    <span>My Addresses</span>
                                </button>
                            </nav>

                            <div className="mt-6 pt-4 border-t border-primary/5">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 text-sm font-bold tracking-wide transition-all opacity-80 hover:opacity-100"
                                >
                                    <LogOut size={18} />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className={`lg:col-span-3 ${mobileView === 'content' ? 'block' : 'hidden lg:block'}`}>


                        {/* 1. MY PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-base md:text-2xl font-serif font-black text-foreground flex items-center gap-2 mb-2 md:mb-6">
                                    <User className="text-primary w-4 h-4 md:w-6 md:h-6" />
                                    <span>My <span className="text-primary italic">Profile</span></span>
                                </h2>

                                <div className="bg-white/40 backdrop-blur-xl rounded-xl md:rounded-[2rem] shadow-sm border border-white/40 p-3 md:p-10 relative overflow-hidden group">
                                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />

                                    <div className="flex flex-col md:flex-row gap-3 md:gap-10 items-center md:items-start relative z-10">
                                        <div className="bg-white p-2 md:p-4 rounded-full shadow-lg shadow-primary/10 border-4 border-white/50">
                                            <div className="w-12 h-12 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User size={24} className="md:w-12 md:h-12" strokeWidth={1.5} />
                                            </div>
                                        </div>

                                        <div className="flex-1 text-center md:text-left space-y-2 md:space-y-4">
                                            <div>
                                                <h3 className="text-lg md:text-2xl font-bold text-foreground mb-0 md:mb-1">{user.name}</h3>
                                                <p className="text-muted-foreground font-medium text-[10px] md:text-base">{user.email}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 md:grid-cols-2 max-w-lg">
                                                <div className="bg-white/50 p-2 md:p-3 rounded-xl border border-primary/5">
                                                    <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5 md:mb-1">Member Since</p>
                                                    <p className="font-bold text-xs md:text-base text-foreground">{new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                                                </div>
                                                <div className="bg-white/50 p-2 md:p-3 rounded-xl border border-primary/5">
                                                    <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5 md:mb-1">Status</p>
                                                    <div className="flex items-center gap-1.5 md:gap-2 justify-center md:justify-start">
                                                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                        <p className="font-bold text-xs md:text-base text-green-600">Active</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. ORDER JOURNEY TAB */}
                        {activeTab === 'orders' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg md:text-2xl font-serif font-black text-foreground flex items-center gap-2 mb-4 md:mb-6">
                                    <Package className="text-primary w-5 h-5 md:w-6 md:h-6" />
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
                                            <div key={order._id} className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-[2rem] shadow-sm border border-white/40 overflow-hidden hover:bg-white/60 transition-all group">

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
                                                <div className="p-3 md:p-6 pb-2 md:pb-3">
                                                    <div className="space-y-2 md:space-y-4">
                                                        {order.products?.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 md:gap-4">
                                                                <div className="h-10 w-10 md:h-16 md:w-16 flex-shrink-0 overflow-hidden rounded-lg md:rounded-xl border border-primary/5 bg-white p-0.5 md:p-1">
                                                                    <img
                                                                        src={item.image}
                                                                        alt={item.title}
                                                                        className="h-full w-full object-cover rounded-md md:rounded-lg"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="text-[10px] md:text-sm font-black text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                                                                    <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                                                                        <p className="text-[7px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest">Qty: {item.quantity}</p>
                                                                        <span className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-primary/20" />
                                                                        <p className="text-[9px] md:text-xs font-black text-primary">₹{item.price?.toLocaleString('en-IN')}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="border-t border-primary/5 mt-2 md:mt-4 pt-2 md:pt-4 flex justify-between items-center mb-2 md:mb-4">
                                                        <div className="hidden md:block">
                                                            <p className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-0.5">Shipping Status</p>
                                                            <p className="text-[10px] font-bold text-foreground/70 italic">Processing for sacred delivery.</p>
                                                        </div>
                                                        <div className="flex justify-between items-center w-full md:w-auto">
                                                            <p className="md:hidden text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-50">Total</p>

                                                            <div className="text-right">
                                                                <p className="md:hidden hidden text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-0.5 opacity-50">Total Payable</p>
                                                                <p className="font-serif font-black text-sm md:text-xl text-primary">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex md:justify-end pb-1 md:pb-2">
                                                        <Link
                                                            href={`/order-success/${order._id}`}
                                                            className="w-full md:w-auto px-4 py-1.5 md:py-2.5 rounded-full bg-foreground text-background text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 group/btn shadow-md active:scale-95"
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
                        )}

                        {/* 3. MY ADDRESSES TAB */}
                        {activeTab === 'addresses' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg md:text-2xl font-serif font-black text-foreground flex items-center gap-2 mb-4 md:mb-6">
                                    <MapPin className="text-primary w-5 h-5 md:w-6 md:h-6" />
                                    <span>My <span className="text-primary italic">Addresses</span></span>
                                </h2>

                                <div className="bg-transparent md:bg-white/40 backdrop-blur-none md:backdrop-blur-xl rounded-none md:rounded-[2rem] shadow-none md:shadow-sm border-none md:border md:border-white/40 p-0 md:p-6">
                                    <AddressManager mode="manage" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
