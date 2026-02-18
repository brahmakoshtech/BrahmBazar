import ReelsPlayer from '@/components/ReelsPlayer';

export const metadata = {
    title: 'Sacred Reels | BrahmBazar',
    description: 'Immerse yourself in divine visual stories.',
};

import { Suspense } from 'react';

export default function ReelsPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full bg-[#FFF0D2] flex items-center justify-center text-zinc-900">Loading Sacred Reels...</div>}>
            <ReelsPlayer />
        </Suspense>
    );
}
