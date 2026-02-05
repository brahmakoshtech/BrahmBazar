import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { Suspense } from 'react';

export default function ShopLayout({ children }) {
    return (
        <CartProvider>
            <Suspense fallback={null}>
                <Navbar />
            </Suspense>
            <main className="flex-grow pb-10 pt-[95px] md:pt-44">
                {children}
            </main>
            <Footer />
        </CartProvider>
    );
}
