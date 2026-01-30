'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Smartphone, MapPin, CreditCard } from 'lucide-react';
import { useContent } from '@/hooks/useContent';

export default function Footer() {
    const { getContent, loading } = useContent('footer');

    return (
        <footer className="bg-foreground text-[#E6DCC3]/80 mt-auto border-t border-[#E6DCC3]/10 font-sans relative z-10 transition-colors duration-500">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* Column 1: Brand Info */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <div className="flex flex-col">
                                <span className="text-2xl font-serif font-bold text-primary tracking-wide">
                                    {!loading && getContent('footer_logo_text', 'BRAHMAKOSH')}
                                </span>
                                <span className="text-[0.65rem] tracking-[0.3em] text-[#E6DCC3] uppercase">
                                    {!loading && getContent('footer_subtitle', 'Spiritual Store')}
                                </span>
                            </div>
                        </Link>
                        <p className="text-[#E6DCC3]/70 text-sm leading-relaxed max-w-xs">
                            {!loading && getContent('footer_about', 'Your trusted companion on the path to spiritual awakening. Authenticity, purity, and devotion in every offering.')}
                        </p>
                        <div className="flex items-center gap-4">
                            <a href={!loading ? getContent('social_facebook', '#') : '#'} className="w-10 h-10 rounded-full bg-[#E6DCC3]/10 flex items-center justify-center hover:bg-primary hover:text-foreground transition-all duration-300">
                                <Facebook size={18} />
                            </a>
                            <a href={!loading ? getContent('social_instagram', '#') : '#'} className="w-10 h-10 rounded-full bg-[#E6DCC3]/10 flex items-center justify-center hover:bg-primary hover:text-foreground transition-all duration-300">
                                <Instagram size={18} />
                            </a>
                            <a href={!loading ? getContent('social_twitter', '#') : '#'} className="w-10 h-10 rounded-full bg-[#E6DCC3]/10 flex items-center justify-center hover:bg-primary hover:text-foreground transition-all duration-300">
                                <Twitter size={18} />
                            </a>
                            <a href={!loading ? getContent('social_linkedin', '#') : '#'} className="w-10 h-10 rounded-full bg-[#E6DCC3]/10 flex items-center justify-center hover:bg-primary hover:text-foreground transition-all duration-300">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Shopping */}
                    <div>
                        <h3 className="text-white font-serif font-medium text-lg mb-6">Sacred Tools</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/category/rudraksha" className="hover:text-primary transition-colors">Rudraksha Beads</Link></li>
                            <li><Link href="/category/gemstones" className="hover:text-primary transition-colors">Healing Gemstones</Link></li>
                            <li><Link href="/category/yantra" className="hover:text-primary transition-colors">Powerful Yantras</Link></li>
                            <li><Link href="/category/parad" className="hover:text-primary transition-colors">Parad Collection</Link></li>
                            <li><Link href="/category/sphatik" className="hover:text-primary transition-colors">Sphatik Malas</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Customer Care */}
                    <div>
                        <h3 className="text-white font-serif font-medium text-lg mb-6">Support & Care</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-primary transition-colors">Energization Process</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Authenticity Promise</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Shipping & Returns</a></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                            <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact & Newsletter */}
                    <div>
                        <h3 className="text-white font-serif font-medium text-lg mb-6">Continue Your Journey</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3 text-sm text-[#E6DCC3]/70">
                                <MapPin size={18} className="mt-0.5 text-primary flex-shrink-0" />
                                <span>{!loading && getContent('contact_address', 'Varanasi, India')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[#E6DCC3]/70">
                                <Smartphone size={18} className="text-primary flex-shrink-0" />
                                <span>{!loading && getContent('contact_phone', '+91 99999 99999')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[#E6DCC3]/70">
                                <Mail size={18} className="text-primary flex-shrink-0" />
                                <span>{!loading && getContent('contact_email', 'support@rudradivine.com')}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-black/20 py-8 border-t border-[#E6DCC3]/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-[#E6DCC3]/50 text-center md:text-left">
                        {/* Dynamic Copyright */}
                        {!loading && getContent('footer_copyright', '© 2026 Brahmakosh. With Blessings.')}
                    </p>
                    <div className="flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity duration-300">
                        {/* Simple text or icons for payment methods can go here if needed, keeping it minimal */}
                        <span className="text-xs uppercase tracking-widest text-[#E6DCC3]">Secure Payments</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
