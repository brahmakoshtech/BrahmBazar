'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import api from '@/services/api';

import { useSearchParams } from 'next/navigation';

function OrderSuccessContent() {
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
        <div className="min-h-screen bg-transparent py-6 md:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
                <div className="bg-white/60 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-2xl p-5 md:p-12 mb-6 md:mb-8 border border-primary/10">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-6 border border-primary/20">
                        <CheckCircle className="text-secondary w-7 h-7 md:w-10 md:h-10" />
                    </div>
                    <h1 className="text-xl md:text-4xl font-serif font-bold text-foreground mb-1 md:mb-2">Order Confirmed!</h1>
                    <p className="text-xs md:text-base text-muted-foreground mb-5 md:mb-10 px-2 md:px-4">
                        Thank you for your purchase. Your order <span className="font-mono font-bold text-foreground">#{order._id.slice(-6).toUpperCase()}</span> has been placed.
                    </p>

                    <div className="bg-white/40 rounded-xl md:rounded-2xl p-4 md:p-8 mb-5 md:mb-10 text-left border border-primary/5">
                        <h2 className="text-[10px] md:text-sm font-bold text-secondary uppercase tracking-[0.2em] mb-3 md:mb-6 border-b border-primary/10 pb-1.5 md:pb-2">Order Summary</h2>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-3 md:gap-8">
                            <div className="col-span-2 md:col-span-1">
                                <p className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5 md:mb-1">Order ID</p>
                                <p className="font-bold text-[9px] md:text-sm text-foreground break-all leading-tight">#{order._id}</p>
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5 md:mb-1">Placed On</p>
                                <p className="font-bold text-[10px] md:text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5 md:mb-1">Payment via</p>
                                <p className="font-bold text-[10px] md:text-sm text-foreground">{order.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5 md:mb-1">Amount Paid</p>
                                <p className="font-bold text-primary text-base md:text-xl italic">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5 md:mb-1">Status</p>
                                <div className="flex items-center gap-1 md:gap-2">
                                    <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                    <p className={`font-bold text-[9px] md:text-sm uppercase tracking-widest ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {order.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 md:gap-4 justify-center">
                        <Link href="/account" className="inline-flex items-center justify-center px-6 py-2.5 md:px-8 md:py-4 border border-primary/20 text-[10px] md:text-sm font-bold uppercase tracking-widest rounded-full text-foreground bg-white/50 hover:bg-white transition shadow-sm">
                            <Package className="mr-1.5 w-3.5 h-3.5 md:w-5 md:h-5" /> My Orders
                        </Link>
                        <Link href="/" className="inline-flex items-center justify-center px-6 py-2.5 md:px-8 md:py-4 border border-transparent text-[10px] md:text-sm font-bold uppercase tracking-widest rounded-full text-white bg-foreground hover:bg-secondary transition shadow-xl">
                            <Home className="mr-1.5 w-3.5 h-3.5 md:w-5 md:h-5" /> Shop More
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}
