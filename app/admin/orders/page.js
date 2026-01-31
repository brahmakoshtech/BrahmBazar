'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/api/admin/orders');
            setOrders(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) return (
        <div className="p-8 space-y-4 animate-pulse">
            <div className="w-64 h-12 bg-white/40 rounded-full border border-primary/10 mb-8" />
            <div className="h-96 w-full bg-white/40 rounded-3xl border border-primary/10 shadow-sm" />
        </div>
    );
    if (error) return (
        <div className="p-8">
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-red-600 font-bold uppercase tracking-widest text-xs">
                {error}
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8">
            <div className="mb-10">
                <h1 className="text-3xl font-serif font-bold text-foreground">Order Management</h1>
                <p className="text-muted-foreground mt-2 font-medium">Oversee the fulfillment of sacred requests.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl shadow-primary/5 border border-primary/10 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary/5">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Reference</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">User</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Value</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Payment</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Dispatch</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-right">Review</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-primary/5 transition-all group">
                                    <td className="px-8 py-6">
                                        <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-foreground font-bold">
                                        {order.user?.name || 'Guest'}
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </td>
                                    <td className="px-8 py-6 text-base font-bold text-primary italic">
                                        ₹{order.totalAmount.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${order.paymentStatus === 'Paid' ? 'bg-green-500 text-white border-green-600' : 'bg-red-500 text-white border-red-600'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${order.orderStatus === 'Delivered' ? 'bg-green-500 text-white border-green-600' : 'bg-amber-500 text-white border-amber-600'}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Link href={`/admin/orders/${order._id}`} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-md active:scale-95">
                                            <Eye size={14} /> Review
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                        Database empty. No orders recorded.
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
