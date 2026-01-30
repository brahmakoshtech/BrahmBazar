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

    if (loading || verifying) return <div className="min-h-screen flex items-center justify-center">Processing Payment Confirmation...</div>;

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
                <Link href="/" className="text-red-600 hover:underline">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
                <div className="bg-white rounded-2xl shadow-sm p-12 mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600" size={40} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Thank you for your purchase. Your order <span className="font-mono font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</span> has been placed.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Order Details</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Order Number</p>
                                <p className="font-medium text-gray-900">#{order._id}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Date</p>
                                <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Payment Method</p>
                                <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Total Amount</p>
                                <p className="font-medium text-red-600 text-lg">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Payment Status</p>
                                <p className={`font-medium ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {order.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/account" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition">
                            <Package className="mr-2" size={20} /> View Order
                        </Link>
                        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition shadow-lg shadow-red-100">
                            <Home className="mr-2" size={20} /> Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
