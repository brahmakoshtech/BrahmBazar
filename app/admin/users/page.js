'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Trash2, User, Shield, ShieldAlert, Check } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Skeleton from '@/components/ui/Skeleton';

export default function AdminUsers() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error: toastError } = useToast();

    // New State for Search and Modal
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/api/users');
            setUsers(data);
        } catch (err) {
            toastError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/api/users/${id}`);
            setUsers(users.filter(user => user._id !== id));
            success('User deleted successfully');
        } catch (err) {
            toastError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleViewUser = async (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
        setLoadingOrders(true);
        try {
            const { data } = await api.get(`/api/orders/user/${user._id}`);
            setUserOrders(data);
        } catch (err) {
            toastError('Failed to fetch user orders');
            setUserOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="p-8 space-y-6 animate-pulse">
            <div className="flex justify-between items-center mb-8">
                <div className="w-64 h-12 bg-white/40 rounded-full border border-primary/10" />
                <div className="w-48 h-10 bg-white/40 rounded-full border border-primary/10" />
            </div>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 w-full bg-white/40 rounded-3xl border border-primary/10 shadow-sm" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8">
            <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground italic">Community Database</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Manage your platform devotees and guardians.</p>
                </div>
                <div className="relative w-full lg:w-80 group">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-6 py-3.5 rounded-full bg-white/60 backdrop-blur-md border border-primary/10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground placeholder-gray-400 transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl shadow-primary/5 border border-primary/10 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary/5">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Profile</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Email Address</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Authority</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Joined</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-right">Access</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-primary/5 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-secondary text-white font-serif font-bold text-sm flex items-center justify-center shadow-lg shadow-secondary/20">
                                                {user.name ? user.name[0] : 'U'}
                                            </div>
                                            <span className="text-sm font-bold text-foreground">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-foreground/70 font-medium">
                                        {user.email}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-background text-muted-foreground border border-primary/10'}`}>
                                            {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                                            {user.role === 'admin' ? 'Guardian' : 'Devotee'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-muted-foreground uppercase tracking-widest italic">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '---'}
                                    </td>
                                    <td className="px-8 py-6 text-right flex justify-end gap-3">
                                        <button
                                            onClick={() => handleViewUser(user)}
                                            className="p-2.5 bg-foreground/5 rounded-full text-muted-foreground hover:text-white hover:bg-foreground transition-all shadow-sm"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="p-2.5 bg-red-50 rounded-full text-red-400 hover:text-white hover:bg-red-500 transition-all shadow-sm"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-background border border-primary/20 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col scale-in duration-300">
                        <div className="p-8 border-b border-primary/10 flex justify-between items-center bg-white/60 backdrop-blur-xl">
                            <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shadow-inner italic">
                                    {selectedUser.name ? selectedUser.name[0] : 'U'}
                                </div>
                                <div className="flex flex-col">
                                    <span>{selectedUser.name}</span>
                                    <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">{selectedUser.role} Account</span>
                                </div>
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar">
                            {/* Contact Info */}
                            <div>
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-4">Identity Matrix</h3>
                                <div className="bg-white/40 rounded-3xl p-6 border border-primary/10 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-inner">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60 block">Sacred Email</label>
                                        <div className="text-foreground font-bold flex items-center gap-2">
                                            <a href={`mailto:${selectedUser.email}`} className="hover:text-primary transition-colors truncate">{selectedUser.email}</a>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60 block">Initiation Date</label>
                                        <div className="text-foreground font-serif font-bold italic">
                                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 pt-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60 block mb-1">Entity Reference</label>
                                        <div className="text-muted-foreground text-[10px] font-mono bg-background/50 px-3 py-1 rounded-full w-fit border border-primary/5 uppercase">{selectedUser._id}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Order History */}
                            <div>
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-4 flex justify-between items-center">
                                    Journey Log
                                    <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] border border-secondary/20">{userOrders.length} Rituals</span>
                                </h3>

                                {loadingOrders ? (
                                    <div className="space-y-4">
                                        <div className="h-20 w-full bg-white/20 rounded-3xl animate-pulse" />
                                        <div className="h-20 w-full bg-white/20 rounded-3xl animate-pulse" />
                                    </div>
                                ) : userOrders.length > 0 ? (
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                        {userOrders.map(order => (
                                            <div
                                                key={order._id}
                                                onClick={() => router.push(`/admin/orders/${order._id}`)}
                                                className="bg-white/50 rounded-3xl p-6 border border-primary/5 hover:border-primary/40 hover:bg-white transition-all flex flex-col gap-6 cursor-pointer group shadow-sm hover:shadow-xl"
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-foreground font-bold font-mono text-xs">#{order._id.slice(-6).toUpperCase()}</span>
                                                            <span className={`text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border ${order.orderStatus === 'Delivered' ? 'bg-green-500 text-white border-green-600' :
                                                                order.orderStatus === 'Cancelled' ? 'bg-red-500 text-white border-red-600' :
                                                                    'bg-amber-500 text-white border-amber-600'
                                                                }`}>
                                                                {order.orderStatus}
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-serif font-bold text-primary italic">₹{order.totalAmount?.toLocaleString()}</div>
                                                        <div className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground mt-1">
                                                            Status: <span className={order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-500'}>{order.paymentStatus}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Products List */}
                                                <div className="bg-background/40 rounded-2xl p-4 space-y-3">
                                                    {order.products?.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white overflow-hidden shrink-0 border border-primary/10 shadow-sm">
                                                                {item.productId?.images?.[0] ? (
                                                                    <img src={item.productId.images[0]} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-muted-foreground uppercase opacity-40">IMG</div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-foreground truncate">{item.productId?.title || 'Unknown Product'}</p>
                                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                                                            </div>
                                                            <div className="text-xs font-bold text-primary italic">
                                                                ₹{item.price?.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                        }
                                    </div>

                                ) : (
                                    <div className="text-center py-12 text-muted-foreground font-bold uppercase tracking-widest text-[10px] bg-white/40 rounded-3xl border border-dashed border-primary/20">
                                        No rituals recorded in this lifetime.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 border-t border-primary/10 bg-white/60 backdrop-blur-xl flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-10 py-3.5 bg-foreground text-background font-bold text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-secondary hover:text-white transition-all shadow-xl active:scale-95"
                            >
                                Close Portal
                            </button>
                        </div>
                    </div>
                </div >
            )
            }
        </div >
    );
}
