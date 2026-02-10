import { Inter, Lora } from 'next/font/google';
import '../styles/globals.css';
import { ToastProvider } from '@/context/ToastContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora' });

export const metadata = {
  title: 'BrahmBazar',
  description: 'Discover genuine Rudraksha, Gemstones, and Yantras energized for your spiritual journey.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lora.variable} font-sans flex flex-col min-h-screen`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
