'use client';

import { Suspense } from 'react';
import AuthTabs from '@/components/AuthTabs';

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <AuthTabs initialTab="register" />
        </Suspense>
    );
}
