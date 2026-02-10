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
                <main className="flex-grow pb-10 pt-[95px] md:pt-44">
                    {children}
                </main>
                <Footer />
            </ShopViewProvider>
        </CartProvider>
    );
}
