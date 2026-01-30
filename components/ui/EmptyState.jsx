import Link from 'next/link';

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionLink
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-neutral-900 p-8 rounded-full mb-6 text-primary border border-white/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                {icon}
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-2 tracking-wide">{title}</h3>
            <p className="text-gray-400 max-w-sm mb-8 leading-relaxed font-light">{description}</p>
            {actionLabel && actionLink && (
                <Link href={actionLink} className="bg-primary text-black px-8 py-3 rounded-full font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
