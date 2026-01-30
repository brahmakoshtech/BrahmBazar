export default function Skeleton({ className = '', height, width, circle = false }) {
    return (
        <div
            className={`animate-pulse bg-gray-200 ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`}
            style={{
                height: height,
                width: width
            }}
        />
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <Skeleton height="300px" className="w-full" />
            <div className="p-4 space-y-3">
                <Skeleton height="15px" width="40%" />
                <Skeleton height="20px" width="80%" />
                <div className="flex justify-between pt-2">
                    <Skeleton height="24px" width="30%" />
                    <Skeleton height="32px" width="32px" circle />
                </div>
            </div>
        </div>
    );
}
