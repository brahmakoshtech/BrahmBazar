import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
            <div className="bg-[#FFF9F0] rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 border border-[#DCC8B0]/50 relative">
                {/* Decorative Background Blur */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

                <div className="flex items-center justify-between p-6 border-b border-[#DCC8B0]/30 relative z-10 bg-[#FFF9F0]/80 backdrop-blur-md">
                    <h3 className="text-xl font-serif font-bold text-[#4A3B32] tracking-wide flex items-center gap-3">
                        <img src="/images/Brahmokosh.png" alt="Logo" className="w-8 h-8 object-contain" />
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 bg-[#4A3B32]/5 rounded-full hover:bg-primary hover:text-white transition-all text-[#4A3B32]/60 hover:shadow-lg active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
