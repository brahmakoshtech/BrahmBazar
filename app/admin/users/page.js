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
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="w-48 h-10 rounded-lg bg-neutral-900 border border-white/10" />
            </div>
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg bg-neutral-900 border border-white/10" />
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Users</h1>
                    <p className="text-gray-400 mt-1">Manage platform users and administrators</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        className="w-full pl-4 pr-10 py-2 rounded-lg bg-neutral-900 border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-white placeholder-gray-600 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                </div>
            </div>

            <div className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                {user.name ? user.name[0] : 'U'}
                                            </div>
                                            <span className="text-sm font-medium text-white">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                                            <User size={12} /> User
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleViewUser(user)}
                                            className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 transition-all"
                                            title="View Details"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-neutral-900 z-10">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg">
                                    {selectedUser.name ? selectedUser.name[0] : 'U'}
                                </div>
                                {selectedUser.name}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Contact Info */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Details</h3>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 block">Email Address</label>
                                        <div className="text-white font-mono flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                            <a href={`mailto:${selectedUser.email}`} className="hover:text-primary transition-colors">{selectedUser.email}</a>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block">Member Since</label>
                                        <div className="text-white">
                                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block">User ID</label>
                                        <div className="text-gray-400 text-xs font-mono">{selectedUser._id}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Order History */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                                    Order History
                                    <span className="text-xs normal-case bg-white/10 px-2 py-0.5 rounded-full text-white">{userOrders.length} Orders</span>
                                </h3>

                                {loadingOrders ? (
                                    <div className="space-y-3">
                                        <Skeleton className="h-16 w-full bg-white/5 rounded-lg" />
                                        <Skeleton className="h-16 w-full bg-white/5 rounded-lg" />
                                    </div>
                                ) : userOrders.length > 0 ? (
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {userOrders.map(order => (
                                            <div
                                                key={order._id}
                                                onClick={() => router.push(`/admin/orders/${order._id}`)}
                                                className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-primary/50 hover:bg-white/10 transition-all flex flex-col gap-4 cursor-pointer group"
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-white font-bold">#{order._id.slice(-6).toUpperCase()}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${order.orderStatus === 'Delivered' ? 'bg-green-900/30 text-green-400 border-green-500/30' :
                                                                order.orderStatus === 'Cancelled' ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                                                                    'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
                                                                }`}>
                                                                {order.orderStatus}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-primary">₹{order.totalPrice?.toLocaleString()}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Payment: <span className={order.paymentStatus === 'Paid' ? 'text-green-400' : 'text-red-400'}>{order.paymentStatus}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Products List */}
                                                <div className="bg-black/20 rounded-lg p-3 space-y-2">
                                                    {order.products?.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-neutral-800 overflow-hidden shrink-0 border border-white/10">
                                                                {item.productId?.image ? (
                                                                    <img src={item.productId.image} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">Img</div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-gray-300 truncate">{item.productId?.title || 'Unknown Product'}</p>
                                                                <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                                                            </div>
                                                            <div className="text-xs text-gray-400 font-mono">
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
                                    <div className="text-center py-8 text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                                        No orders placed yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-neutral-900 sticky bottom-0 z-10 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div >
            )
            }
        </div >
    );
}
