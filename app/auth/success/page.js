'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';

function AuthSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        const handleGoogleLogin = async () => {
            if (!token) {
                router.push('/login?error=Google login failed');
                return;
            }

            try {
                // 1. Fetch user profile with the new token to get full user details (name, email, role, etc)
                // We manually set the header here because the interceptor might not pick it up instantly from localStorage if we haven't set it yet
                const { data: userProfile } = await api.get('/api/users/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // 2. Construct the userInfo object expected by the app (combining profile + token)
                const userInfo = {
                    ...userProfile,
                    token: token
                };

                // 3. Save to localStorage
                localStorage.setItem('userInfo', JSON.stringify(userInfo));

                // 4. Redirect to home or dashboard
                router.push('/');

            } catch (error) {
                console.error('Error fetching user profile after Google Login:', error);
                router.push('/login?error=Authentication failed');
            }
        };

        handleGoogleLogin();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF0D2]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-orange-900 font-serif text-lg animate-pulse">Completing your sacred login...</p>
            </div>
        </div>
    );
}

export default function AuthSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthSuccess />
        </Suspense>
    );
}
