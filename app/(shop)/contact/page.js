'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/services/api';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await api.post('/api/contact', formData);
            setStatus({ type: 'success', message: 'Your message has been sent successfully. We will get back to you soon.' });
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-10 pb-20">
            {/* Background Effects (Subtle for Light Theme) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] opacity-60" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] opacity-60" />
            </div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="text-secondary font-bold tracking-[0.3em] uppercase text-xs mb-3 block">
                        Get in Touch
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
                        Contact <span className="text-primary italic">Us</span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                        Have a question about our spiritual products or services? We're here to help you on your journey.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-10"
                    >
                        <div className="bg-white/60 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] space-y-8 shadow-xl shadow-[#D69E2E]/5">
                            <h3 className="text-2xl font-serif font-bold text-foreground mb-6">Contact Information</h3>

                            <div className="flex items-start gap-5 group">
                                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors text-primary shadow-sm">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-bold mb-1">Our Location</h4>
                                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                        123 Spiritual Avenue, Temple Road,<br />
                                        Varanasi, Uttar Pradesh, 221001, India
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 group">
                                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors text-primary shadow-sm">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-bold mb-1">Phone Number</h4>
                                    <p className="text-muted-foreground text-sm font-medium">
                                        +91 99999 XXXXX
                                    </p>
                                    <span className="text-[10px] text-secondary/80 font-bold uppercase tracking-wider mt-1 block">Mon-Sat, 9am - 6pm</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 group">
                                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors text-primary shadow-sm">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-bold mb-1">Email Address</h4>
                                    <p className="text-muted-foreground text-sm font-medium">
                                        support@brahmakosh.com
                                    </p>
                                    <span className="text-[10px] text-secondary/80 font-bold uppercase tracking-wider mt-1 block">We reply within 24 hours</span>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="relative h-64 rounded-[2rem] overflow-hidden border border-white/20 shadow-lg group bg-white/40">
                            <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                <span className="text-muted-foreground font-serif italic text-lg">Map View Coming Soon</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl border border-white/40 p-8 md:p-10 rounded-[2.5rem] space-y-6 shadow-2xl shadow-[#D69E2E]/10">
                            <h3 className="text-2xl font-serif font-bold text-foreground mb-2">Send a Message</h3>

                            {/* Status Messages */}
                            {status.message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl flex items-start gap-3 border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                >
                                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    <p className="text-sm font-bold">{status.message}</p>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] pl-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white border border-[#DCC8B0] rounded-xl px-4 py-3.5 text-foreground font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/50 shadow-sm"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] pl-1">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-[#DCC8B0] rounded-xl px-4 py-3.5 text-foreground font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/50 shadow-sm"
                                        placeholder="+91..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] pl-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-[#DCC8B0] rounded-xl px-4 py-3.5 text-foreground font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/50 shadow-sm"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] pl-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-[#DCC8B0] rounded-xl px-4 py-3.5 text-foreground font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/50 shadow-sm"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] pl-1">Message</label>
                                <textarea
                                    rows={5}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-[#DCC8B0] rounded-xl px-4 py-3.5 text-foreground font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/50 resize-none shadow-sm"
                                    placeholder="Write your message here..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-white font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[#B58324] transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    'Sending...'
                                ) : (
                                    <>
                                        Send Message <Send size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
