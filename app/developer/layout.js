'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function DeveloperLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const isLoginPage = pathname === '/developer';

    useEffect(() => {
        if (isLoginPage) {
            setAuthorized(true);
            return;
        }

        const checkAuth = () => {
            const userInfo = localStorage.getItem('userInfo');

            if (!userInfo) {
                router.push('/developer');
                return;
            }

            try {
                const user = JSON.parse(userInfo);
                if (user.role !== 'developer') {
                    // Redirect to login if not developer.
                    // Could also redirect to home, but sticking to login restricts access appropriately.
                    router.push('/developer');
                } else {
                    setAuthorized(true);
                }
            } catch (error) {
                localStorage.removeItem('userInfo');
                router.push('/developer');
            }
        };

        checkAuth();
    }, [pathname, isLoginPage, router]);

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium tracking-wide">SYSTEM HANDSHAKE...</p>
                </div>
            </div>
        );
    }

    // Only apply layout styling if it's not the login page (which handles its own full screen)
    // Actually, both pages (Dashboard and Login) are full screen, so we can just render checks.

    return (
        <>
            {children}
        </>
    );
}
