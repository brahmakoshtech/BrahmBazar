'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Trash, Edit, CheckCircle, XCircle, UserPlus, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // For edit/create
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        isActive: true
    });
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/api/users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
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
            setUsers(users.filter(u => u._id !== id));
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Leave empty to keep unchanged
            role: user.role,
            isActive: user.isActive !== undefined ? user.isActive : true
        });
        setModalOpen(true);
        setError('');
    };

    const handleCreate = () => {
        setCurrentUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user',
            isActive: true
        });
        setModalOpen(true);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (currentUser) {
                // UPDATE
                await api.put(`/api/users/${currentUser._id}`, formData);
                alert('User updated successfully');
            } else {
                // CREATE (Using register endpoint for simplicity, or we could add admin create route)
                // Assuming /api/users/register works for public registration. 
                // Admin creation might need standard register but we can use the same route or a dedicated one.
                // Let's use register route but we need to update role/active after creation because public register defaults to 'user'/'active'.
                // Or better: Use the register call then Update immediately if role !== user. 
                // Actually, let's just make a new adminCreateUser controller later if needed.
                // For now, I'll use register endpoint then update.
                const { data: newUser } = await api.post('/api/users/register', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });

                // If role/active needs customized:
                if (formData.role !== 'user' || formData.isActive === false) {
                    await api.put(`/api/users/${newUser._id}`, {
                        role: formData.role,
                        isActive: formData.isActive
                    });
                }
                alert('User created successfully');
            }
            setModalOpen(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    if (loading) return <div className="p-10 text-center text-white">Loading users...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-mono p-6">
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold text-green-400">User Management_</h1>
                <div className="flex gap-4">
                    <Link href="/developer/dashboard" className="text-gray-400 hover:text-white mt-2">
                        &larr; Back to Dashboard
                    </Link>
                    <button
                        onClick={handleCreate}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        <UserPlus size={18} /> Add User
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-4 border-b border-gray-600">ID</th>
                            <th className="p-4 border-b border-gray-600">Name</th>
                            <th className="p-4 border-b border-gray-600">Email</th>
                            <th className="p-4 border-b border-gray-600">Role</th>
                            <th className="p-4 border-b border-gray-600">Status</th>
                            <th className="p-4 border-b border-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-gray-750 border-b border-gray-700">
                                <td className="p-4 text-xs text-gray-500 font-mono">{user._id}</td>
                                <td className="p-4 font-semibold">{user.name}</td>
                                <td className="p-4 text-gray-400 text-sm">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-900 text-purple-300' :
                                            user.role === 'developer' ? 'bg-green-900 text-green-300' :
                                                'bg-blue-900 text-blue-300'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {user.isActive ? (
                                        <span className="flex items-center gap-1 text-green-400 text-xs">
                                            <CheckCircle size={14} /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-500 text-xs">
                                            <XCircle size={14} /> Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 flex gap-3">
                                    <button onClick={() => handleEdit(user)} className="text-blue-400 hover:text-blue-300">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-red-400">
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {currentUser ? 'Edit User' : 'Create User'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {error && <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-green-500 focus:outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-green-500 focus:outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            {!currentUser && (
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-green-500 focus:outline-none"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Role</label>
                                    <select
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-green-500 focus:outline-none"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="developer">Developer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Status</label>
                                    <select
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-green-500 focus:outline-none"
                                        value={formData.isActive.toString()}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded mt-4 flex justify-center items-center gap-2">
                                <Save size={18} /> Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
