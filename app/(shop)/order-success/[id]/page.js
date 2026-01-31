'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import api from '@/services/api';

import { useSearchParams } from 'next/navigation';

export default function OrderSuccessPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        const verifyAndFetchOrder = async () => {
            try {
                // If session_id is present, verify payment first
                if (sessionId) {
                    setVerifying(true);
                    try {
                        await api.post('/api/payment/verify', { orderId: id, sessionId });
                        // Remove query param to clean URL (optional, but good UX)
                        // router.replace(`/order-success/${id}`, undefined, { shallow: true }); 
                    } catch (err) {
                        console.error("Payment verification failed", err);
                    } finally {
                        setVerifying(false); // Stop verifying loading state
                    }
                }

                // Fetch latest order details (it should be updated now)
                const { data } = await api.get(`/api/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error('Failed to fetch order:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            verifyAndFetchOrder();
        }
    }, [id, sessionId]);

    if (loading || verifying) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-secondary font-bold tracking-[0.2em] uppercase text-xs">Confirming your sacred order...</p>
            </div>
        </div>
    );

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Order not found</h1>
                <Link href="/" className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
                <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-primary/10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                        <CheckCircle className="text-secondary" size={40} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Order Confirmed!</h1>
                    <p className="text-base text-muted-foreground mb-10">
                        Thank you for your purchase. Your order <span className="font-mono font-bold text-foreground">#{order._id.slice(-6).toUpperCase()}</span> has been placed with devotion.
                    </p>

                    <div className="bg-white/40 rounded-2xl p-6 md:p-8 mb-10 text-left border border-primary/5">
                        <h2 className="text-sm font-bold text-secondary uppercase tracking-[0.2em] mb-6 border-b border-primary/10 pb-2">Order Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Order ID</p>
                                <p className="font-bold text-xs md:text-sm text-foreground break-all">#{order._id}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Placed On</p>
                                <p className="font-bold text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Payment via</p>
                                <p className="font-bold text-sm text-foreground">{order.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Amount Paid</p>
                                <p className="font-bold text-primary text-xl italic">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Status</p>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                    <p className={`font-bold text-sm uppercase tracking-widest ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {order.paymentStatus === 'Paid' ? 'Paid' : 'Pending Confirmation'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/account" className="inline-flex items-center justify-center px-8 py-4 border border-primary/20 text-sm font-bold uppercase tracking-widest rounded-full text-foreground bg-white/50 hover:bg-white transition shadow-sm">
                            <Package className="mr-2" size={18} /> My Orders
                        </Link>
                        <Link href="/" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-sm font-bold uppercase tracking-widest rounded-full text-white bg-foreground hover:bg-secondary transition shadow-xl">
                            <Home className="mr-2" size={18} /> Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
