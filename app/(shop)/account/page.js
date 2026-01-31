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
        <div className="min-h-screen bg-transparent py-10 md:py-16 px-4 md:px-8 font-sans text-foreground selection:bg-primary/20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-12 gap-6 border-b border-primary/10 pb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">My Account</h1>
                        <p className="text-muted-foreground text-sm mt-2 font-medium">Manage your profile and view your journey with us.</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 text-muted-foreground hover:text-white transition-all px-6 py-3 rounded-full hover:bg-secondary border border-primary/10 bg-white/50 w-fit"
                    >
                        <LogOut size={18} />
                        <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-primary/10 p-8 sticky top-24">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="bg-primary/10 p-5 rounded-full mb-4 border border-primary/20">
                                    <User size={40} className="text-secondary" />
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-foreground">{user.name}</h2>
                                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-2">{user.email}</p>
                            </div>

                            <div className="border-t border-primary/10 pt-8 space-y-6">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-1">Devotee Since</p>
                                    <p className="text-foreground font-bold">{new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-1">Account Status</p>
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-secondary text-white shadow-sm shadow-secondary/20">
                                        Verified Member
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-3">
                            <Package className="text-secondary" />
                            <span>Order History</span>
                        </h2>

                        {orders.length === 0 ? (
                            <div className="bg-white/40 rounded-3xl border border-primary/5 border-dashed p-16 text-center shadow-inner">
                                <div className="flex justify-center mb-6 opacity-20">
                                    <Package size={64} className="text-foreground" />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-foreground mb-3">No orders yet</h3>
                                <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium">Your journey awaits. Explore our collection and find something beautiful.</p>
                                <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-primary/10 hover:opacity-90 transition-all">
                                    Start Exploring
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {orders.map(order => (
                                    <div key={order._id} className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-primary/10 overflow-hidden hover:bg-white transition-all group">

                                        {/* Order Header */}
                                        <div className="bg-primary/5 px-6 md:px-8 py-5 flex flex-wrap justify-between items-center gap-6 border-b border-primary/10">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Order ID</p>
                                                <p className="font-mono text-xs md:text-sm text-foreground font-bold">{order._id}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Placed On</p>
                                                <p className="text-sm text-foreground font-bold">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${order.paymentStatus === 'Paid'
                                                    ? 'bg-green-500 text-white border-green-600'
                                                    : 'bg-amber-500 text-white border-amber-600'
                                                    }`}>
                                                    {order.paymentStatus}
                                                </span>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${order.orderStatus === 'Delivered'
                                                    ? 'bg-secondary text-white border-secondary-dark'
                                                    : 'bg-blue-600 text-white border-blue-700'
                                                    }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Content */}
                                        <div className="p-6 md:p-8">
                                            <div className="space-y-8">
                                                {order.products?.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-6">
                                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-primary/5 bg-background shadow-inner">
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-base font-bold text-foreground leading-tight">{item.title}</h3>
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Qty: {item.quantity}</p>
                                                                <span className="w-1 h-1 rounded-full bg-primary/20" />
                                                                <p className="font-bold text-primary italic">₹{item.price?.toLocaleString('en-IN')}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t border-primary/10 mt-8 pt-6 flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-1">Status Summary</p>
                                                    <p className="text-sm font-bold text-foreground">Awaiting shipment via trusted spiritual carriers.</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-1">Net Payable</p>
                                                    <p className="font-serif font-bold text-2xl text-primary italic">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex justify-end">
                                                <Link
                                                    href={`/order-success/${order._id}`}
                                                    className="px-6 py-3 rounded-full bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-secondary hover:text-white transition-all flex items-center gap-2 group"
                                                >
                                                    Track & Details
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
