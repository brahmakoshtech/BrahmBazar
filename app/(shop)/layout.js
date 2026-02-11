import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { ShopViewProvider } from '@/context/ShopViewContext';
import { Suspense } from 'react';

export default function ShopLayout({ children }) {
    return (
        <CartProvider>
            <ShopViewProvider>
                <Suspense fallback={null}>
                    <Navbar />
                </Suspense>
                <main className="flex-grow pb-10 pt-[85px] md:pt-[140px]">
                    {children}
                </main>
                <Footer />
            </ShopViewProvider>
        </CartProvider>
    );
}
