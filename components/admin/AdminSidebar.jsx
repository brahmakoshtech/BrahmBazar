'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Users, Settings, LogOut, Grid, Image, Ticket, Edit3 } from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Products', href: '/admin/products', icon: <Package size={20} /> },
        { name: 'Categories', href: '/admin/categories', icon: <Grid size={20} /> },
        { name: 'Orders', href: '/admin/orders', icon: <ShoppingBag size={20} /> },
        { name: 'Users', href: '/admin/users', icon: <Users size={20} /> },
        { name: 'Banners', href: '/admin/banners', icon: <Image size={20} /> },
        { name: 'Coupons', href: '/admin/coupons', icon: <Ticket size={20} /> },
        { name: 'Customize Site', href: '/admin/customize', icon: <Edit3 size={20} /> },
        { name: 'Settings', href: '/admin/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="w-64 bg-black border-r border-white/10 min-h-screen text-white flex flex-col fixed left-0 top-0 bottom-0 z-50 shadow-2xl">
            {/* Logo Area */}
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]">🕉️</span>
                <Link href="/" className="flex flex-col leading-none">
                    <span className="font-serif font-bold text-white text-lg tracking-wide uppercase">
                        Rudra<span className="text-primary">Divine</span>
                    </span>
                    <span className="text-[10px] text-gray-400 tracking-[0.2em] font-medium uppercase mt-1">
                        Admin Panel
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 space-y-1 px-3">
                {links.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                }`}
                        >
                            {link.icon}
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Area */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={() => {
                        localStorage.removeItem('userInfo');
                        window.location.href = '/admin';
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-red-900/20 hover:text-red-400 hover:border hover:border-red-900/30 transition-all border border-transparent"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
