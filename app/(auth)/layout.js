export default function AuthLayout({ children }) {
    return (
        <main className="min-h-screen w-full relative flex items-center justify-center bg-[#FDFBF7] overflow-hidden font-sans">
            {/* Background Image with heavy blur and overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat blur-[12px] opacity-40"
                style={{ backgroundImage: "url('/images/hero-awaken.png')" }}
            ></div>

            {/* mystical overlay gradients - Lighter Version */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/60 to-transparent"></div>
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FDFBF7]/80 via-transparent to-[#FDFBF7]/80"></div>

            {/* Content Container - Wider */}
            <div className="relative z-10 w-full max-w-lg px-4 py-8">
                {children}
            </div>
        </main>
    );
}
