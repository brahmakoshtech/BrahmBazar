import { Inter, Playfair_Display } from 'next/font/google';
import '../styles/globals.css';
import { ToastProvider } from '@/context/ToastContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata = {
  title: 'Rudra Divine - Authentic Spiritual Products',
  description: 'Discover genuine Rudraksha, Gemstones, and Yantras energized for your spiritual journey.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans flex flex-col min-h-screen`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
