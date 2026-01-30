'use client';

import { useEffect, useState, use } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, CreditCard, Trash2, Package } from 'lucide-react';

export default function OrderDetailsPage({ params }) {
    const { id } = use(params);
    const router = useRouter();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/api/admin/orders/${id}`);
            setOrder(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const handleDeliverHandler = async () => {
        try {
            await api.put(`/api/admin/orders/${order._id}/status`, {
                orderStatus: 'Delivered',
            });
            fetchOrder();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handlePaymentHandler = async () => {
        try {
            await api.put(`/api/admin/orders/${order._id}/payment`, {
                paymentStatus: 'Paid',
            });
            fetchOrder();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update payment');
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            await api.put(`/api/admin/orders/${order._id}/status`, {
                orderStatus: newStatus,
            });
            fetchOrder();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete/cancel this order?')) {
            try {
                await api.delete(`/api/admin/orders/${order._id}`);
                router.push('/admin/orders');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete order');
            }
        }
    };

    if (loading) return (
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
            <div className="text-gray-400 animate-pulse">Loading order details...</div>
        </div>
    );
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
    if (!order) return <div className="p-6 text-white">Order not found</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders" className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-white tracking-wide">Order Details</h1>
                    <p className="text-gray-400 text-sm font-mono mt-1">ID: #{order._id}</p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={handleDelete}
                        className="bg-red-900/20 text-red-400 border border-red-900/50 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-900/40 transition-colors text-sm font-medium"
                    >
                        <Trash2 size={16} /> Cancel/Delete Order
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Shipping Info */}
                <div className="bg-neutral-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <Truck className="text-primary" size={24} />
                        <h2 className="text-lg font-bold text-white">Shipping Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Customer</label>
                                <p className="text-white text-base font-medium mt-1">{order.user?.name || 'Guest'}</p>
                                <p className="text-gray-400 text-sm">{order.user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Shipping Address</label>
                                <div className="text-gray-300 mt-1 leading-relaxed">
                                    <p>{order.shippingAddress?.address}</p>
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                    <p>{order.shippingAddress?.country}</p>
                                    <p className="mt-1 text-primary text-sm font-mono">{order.shippingAddress?.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-xl bg-black/20 border border-white/5 space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 block">Current Status</label>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${order.orderStatus === 'Delivered' ? 'bg-green-900/30 text-green-400 border-green-500/30' :
                                        order.orderStatus === 'Cancelled' ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                                            'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
                                        }`}>
                                        {order.orderStatus}
                                    </span>
                                    {order.orderStatus === 'Delivered' && order.deliveredAt && (
                                        <span className="text-xs text-gray-500">
                                            on {new Date(order.deliveredAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 block">Update Status</label>
                                <select
                                    value={order.orderStatus}
                                    onChange={handleStatusChange}
                                    className="w-full bg-neutral-800 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                                >
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="bg-neutral-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 space-y-6 h-fit">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <CreditCard className="text-primary" size={24} />
                        <h2 className="text-lg font-bold text-white">Payment</h2>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Method</label>
                        <p className="text-white text-base font-medium mt-1">{order.paymentMethod}</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${order.paymentStatus === 'Paid'
                        ? 'bg-green-900/20 border-green-500/30'
                        : 'bg-red-900/20 border-red-500/30'
                        }`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                            <span className={`font-bold uppercase ${order.paymentStatus === 'Paid' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {order.paymentStatus}
                            </span>
                        </div>
                        {order.paymentStatus === 'Paid' && order.paidAt && (
                            <p className="text-xs text-gray-500 mt-1">
                                Paid on {new Date(order.paidAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    {order.paymentStatus !== 'Paid' && (
                        <button
                            onClick={handlePaymentHandler}
                            className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-primary/20"
                        >
                            Mark As Paid
                        </button>
                    )}
                </div>

                {/* Order Items */}
                <div className="bg-neutral-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 lg:col-span-3">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-4">
                        <Package className="text-primary" size={24} />
                        <h2 className="text-lg font-bold text-white">Order Items</h2>
                    </div>

                    <div className="space-y-4">
                        {(!order.products || order.products.length === 0) ? (
                            <p className="text-gray-500 text-center py-8">Order is empty</p>
                        ) : (
                            order.products.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-neutral-800 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title || 'Product'} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-600 text-xs">No Img</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-base mb-1">{item.title || 'Unknown Product'}</p>
                                            <p className="text-sm text-gray-400 font-mono">
                                                {item.quantity} x ₹{item.price?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary text-lg">
                                            ₹{(item.quantity * item.price)?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
