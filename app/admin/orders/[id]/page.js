'use client';

import { useEffect, useState, use } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, CreditCard, Trash2, Package, Printer } from 'lucide-react';

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
        <div className="p-8 flex items-center justify-center min-h-[50vh] animate-pulse">
            <div className="flex flex-col items-center gap-4">
                <Package className="text-primary animate-bounce" size={48} />
                <div className="text-primary font-serif font-bold italic">Deciphering Scroll...</div>
            </div>
        </div>
    );
    if (error) return <div className="p-8 text-red-500 font-bold bg-red-500/10 rounded-2xl border border-red-500/20 text-center">Error: {error}</div>;
    if (!order) return <div className="p-8 text-foreground font-serif text-center">Sacred Order not found in the archives</div>;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Link href="/admin/orders" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-md text-foreground hover:bg-foreground hover:text-white transition-all shadow-md border border-primary/10">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-foreground italic">Order Scroll</h1>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-0.5">Fragment: #{order._id}</p>
                </div>
                <div className="md:ml-auto">
                    <button
                        onClick={handleDelete}
                        className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm"
                    >
                        <Trash2 size={14} /> Nullify Order
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Shipping Info */}
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-primary/10 lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center gap-3 pb-4 border-b border-primary/5">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Truck className="text-primary" size={20} />
                        </div>
                        <h2 className="text-lg font-serif font-bold text-foreground italic">Expedition Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1 block">The Recipient</label>
                                <p className="text-foreground text-base font-bold">{order.user?.name || 'Wandering Soul (Guest)'}</p>
                                <p className="text-muted-foreground font-medium text-xs italic">{order.user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1 block">Destination Sanctuary</label>
                                <div className="text-foreground/80 text-xs font-medium leading-relaxed bg-primary/5 p-3 rounded-xl border border-primary/5 italic">
                                    <p>{order.shippingAddress?.address}</p>
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                    <p>{order.shippingAddress?.country}</p>
                                    <p className="mt-1 text-primary font-bold tracking-widest">{order.shippingAddress?.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/40 border border-primary/10 space-y-6 shadow-inner">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2 block text-center">Phase Manifestation</label>
                                <div className="flex flex-col items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${order.orderStatus === 'Delivered' ? 'bg-green-500 text-white border-green-600' :
                                        order.orderStatus === 'Cancelled' ? 'bg-red-500 text-white border-red-600' :
                                            'bg-primary text-white border-primary/20'
                                        }`}>
                                        {order.orderStatus}
                                    </span>
                                    {order.orderStatus === 'Delivered' && order.deliveredAt && (
                                        <span className="text-[9px] text-muted-foreground font-bold italic tracking-widest">
                                            Arrived: {new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2 block text-center">Alter Status</label>
                                <select
                                    value={order.orderStatus}
                                    onChange={handleStatusChange}
                                    className="w-full bg-white border border-primary/10 text-foreground font-bold rounded-lg px-4 py-2 text-[10px] uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer text-center"
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
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-primary/10 space-y-6 h-fit animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3 pb-4 border-b border-primary/5">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <CreditCard className="text-primary" size={20} />
                        </div>
                        <h2 className="text-lg font-serif font-bold text-foreground italic">Offering</h2>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1 block">Transaction Ritual</label>
                        <p className="text-foreground text-base font-bold italic">{order.paymentMethod}</p>
                    </div>

                    <div className={`p-4 rounded-xl border shadow-inner ${order.paymentStatus === 'Paid'
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                        }`}>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Sacred Status</span>
                            <span className={`text-lg font-serif font-bold italic ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-500'
                                }`}>
                                {order.paymentStatus}
                            </span>
                        </div>
                        {order.paymentStatus === 'Paid' && order.paidAt && (
                            <p className="text-[9px] text-muted-foreground font-bold text-center mt-2 uppercase tracking-widest italic">
                                Aligned: {new Date(order.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        )}
                    </div>

                    {order.paymentStatus !== 'Paid' && (
                        <button
                            onClick={handlePaymentHandler}
                            className="w-full bg-primary hover:bg-foreground text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 uppercase text-[10px] tracking-widest"
                        >
                            Authorize Receipt
                        </button>
                    )}
                </div>

                {/* Order Items */}
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-primary/10 lg:col-span-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 pb-6 border-b border-primary/5 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Package className="text-primary" size={20} />
                        </div>
                        <h2 className="text-lg font-serif font-bold text-foreground italic">Relics of Acquisition</h2>
                    </div>

                    <div className="space-y-4">
                        {(!order.products || order.products.length === 0) ? (
                            <div className="py-10 text-center">
                                <p className="text-muted-foreground font-serif text-base italic tracking-widest uppercase">The Ledger is Void</p>
                            </div>
                        ) : (
                            order.products.map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/40 rounded-xl border border-primary/5 hover:border-primary/20 transition-all group gap-4">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="h-16 w-16 bg-background rounded-xl overflow-hidden border border-primary/10 shadow-md group-hover:scale-105 transition-transform duration-500 shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title || 'Product'} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-primary/30 text-[9px] font-bold uppercase tracking-widest">No Manifestation</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-serif font-bold text-foreground text-base italic group-hover:text-primary transition-colors">{item.title || 'Nameless Artifact'}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                                                {item.quantity} Unit{item.quantity > 1 ? 's' : ''} × <span className="text-primary">₹{item.price?.toLocaleString('en-IN')}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right w-full sm:w-auto">
                                        <p className="text-lg font-serif font-bold text-primary italic">
                                            ₹{(item.quantity * item.price)?.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Invoice Section */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-primary/10 lg:col-span-3 space-y-6 print:shadow-none print:border-none print:w-full">
                    <div className="flex justify-between items-start border-b border-primary/10 pb-6 print:border-black">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-foreground">INVOICE</h2>
                            <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Order #{order._id}</p>
                        </div>
                        <div className="text-right">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all print:hidden"
                            >
                                <Printer size={16} /> Print Invoice
                            </button>
                            <p className="text-sm font-bold mt-2 text-foreground/80 print:block hidden">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div>
                            <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-2">Billed To</h3>
                            <p className="font-bold text-foreground text-base">{order.user?.name || 'Guest'}</p>
                            <p className="text-muted-foreground">{order.user?.email}</p>
                            <p className="text-muted-foreground">{order.shippingAddress?.phone}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-2">Shipped To</h3>
                            <p className="text-foreground">{order.shippingAddress?.fullName}</p>
                            <p className="text-muted-foreground">{order.shippingAddress?.address}</p>
                            <p className="text-muted-foreground">
                                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                            </p>
                            <p className="text-muted-foreground">{order.shippingAddress?.country}</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-primary/5 text-xs uppercase text-muted-foreground font-bold tracking-widest">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Item</th>
                                    <th className="px-4 py-3 text-center">Qty</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                    <th className="px-4 py-3 text-right rounded-r-lg">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {order.products.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 font-medium text-foreground">{item.title}</td>
                                        <td className="px-4 py-3 text-center text-muted-foreground">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">₹{item.price?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right font-bold text-foreground">₹{(item.price * item.quantity)?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-primary/10 print:border-black">
                        <div className="w-full md:w-1/3 space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal</span>
                                <span>₹{(order.finalAmount - (order.taxAmount || 0) + (order.discountAmount || 0))?.toLocaleString()}</span>
                            </div>

                            {/* Simple Logic for now based on what we have */}
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Total</span>
                                <span className="font-bold text-foreground text-lg">₹{order.finalAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-dashed border-primary/20">
                                <span className="uppercase tracking-widest">Payment Status</span>
                                <span className={`font-bold ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-500'}`}>{order.paymentStatus}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
