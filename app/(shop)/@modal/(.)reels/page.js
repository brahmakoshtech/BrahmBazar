'use client';

import { Suspense } from 'react';
import ReelsPlayer from '@/components/ReelsPlayer';

export default function ReelsMiddleware() {
    return (
        <Suspense fallback={null}>
            <ReelsPlayer isModal={true} />
        </Suspense>
    );
}
