'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import { Settings, User, Bell, Shield } from 'lucide-react';
import api from '@/services/api';

export default function AdminSettings() {
    const { success, error } = useToast();
    const [activeTab, setActiveTab] = useState('general');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [adminUser, setAdminUser] = useState(null);

    // Fetch Settings on Mount
    useEffect(() => {
        if (activeTab === 'general') {
            const fetchSettings = async () => {
                try {
                    const { data } = await api.get('/api/contact/settings');
                    setEmail(data.receiverEmail);
                } catch (err) {
                    console.error("Failed to fetch settings", err);
                    // error("Failed to load settings"); // Optional: don't annoy user on load
                }
            };
            fetchSettings();
        }
    }, [activeTab]);

    // Fetch Admin User from LocalStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                setAdminUser(JSON.parse(userInfo));
            }
        }
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put('/api/contact/settings', { receiverEmail: email });
            success('Configuration sealed successfully');
        } catch (err) {
            console.error("Failed to save settings", err);
            error(err.response?.data?.message || 'Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-10 tracking-wide uppercase italic">Sacred Configurations</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="space-y-2">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${activeTab === 'general' ? 'bg-primary text-white border-transparent shadow-xl shadow-primary/20 scale-105' : 'text-muted-foreground bg-white/40 border-primary/10 hover:bg-white hover:text-foreground'}`}
                    >
                        <Settings size={18} /> General
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.3em] transition-all border ${activeTab === 'profile' ? 'bg-primary text-white border-transparent shadow-xl shadow-primary/20 scale-105' : 'text-muted-foreground bg-white/40 border-primary/10 hover:bg-white hover:text-foreground'}`}
                    >
                        <User size={18} /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.3em] transition-all border ${activeTab === 'security' ? 'bg-primary text-white border-transparent shadow-xl shadow-primary/20 scale-105' : 'text-muted-foreground bg-white/40 border-primary/10 hover:bg-white hover:text-foreground'}`}
                    >
                        <Shield size={18} /> Security
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.3em] transition-all border ${activeTab === 'notifications' ? 'bg-primary text-white border-transparent shadow-xl shadow-primary/20 scale-105' : 'text-muted-foreground bg-white/40 border-primary/10 hover:bg-white hover:text-foreground'}`}
                    >
                        <Bell size={18} /> Alerts
                    </button>
                </div>

                {/* Content */}
                <div className="md:col-span-3 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-primary/10 p-10 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                    {activeTab === 'general' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-foreground italic mb-2">General Governance</h2>
                                <p className="text-muted-foreground text-sm font-medium">Define the primal identifiers of your shop.</p>
                            </div>
                            <div className="space-y-6 pt-6 border-t border-primary/10">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Establishment Name</label>
                                    <input type="text" readOnly defaultValue="BRAHMAKOSH" className="w-full bg-white/50 border border-primary/10 rounded-2xl px-6 py-4 text-foreground font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-inner opacity-60 cursor-not-allowed" title="Contact developer to change" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Receiver Email for Contact Requests</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email to receive contact forms..."
                                        className="w-full bg-white/50 border border-primary/10 rounded-2xl px-6 py-4 text-foreground font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-inner"
                                    />
                                    <p className="text-[10px] text-muted-foreground pl-2">* All new contact form submissions will be sent here.</p>
                                </div>
                                <div className="pt-4">
                                    <Button
                                        onClick={handleSave}
                                        loading={loading}
                                        variant="primary"
                                        className="bg-primary text-white font-bold px-10 py-4 rounded-full shadow-xl shadow-primary/20 uppercase text-[10px] tracking-widest border-none hover:bg-primary/90"
                                    >
                                        Seal Changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="text-center py-20 animate-in fade-in zoom-in-95">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <User size={32} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-foreground">Identity Shrine</h3>
                            {adminUser ? (
                                <div className="mt-6 space-y-2">
                                    <div className="inline-block px-6 py-2 bg-primary/5 rounded-full border border-primary/10">
                                        <p className="text-lg font-bold text-foreground tracking-wide">{adminUser.name || 'Admin User'}</p>
                                    </div>
                                    <p className="text-muted-foreground font-medium text-sm">{adminUser.email}</p>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] pt-2">
                                        {adminUser.role === 'admin' ? 'Head Priest' : adminUser.role}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground mt-2 font-medium">Personal manifestations coming in next cycle.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'security' && (
                        <div className="text-center py-20 animate-in fade-in zoom-in-95">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield size={32} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-foreground">Aegis Protection</h3>
                            <p className="text-muted-foreground mt-2 font-medium">Security rituals being prepared by the scribes.</p>
                        </div>
                    )}
                    {activeTab === 'notifications' && (
                        <div className="text-center py-20 animate-in fade-in zoom-in-95">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell size={32} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-foreground">Oracle Whispers</h3>
                            <p className="text-muted-foreground mt-2 font-medium">Alert configurations are currently under meditation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
