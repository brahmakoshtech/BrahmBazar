'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Grid, ClipboardList, Users, TicketPercent, Image, Video, MessageSquare, Palette, Settings, LogOut, Leaf } from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Products', href: '/admin/products', icon: <Package size={20} /> },
        { name: 'Categories', href: '/admin/categories', icon: <Grid size={20} /> },
        { name: 'Orders', href: '/admin/orders', icon: <ClipboardList size={20} /> },
        { name: 'Users', href: '/admin/users', icon: <Users size={20} /> },
        { name: 'Coupons', href: '/admin/coupons', icon: <TicketPercent size={20} /> },
        { name: 'Banners', href: '/admin/banners', icon: <Image size={20} /> },
        { name: 'Remedies', href: '/admin/remedies', icon: <Leaf size={20} /> },
        { name: 'Reels Manager', href: '/admin/reels', icon: <Video size={20} /> },
        { name: 'FAQs', href: '/admin/faqs', icon: <MessageSquare size={20} /> },
        { name: 'Contacts', href: '/admin/contacts', icon: <Users size={20} /> },
        { name: 'Customize', href: '/admin/customize', icon: <Palette size={20} /> },
        { name: 'Settings', href: '/admin/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="w-64 bg-[#2D241E] border-r border-[#D69E2E]/10 min-h-screen text-[#E6DCC3] flex flex-col fixed left-0 top-0 bottom-0 z-50 shadow-2xl">
            {/* Logo Area */}
            <div className="p-6 border-b border-[#D69E2E]/10 flex items-center gap-3">
                <Link href="/" className="flex flex-col leading-none">
                    <span className="font-serif font-bold text-primary text-xl tracking-wide uppercase">
                        BRAHMAKOSH
                    </span>
                    <span className="text-[9px] text-[#E6DCC3]/50 tracking-[0.3em] font-bold uppercase mt-1">
                        Management Suite
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 space-y-1 px-3">
                {links.map((link) => {
                    if (link.submenu) {
                        const isParentActive = link.submenu.some(sub => pathname.startsWith(sub.href));
                        return (
                            <div key={link.name} className="flex flex-col gap-1 mb-1">
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isParentActive ? 'text-primary' : 'text-[#E6DCC3]/60'}`}>
                                    <span className={isParentActive ? 'text-primary' : 'text-primary/70'}>{link.icon}</span>
                                    {link.name}
                                </div>
                                <div className="pl-4 flex flex-col gap-1">
                                    {link.submenu.map(sub => {
                                        const isSubActive = pathname === sub.href;
                                        return (
                                            <Link
                                                key={sub.name}
                                                href={sub.href}
                                                className={`flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isSubActive
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : 'text-[#E6DCC3]/60 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                {sub.name}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        );
                    }
                    const isActive = pathname.startsWith(link.href);
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-[#E6DCC3]/60 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className={isActive ? 'text-white' : 'text-primary/70'}>{link.icon}</span>
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Area */}
            <div className="p-4 border-t border-[#D69E2E]/10">
                <button
                    onClick={() => {
                        localStorage.removeItem('userInfo');
                        window.location.href = '/admin';
                    }}
                    className="flex items-center gap-3 px-6 py-4 w-full rounded-xl text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
