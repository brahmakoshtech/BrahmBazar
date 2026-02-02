'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Mail, Phone, Calendar, Search, RefreshCw, MessageSquare } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminContacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { error, success } = useToast();

    // Fetch contacts
    const fetchContacts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/contact');
            setContacts(data);
        } catch (err) {
            console.error("Failed to fetch contacts", err);
            error('Failed to load contact requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // Filter contacts based on search
    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground tracking-wide uppercase italic flex items-center gap-3">
                        <MessageSquare className="text-primary" /> Contact Requests
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-2">
                        View and manage inquiries from your visitors.
                    </p>
                </div>

                <button
                    onClick={fetchContacts}
                    className="p-3 bg-white/50 hover:bg-white text-primary rounded-full transition-all shadow-sm border border-primary/10"
                    title="Refresh List"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Search & Stats */}
            <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border border-primary/10 shadow-xl mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search by name, email or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-xl bg-white/60 border border-primary/10 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-foreground placeholder:text-muted-foreground/70 transition-all shadow-inner"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50" size={18} />
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-primary/10 rounded-xl border border-primary/10">
                        <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Messages</span>
                        <span className="text-2xl font-serif font-bold text-primary">{contacts.length}</span>
                    </div>
                </div>
            </div>

            {/* Contact List */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-bold animate-pulse">Summoning messages...</p>
                </div>
            ) : filteredContacts.length === 0 ? (
                <div className="text-center py-20 bg-white/20 rounded-[2.5rem] border border-dashed border-primary/20">
                    <Mail size={48} className="text-primary/30 mx-auto mb-4" />
                    <h3 className="text-xl font-serif font-bold text-muted-foreground">No Messages Found</h3>
                    <p className="text-sm text-muted-foreground/70 mt-2">Your inbox awaits new inquiries.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredContacts.map((contact) => (
                        <div
                            key={contact._id}
                            className="group bg-white/60 hover:bg-white backdrop-blur-sm p-6 md:p-8 rounded-[2rem] border border-primary/10 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-all duration-300"></div>

                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0 text-primary font-serif font-bold text-xl">
                                        {contact.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">{contact.name}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs font-medium text-muted-foreground">
                                            <span className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-md border border-primary/5">
                                                <Mail size={12} className="text-primary" /> {contact.email}
                                            </span>
                                            {contact.phone && (
                                                <span className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-md border border-primary/5">
                                                    <Phone size={12} className="text-primary" /> {contact.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-start bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                                    <Calendar size={12} className="text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80">
                                        {new Date(contact.createdAt).toLocaleDateString('en-US', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white/40 p-5 rounded-2xl border border-primary/5">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-2 opacity-70">Subject: {contact.subject || 'No Subject'}</h4>
                                <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-line">
                                    {contact.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
