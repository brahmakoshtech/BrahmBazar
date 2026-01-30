'use client';

import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import { Settings, User, Bell, Shield } from 'lucide-react';

export default function AdminSettings() {
    const { success } = useToast();
    const [activeTab, setActiveTab] = useState('general');

    const handleSave = () => {
        // Placeholder save
        setTimeout(() => success('Settings saved locally (Demo)'), 500);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-white tracking-wide mb-8">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="space-y-1">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-primary text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Settings size={18} /> General
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-primary text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <User size={18} /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-primary text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Shield size={18} /> Security
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'notifications' ? 'bg-primary text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Bell size={18} /> Notifications
                    </button>
                </div>

                {/* Content */}
                <div className="md:col-span-3 bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-white/5 p-8">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-6">General Settings</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Store Name</label>
                                <input type="text" defaultValue="Rudra Divine" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Support Email</label>
                                <input type="email" defaultValue="support@rudradivine.com" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none" />
                            </div>
                            <Button onClick={handleSave} className="bg-primary text-black font-bold hover:bg-white">Save Changes</Button>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="text-center py-12 text-gray-400">
                            <p>Profile settings coming soon.</p>
                        </div>
                    )}
                    {activeTab === 'security' && (
                        <div className="text-center py-12 text-gray-400">
                            <p>Security settings coming soon.</p>
                        </div>
                    )}
                    {activeTab === 'notifications' && (
                        <div className="text-center py-12 text-gray-400">
                            <p>Notification settings coming soon.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
