'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
   Search,
   ShoppingCart,
   User,
   Heart,
   Menu,
   X,
   Home,
   Grid,
   ChevronDown
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';

import { useContent } from '@/hooks/useContent';

export default function Navbar() {
   const [isSticky, setIsSticky] = useState(false);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [expandedCategory, setExpandedCategory] = useState(null); // For mobile accordion
   const [categories, setCategories] = useState([]);
   const { cartCount, wishlistCount } = useCart();

   // Fetch Navbar content
   const { getContent, loading } = useContent('navbar');

   useEffect(() => {
      const handleScroll = () => {
         setIsSticky(window.scrollY > 100);
      };

      const fetchCategories = async () => {
         try {
            const { data } = await api.get('/api/categories');
            setCategories(data);
         } catch (error) {
            console.error('Failed to fetch categories:', error);
         }
      };

      fetchCategories();
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   return (
      <>
         {/* 1. TOP ANNOUNCEMENT BAR - Sacred Dark & Gold */}
         {/* 1. TOP ANNOUNCEMENT BAR - SCROLLING TICKER */}
         <div className="bg-foreground text-[#E6DCC3] text-[11px] md:text-xs py-2 border-b border-[#E6DCC3]/20 tracking-wider font-serif overflow-hidden relative z-[60]">
            <div className="flex animate-marquee whitespace-nowrap gap-16 md:gap-32 w-max">
               {/* Content Duplicated for seamless loop */}
               {[1, 2, 3, 4].map((key) => (
                  <div key={key} className="flex gap-16 md:gap-32 items-center">
                     <span className="flex items-center gap-2">
                        <span className="text-primary text-base">✦</span>
                        {!loading && getContent('navbar_announcement_left', 'Awaken Your Inner Energy')}
                     </span>
                     <span className="flex items-center gap-2">
                        <span className="text-primary text-base">✦</span>
                        {!loading && getContent('navbar_announcement_right', 'Authentic Vedic Tools')}
                     </span>
                     <span className="font-semibold text-white/90 flex items-center gap-2">
                        <span className="text-primary text-base">★</span>
                        {!loading && getContent('navbar_promo', 'Start Your Sacred Journey • Free Shipping on Orders over ₹999')}
                     </span>
                     <span className="flex items-center gap-2">
                        <span className="text-primary text-base">📞</span>
                        Blessings: {!loading && getContent('navbar_phone', '+91-99999*****')}
                     </span>
                  </div>
               ))}
            </div>
         </div>

         {/* 2. STICKY HEADER CONTAINER */}
         <header className={`sticky top-0 z-50 transition-all duration-300 ${isSticky ? 'bg-background/90 backdrop-blur-md shadow-md border-b border-border' : 'bg-transparent border-b border-transparent'}`}>

            {/* MAIN HEADER: Logo | Search | Actions */}
            <div className="container mx-auto px-4 max-w-7xl">
               <div className="flex justify-between items-center py-4 md:py-6 gap-4 md:gap-8">

                  {/* LEFT: Mobile Menu & Logo */}
                  <div className="flex items-center gap-3 md:gap-0">
                     <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-foreground hover:text-primary transition-colors">
                        <Menu size={24} />
                     </button>

                     <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-14 h-14 md:w-20 md:h-20 shrink-0 filter drop-shadow-lg hover:scale-105 transition-transform duration-300 rounded-full overflow-hidden">
                           <Image
                              src="/images/Brahmokosh.png"
                              alt="Brahmakosh Logo"
                              fill
                              className="object-contain mix-blend-multiply"
                              priority
                           />
                        </div>
                        <div className="flex flex-col leading-none">
                           <span className="font-serif font-bold text-foreground text-xl md:text-2xl tracking-wide uppercase group-hover:text-primary transition-colors duration-300">
                              {!loading ? getContent('navbar_logo_text', 'Brahmakosh') : 'Brahmakosh'}
                           </span>
                           <span className="text-[8px] md:text-[9px] text-muted-foreground tracking-[0.3em] font-medium uppercase mt-1">
                              {!loading && getContent('navbar_subtitle', 'Spiritual Store')}
                           </span>
                        </div>
                     </Link>
                  </div>

                  {/* CENTER: Premium Modern Search Bar (Desktop) */}
                  <div className="hidden md:flex flex-1 max-w-xl mx-auto px-6">
                     <div className="relative w-full group">
                        <input
                           type="text"
                           placeholder="Search for peace, rudraksha, yantras..."
                           className="w-full pl-5 pr-14 py-3 rounded-full border border-border bg-input text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 focus:bg-background focus:ring-1 focus:ring-primary/30 transition-all shadow-sm group-hover:border-primary/30"
                        />
                        <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-full px-5 flex items-center justify-center transition-all duration-300 active:scale-95 border border-primary/10">
                           <Search size={18} />
                        </button>
                     </div>
                  </div>

                  {/* RIGHT: Actions */}
                  <div className="flex items-center gap-2 md:gap-8">
                     <Link href="/" className="hidden md:hidden"> {/* Placeholder */}</Link>

                     {/* Mobile Search Icon */}
                     <button className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors">
                        <Search size={22} />
                     </button>

                     <Link href="/wishlist" className="hidden md:flex flex-col items-center group relative text-muted-foreground hover:text-primary transition-colors">
                        <div className="relative p-1">
                           <Heart size={22} className="group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                           {wishlistCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-in fade-in zoom-in">{wishlistCount}</span>
                           )}
                        </div>
                        <span className="text-[9px] font-medium uppercase tracking-widest mt-1 opacity-60 group-hover:opacity-100">Saved</span>
                     </Link>

                     <Link href="/account" className="hidden md:flex flex-col items-center group text-muted-foreground hover:text-primary transition-colors">
                        <div className="relative p-1">
                           <User size={22} className="group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                        </div>
                        <span className="text-[9px] font-medium uppercase tracking-widest mt-1 opacity-60 group-hover:opacity-100">Account</span>
                     </Link>

                     <Link href="/cart" className="flex flex-col items-center group relative text-foreground transition-colors">
                        <div className="relative p-2 bg-muted rounded-full group-hover:bg-primary/20 transition-colors duration-300 border border-border group-hover:border-primary/30">
                           <ShoppingCart size={20} className="text-foreground group-hover:text-primary transition-colors duration-300" strokeWidth={1.5} />
                           {cartCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-md animate-in fade-in zoom-in">{cartCount}</span>
                           )}
                        </div>
                     </Link>
                  </div>
               </div>
            </div>

            {/* NAVIGATION LINKS (Desktop Only) */}
            <div className="hidden md:block border-t border-border bg-background/80 backdrop-blur-sm">
               <div className="container mx-auto px-4 max-w-7xl">
                  <nav className="flex justify-center items-center gap-10 py-3">
                     <Link
                        href="/"
                        className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary relative group py-1"
                     >
                        Home
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full opacity-50"></span>
                     </Link>
                     {categories.map((cat) => (
                        <div key={cat._id} className="relative group py-1">
                           <Link
                              href={`/category/${cat.slug}`}
                              className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary flex items-center gap-1"
                           >
                              {cat.name}
                              {cat.subcategories && cat.subcategories.length > 0 && (
                                 <ChevronDown size={14} className="opacity-70 group-hover:translate-y-0.5 transition-transform" />
                              )}
                              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full opacity-50"></span>
                           </Link>

                           {/* Dropdown Menu */}
                           {cat.subcategories && cat.subcategories.length > 0 && (
                              <div className="absolute top-full left-0 mt-2 w-56 bg-background border border-border shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left overflow-hidden z-[100]">
                                 <div className="py-2">
                                    {cat.subcategories.map((sub, idx) => (
                                       <Link
                                          key={idx}
                                          href={`/category/${cat.slug}?subcategory=${sub.slug}`} // Pass subcategory as query param
                                          className="block px-4 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors border-b border-border last:border-none"
                                       >
                                          {sub.name}
                                       </Link>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     ))}
                  </nav>
               </div>
            </div>
         </header>

         {/* 3. MOBILE MENU DRAWER */}
         <div className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setMobileMenuOpen(false)}>
            <div className={`absolute top-0 left-0 w-[85%] max-w-sm h-full bg-background border-r border-border shadow-2xl transform transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
               {/* Drawer Header */}
               <div className="bg-muted p-6 flex justify-between items-center border-b border-border">
                  <span className="font-serif font-bold text-xl tracking-wider text-foreground">MENU</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="hover:bg-slate-200 rounded-full p-2 transition text-muted-foreground hover:text-foreground"><X size={24} /></button>
               </div>

               {/* Drawer Content */}
               <div className="py-4 px-6 h-full overflow-y-auto">
                  <ul className="flex flex-col space-y-2">
                     <li>
                        <Link
                           href="/"
                           className="flex items-center justify-between py-4 text-foreground font-medium tracking-wide border-b border-border hover:text-primary transition-colors"
                           onClick={() => setMobileMenuOpen(false)}
                        >
                           Home
                        </Link>
                     </li>
                     {categories.map((cat) => (
                        <li key={cat._id} className="border-b border-border">
                           <div className="flex items-center justify-between py-4">
                              <Link
                                 href={`/category/${cat.slug}`}
                                 className="text-foreground font-medium tracking-wide hover:text-primary transition-colors flex-1"
                                 onClick={() => setMobileMenuOpen(false)}
                              >
                                 {cat.name}
                              </Link>
                              {cat.subcategories && cat.subcategories.length > 0 && (
                                 <button
                                    onClick={() => setExpandedCategory(expandedCategory === cat._id ? null : cat._id)}
                                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                 >
                                    <ChevronDown size={16} className={`transition-transform duration-300 ${expandedCategory === cat._id ? 'rotate-180' : ''}`} />
                                 </button>
                              )}
                           </div>

                           {/* Mobile Subcategories Accordion */}
                           {cat.subcategories && cat.subcategories.length > 0 && (
                              <div className={`overflow-hidden transition-all duration-300 ${expandedCategory === cat._id ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                                 <ul className="pl-4 space-y-2 border-l border-border ml-2">
                                    {cat.subcategories.map((sub, idx) => (
                                       <li key={idx}>
                                          <Link
                                             href={`/category/${cat.slug}?subcategory=${sub.slug}`}
                                             className="block text-sm text-gray-600 hover:text-primary transition-colors py-1"
                                             onClick={() => setMobileMenuOpen(false)}
                                          >
                                             {sub.name}
                                          </Link>
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           )}
                        </li>
                     ))}
                     <li className="mt-8 pt-8 border-t border-border space-y-4">
                        <Link href="/account" className="flex items-center gap-4 py-3 text-gray-600 font-medium hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>
                           <User size={20} className="text-primary" /> My Profile
                        </Link>
                        <Link href="/wishlist" className="flex items-center gap-4 py-3 text-gray-600 font-medium hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>
                           <Heart size={20} className="text-primary" /> My Wishlist
                        </Link>
                     </li>
                  </ul>
               </div>
            </div>
         </div>

         {/* 4. MOBILE BOTTOM NAV (Fixed at bottom) */}
         <div className="md:hidden fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-xl border-t border-border z-50 flex justify-between px-8 items-center py-3 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
            <Link href="/" className="flex flex-col items-center text-primary gap-1">
               <Home size={22} className="drop-shadow-sm" />
               <span className="text-[9px] font-medium tracking-wide">Home</span>
            </Link>
            <Link href="/" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(true); }} className="flex flex-col items-center text-muted-foreground hover:text-primary gap-1 transition-colors">
               <Grid size={22} />
               <span className="text-[9px] font-medium tracking-wide">Menu</span>
            </Link>
            <Link href="/wishlist" className="flex flex-col items-center text-muted-foreground hover:text-primary gap-1 transition-colors">
               <Heart size={22} />
               <span className="text-[9px] font-medium tracking-wide">Saved</span>
            </Link>
            <Link href="/account" className="flex flex-col items-center text-muted-foreground hover:text-primary gap-1 transition-colors">
               <User size={22} />
               <span className="text-[9px] font-medium tracking-wide">Profile</span>
            </Link>
         </div>
      </>
   );
}
