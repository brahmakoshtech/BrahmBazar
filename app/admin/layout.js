'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const isLoginPage = pathname === '/admin';

    useEffect(() => {
        if (isLoginPage) {
            setAuthorized(true);
            return;
        }

        const checkAuth = () => {
            const userInfo = localStorage.getItem('userInfo');

            if (!userInfo) {
                router.push('/admin');
                return;
            }

            try {
                const user = JSON.parse(userInfo);
                if (user.role !== 'admin') {
                    // If logged in but not admin, maybe redirect to home or show error?
                    // For now, redirecting to admin login as per request implies "force admin login"
                    router.push('/admin');
                } else {
                    setAuthorized(true);
                }
            } catch (error) {
                localStorage.removeItem('userInfo');
                router.push('/admin');
            }
        };

        checkAuth();
    }, [pathname, isLoginPage, router]);

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-red-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium tracking-wide uppercase">Verifying Access...</p>
                </div>
            </div>
        );
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-black font-sans text-gray-200">
            <AdminSidebar />
            <div className="flex-1 ml-64 bg-black">
                <main className="p-8 md:p-12 max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
