import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';

export default function ShopLayout({ children }) {
    return (
        <CartProvider>
            <Navbar />
            <main className="flex-grow pb-10">
                {children}
            </main>
            <Footer />
        </CartProvider>
    );
}
