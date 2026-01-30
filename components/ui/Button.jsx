import { ArrowRight } from 'lucide-react';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    icon,
    disabled,
    ...props
}) {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-primary text-black hover:bg-white hover:text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] focus:ring-primary font-bold border-none",
        secondary: "bg-white/10 text-white hover:bg-white/20 shadow-lg backdrop-blur-sm focus:ring-white",
        outline: "bg-transparent border border-white/20 text-white hover:border-primary hover:text-primary focus:ring-primary",
        ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5 focus:ring-gray-400",
        white: "bg-white text-black border border-white hover:bg-gray-100 shadow-sm focus:ring-white"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                </>
            ) : (
                <>
                    {children}
                    {icon && <span className="ml-2">{icon}</span>}
                </>
            )}
        </button>
    );
}
