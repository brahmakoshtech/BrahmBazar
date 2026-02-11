'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
   ShoppingBag,
   LayoutGrid,
   ChevronDown
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';

import { useContent } from '@/hooks/useContent';


import { useShopView } from '@/context/ShopViewContext';
import { motion } from 'framer-motion';


export default function Navbar() {
   const pathname = usePathname();
   const router = useRouter();
   const searchParams = useSearchParams();
   const { view, setView } = useShopView();
   const [searchQuery, setSearchQuery] = useState(searchParams?.get('keyword') || '');

   const [isSticky, setIsSticky] = useState(false);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [expandedCategory, setExpandedCategory] = useState(null); // For mobile accordion
   const [categories, setCategories] = useState([]);
   const { cartCount, wishlistCount } = useCart();
   const [isMobileSearching, setIsMobileSearching] = useState(false);
   const [mounted, setMounted] = useState(false);

   // Fetch Navbar content
   const { getContent, loading } = useContent('navbar');

   useEffect(() => {
      setMounted(true);
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

   // Scroll Lock for Mobile Menu
   useEffect(() => {
      if (mobileMenuOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => {
         document.body.style.overflow = 'unset';
      };
   }, [mobileMenuOpen]);

   const handleSearch = (e) => {
      e?.preventDefault();
      if (searchQuery.trim()) {
         router.push(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
         setIsMobileSearching(false);
         setMobileMenuOpen(false);
      }
   };

   const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
         handleSearch();
      }
   };

   return (
      <div className="fixed top-0 left-0 w-full z-50">
         {/* 1. TOP ANNOUNCEMENT BAR - SCROLLING TICKER */}
         <div className="bg-orange-500 text-white text-[11px] md:text-xs py-1.5 md:py-2 border-b border-white/10 tracking-wider font-serif overflow-hidden relative z-[60]">
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

         {/* 2. HEADER CONTAINER */}
         <header className={`transition-all duration-300 ${isSticky ? 'bg-background shadow-md border-b border-border' : 'bg-[#FDF2E3] md:bg-background/40 md:backdrop-blur-sm border-b border-transparent'}`}>

            {/* MAIN HEADER: Logo | Switch | Search & Actions */}
            <div className="container mx-auto px-4 max-w-7xl relative">
               <div className={`flex justify-between items-center py-1.5 md:py-3 transition-all duration-300 ${isMobileSearching ? 'gap-2' : 'gap-4 md:gap-8'}`}>

                  {/* LEFT: Mobile Menu & Logo */}
                  <div className={`flex items-center transition-all duration-300 ${isMobileSearching ? 'shrink-0' : 'gap-2 md:gap-4'}`}>
                     {!isMobileSearching && (
                        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1 -ml-2 text-foreground hover:text-primary transition-colors">
                           <Menu size={22} />
                        </button>
                     )}

                     <Link href="/" className="flex items-center gap-1.5 md:gap-2 group">
                        <div className="relative shrink-0 transition-transform duration-300 hidden lg:block">
                           <Image
                              src="/images/Brahmokosh.png"
                              alt="BRAHMAKOSH Logo"
                              width={56}
                              height={56}
                              className="object-contain"
                              priority
                           />
                        </div>
                        <div className={`flex flex-col leading-none items-start justify-center transition-all duration-300 ${isMobileSearching ? 'scale-90 -translate-x-1' : ''}`}>
                           <span className={`font-serif font-black tracking-tight uppercase flex transition-all duration-300 ${isMobileSearching ? 'text-[10px] md:text-lg lg:text-2xl' : 'text-lg md:text-xl lg:text-2xl'}`}>
                              <span className="text-orange-500">BRAHMA</span>
                              <span className="text-foreground">KOSH</span>
                           </span>
                           {!isMobileSearching && (
                              <span className="text-[6px] md:text-[7px] lg:text-[8px] text-muted-foreground tracking-[0.2em] font-bold uppercase mt-0 text-center w-full">
                                 #NO.1 SPIRITUAL STORE
                              </span>
                           )}
                        </div>
                     </Link>
                  </div>

                  {/* MOBILE & TABLET CENTER: Search Input when active */}
                  {isMobileSearching && (
                     <div className="flex-1 lg:hidden animate-in fade-in slide-in-from-right duration-300 mx-2">
                        <div className="relative flex items-center gap-2">
                           <div className="relative flex-1">
                              <input
                                 autoFocus
                                 type="text"
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                                 onKeyDown={handleKeyDown}
                                 placeholder="Search..."
                                 className="w-full pl-4 pr-10 py-2 bg-white/60 border border-primary/30 rounded-full text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/40 shadow-inner"
                              />
                              <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors">
                                 <Search size={16} />
                              </button>
                           </div>
                           <button
                              onClick={() => {
                                 setIsMobileSearching(false);
                                 setSearchQuery('');
                              }}
                              className="p-2 text-muted-foreground hover:text-primary"
                           >
                              <X size={20} />
                           </button>
                        </div>
                     </div>
                  )}

                  {/* CENTER: Switch Button (Desktop) - Always Visible */}
                  <div className={`hidden ${isMobileSearching ? 'lg:flex' : 'md:flex'} absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20`}>
                     <div className="bg-white p-1 rounded-full flex relative items-center border border-[#DCC8B0] shadow-sm w-[180px] lg:w-[240px] justify-between">
                        {/* Animated Background Pill - Hydration Safe */}
                        {mounted && (
                           <motion.div
                              className="absolute bg-primary rounded-full shadow-md inset-y-1 left-1 w-[calc(50%-4px)]"
                              initial={{ x: view === 'shop' ? '0%' : '100%' }}
                              animate={{
                                 x: view === 'shop' ? '0%' : '100%'
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              suppressHydrationWarning
                           />
                        )}

                        <button
                           onClick={() => {
                              if (pathname !== '/') router.push('/');
                              setView('shop');
                              window.scrollTo(0, 0);
                           }}
                           className={`flex-1 py-1.5 rounded-full text-[10px] lg:text-sm font-bold transition-colors duration-300 relative z-10 text-center ${(!mounted || view === 'shop') ? 'text-white' : 'text-[#5A4033] hover:text-black'}`}
                        >
                           Shop
                        </button>
                        <button
                           onClick={() => {
                              if (pathname !== '/') router.push('/');
                              setView('for_you');
                              window.scrollTo(0, 0);
                           }}
                           className={`flex-1 py-1.5 rounded-full text-[10px] lg:text-sm font-bold transition-colors duration-300 relative z-10 text-center ${mounted && view === 'for_you' ? 'text-white' : 'text-[#5A4033] hover:text-black'}`}
                        >
                           For You
                        </button>
                     </div>
                  </div>


                  {/* RIGHT: Search & Actions */}
                  <div className="flex items-center gap-2 lg:gap-5">
                     {/* Desktop Search Bar (Refined) */}
                     <div className="hidden lg:block relative w-64 group">
                        <input
                           type="text"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           onKeyDown={handleKeyDown}
                           placeholder="Search..."
                           className="w-full pl-4 pr-9 py-2 rounded-full border border-[#DCC8B0] bg-white text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm placeholder-[#9C8C74]"
                        />
                        <button onClick={handleSearch} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-[#9C8C74] hover:text-primary transition-colors">
                           <Search size={16} />
                        </button>
                     </div>

                     {/* Mobile & Tablet Search Icon Toggle */}
                     {!isMobileSearching && (
                        <button
                           onClick={() => setIsMobileSearching(true)}
                           className="lg:hidden p-1 text-muted-foreground hover:text-primary transition-all duration-300"
                        >
                           <Search size={22} />
                        </button>
                     )}

                     <Link href="/wishlist" className="hidden md:flex flex-col items-center group relative text-muted-foreground hover:text-primary transition-colors">
                        <div className="relative p-1">
                           <Heart size={20} className="lg:w-[22px] lg:h-[22px] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                           {mounted && wishlistCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full animate-in fade-in zoom-in">{wishlistCount}</span>
                           )}
                        </div>
                        <span className="text-[9px] font-medium uppercase tracking-widest mt-1 opacity-60 group-hover:opacity-100 hidden lg:block">Saved</span>
                     </Link>

                     <Link href="/account" className="hidden md:flex flex-col items-center group text-muted-foreground hover:text-primary transition-colors">
                        <div className="relative p-1">
                           <User size={20} className="lg:w-[22px] lg:h-[22px] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                        </div>
                        <span className="text-[9px] font-medium uppercase tracking-widest mt-1 opacity-60 group-hover:opacity-100 hidden lg:block">Account</span>
                     </Link>

                     {!isMobileSearching && (
                        <Link href="/cart" className="flex flex-col items-center group relative text-foreground transition-colors">
                           <div className="relative p-1 md:p-1.5 bg-muted rounded-full group-hover:bg-primary/20 transition-colors duration-300 border border-border group-hover:border-primary/30">
                              <ShoppingCart size={18} className="text-foreground group-hover:text-primary transition-colors duration-300" strokeWidth={1.5} />
                              {mounted && cartCount > 0 && (
                                 <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full shadow-md animate-in fade-in zoom-in">{cartCount}</span>
                              )}
                           </div>
                        </Link>
                     )}
                  </div>
               </div>


               {/* 2.2 MOBILE SECONDARY ROW: View Switcher - Home Only */}
               {!isMobileSearching && pathname === '/' && (
                  <div className="md:hidden flex justify-center pb-2.5 px-4 animate-in fade-in slide-in-from-top duration-500">
                     <div className="bg-white/80 backdrop-blur-sm p-1 rounded-full flex relative items-center border border-[#DCC8B0]/50 shadow-sm w-full max-w-[280px] justify-between h-9">
                        {/* Animated Background Pill */}
                        {mounted && (
                           <motion.div
                              className="absolute bg-primary rounded-full shadow-sm inset-y-1 left-1 w-[calc(50%-4px)]"
                              initial={{ x: view === 'shop' ? '0%' : '100%' }}
                              animate={{ x: view === 'shop' ? '0%' : '100%' }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              suppressHydrationWarning
                           />
                        )}

                        <button
                           onClick={() => {
                              if (pathname !== '/') router.push('/');
                              setView('shop');
                              window.scrollTo(0, 0);
                           }}
                           className={`flex-1 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 relative z-10 text-center ${(!mounted || view === 'shop') ? 'text-white' : 'text-[#5A4033]'}`}
                        >
                           Shop
                        </button>
                        <button
                           onClick={() => {
                              if (pathname !== '/') router.push('/');
                              setView('for_you');
                              window.scrollTo(0, 0);
                           }}
                           className={`flex-1 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 relative z-10 text-center ${mounted && view === 'for_you' ? 'text-white' : 'text-[#5A4033]'}`}
                        >
                           For You
                        </button>
                     </div>
                  </div>
               )}
            </div>

            {/* NAVIGATION LINKS (Desktop Only) */}
            <div className="hidden md:block border-t border-border bg-background/80 backdrop-blur-sm">
               <div className="container mx-auto px-4 max-w-7xl">
                  <nav className="flex justify-start lg:justify-center items-center gap-4 lg:gap-10 py-1.5 overflow-x-auto scrollbar-hide whitespace-nowrap">
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
                                          href={`/category/${cat.slug}?subcategory=${sub.slug}`}
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
         <div
            className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-md transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => setMobileMenuOpen(false)}
         >
            <div
               className={`absolute top-0 left-0 w-[85%] max-w-sm h-full bg-[#FFF0D2] shadow-[20px_0_60px_rgba(0,0,0,0.15)] transform transition-transform duration-500 ease-out border-r border-[#DCC8B0]/30 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
               onClick={(e) => e.stopPropagation()}
            >
               {/* Drawer Header - Branded & Compact */}
               <div className="bg-[#EFDACB] p-4 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="flex flex-col relative z-10">
                     <div className="flex items-center gap-2">
                        <div className="w-12 h-12 relative flex-shrink-0">
                           <Image src="/images/Brahmokosh.png" alt="Logo" width={48} height={48} className="object-contain w-full h-full" priority />
                        </div>
                        <div className="flex flex-col leading-none">
                           <span className="font-serif font-black text-xl tracking-tight uppercase">
                              <span className="text-orange-500">BRAHMA</span>
                              <span className="text-foreground">KOSH</span>
                           </span>
                           <span className="text-[7px] text-muted-foreground tracking-[0.1em] font-bold uppercase mt-1">
                              #NO.1 SPIRITUAL STORE
                           </span>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 transition-all text-muted-foreground hover:text-primary active:scale-90 relative z-10">
                     <X size={24} />
                  </button>
               </div>

               {/* Drawer Content - Ultra High Density */}
               <div className="py-2 h-[calc(100vh-60px)] overflow-y-auto custom-scrollbar">
                  <div className="px-6 mb-1">
                     <h2 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 opacity-70 border-b border-[#DCC8B0]/20 pb-0.5">Collections</h2>
                  </div>
                  <ul className="flex flex-col gap-0.5 px-3">
                     {categories.map((cat) => (
                        <li key={cat._id}>
                           <div className={`transition-all duration-300 group ${expandedCategory === cat._id ? 'bg-transparent text-foreground shadow-none rounded-2xl' : 'hover:bg-primary/20 bg-white/40 rounded-full'}`}>
                              <div className="flex items-center justify-between py-2 px-5 cursor-pointer">
                                 <Link
                                    href={`/category/${cat.slug}`}
                                    className="flex items-center gap-3 font-bold tracking-tight transition-all flex-1"
                                    onClick={() => setMobileMenuOpen(false)}
                                 >
                                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${expandedCategory === cat._id ? 'bg-primary scale-125' : 'bg-primary group-hover:bg-primary'}`} />
                                    <span className="text-[13px]">{cat.name}</span>
                                 </Link>
                                 {cat.subcategories && cat.subcategories.length > 0 && (
                                    <button
                                       onClick={(e) => {
                                          e.stopPropagation(); // Prevent Link navigation if clicking arrow, though current structure suggests the whole row triggers link if clicking text.
                                          // Actually, the Link is separate from the button. The wrapper div doesn't have onClick.
                                          // But let's attach the expand handler to the button or make the whole row clickable for expand if it has subcats?
                                          // The previous code had the button separate.
                                          setExpandedCategory(expandedCategory === cat._id ? null : cat._id);
                                       }}
                                       className={`p-1 rounded-full transition-all ${expandedCategory === cat._id ? 'bg-black/5' : 'text-muted-foreground hover:bg-white'}`}
                                    >
                                       <ChevronDown size={16} className={`transition-transform duration-500 ${expandedCategory === cat._id ? 'rotate-180' : ''}`} />
                                    </button>
                                 )}
                              </div>

                              {/* Mobile Subcategories Accordion - Compact */}
                              {cat.subcategories && cat.subcategories.length > 0 && (
                                 <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedCategory === cat._id ? 'max-h-96 opacity-100 pb-3' : 'max-h-0 opacity-0'}`}>
                                    <ul className="flex flex-col gap-1 px-4">
                                       {cat.subcategories.map((sub, idx) => (
                                          <li key={idx}>
                                             <Link
                                                href={`/category/${cat.slug}?subcategory=${sub.slug}`}
                                                className={`block text-[12px] font-medium transition-all py-2 px-4 rounded-lg border border-transparent ${expandedCategory === cat._id ? 'text-foreground bg-black/5 hover:bg-black/10' : 'text-muted-foreground'}`}
                                                onClick={() => setMobileMenuOpen(false)}
                                             >
                                                {sub.name}
                                             </Link>
                                          </li>
                                       ))}
                                    </ul>
                                 </div>
                              )}
                           </div>
                        </li>
                     ))}
                  </ul>

                  {/* Sacred Footer Note - Minimal */}
                  <div className="mt-8 px-8 py-6 text-center border-t border-[#DCC8B0]/20 mx-4">
                     <p className="text-[9px] text-muted-foreground font-medium italic tracking-wide">"Where tradition meets the soul."</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="md:hidden fixed bottom-7 left-1/2 -translate-x-1/2 w-[94%] max-w-lg bg-[#111111]/95 backdrop-blur-2xl border border-white/10 z-50 flex justify-around items-center py-2 px-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
            <Link href="/" className={`flex flex-col items-center justify-center flex-1 gap-1 group/nav transition-colors duration-300 ${pathname === '/' ? 'text-orange-500' : 'text-gray-400'}`}>
               <div className={`p-1 rounded-xl transition-all duration-300 group-active/nav:bg-orange-500/10 group-active/nav:scale-90 ${pathname === '/' ? 'bg-orange-500/10' : ''}`}>
                  <Home size={20} className="drop-shadow-sm" />
               </div>
               <span className="text-[9px] font-bold uppercase tracking-tighter">Home</span>
            </Link>

            <Link href="/shop" className={`flex flex-col items-center justify-center flex-1 gap-1 group/nav transition-colors duration-300 ${pathname === '/shop' ? 'text-orange-500' : 'text-gray-400'}`}>
               <div className={`p-1 rounded-xl transition-all duration-300 group-active/nav:bg-orange-500/10 group-active/nav:scale-90 ${pathname === '/shop' ? 'bg-orange-500/10' : ''}`}>
                  <ShoppingBag size={20} />
               </div>
               <span className="text-[9px] font-bold uppercase tracking-tighter">Products</span>
            </Link>

            <Link href="/" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(true); }} className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-orange-500 gap-1 transition-colors group/nav">
               <div className="p-1 rounded-xl transition-all duration-300 group-active/nav:bg-orange-500/10 group-active/nav:scale-90">
                  <LayoutGrid size={20} />
               </div>
               <span className="text-[9px] font-bold uppercase tracking-tighter">Category</span>
            </Link>

            <Link href="/wishlist" className={`flex flex-col items-center justify-center flex-1 gap-1 group/nav transition-colors duration-300 ${pathname === '/wishlist' ? 'text-orange-500' : 'text-gray-400'}`}>
               <div className={`p-1 rounded-xl transition-all duration-300 group-active/nav:bg-orange-500/10 group-active/nav:scale-90 ${pathname === '/wishlist' ? 'bg-orange-500/10' : ''}`}>
                  <Heart size={20} />
               </div>
               <span className="text-[9px] font-bold uppercase tracking-tighter">Wishlist</span>
            </Link>

            <Link href="/account" className={`flex flex-col items-center justify-center flex-1 gap-1 group/nav transition-colors duration-300 ${pathname === '/account' ? 'text-orange-500' : 'text-gray-400'}`}>
               <div className={`p-1 rounded-xl transition-all duration-300 group-active/nav:bg-orange-500/10 group-active/nav:scale-90 ${pathname === '/account' ? 'bg-orange-500/10' : ''}`}>
                  <User size={20} />
               </div>
               <span className="text-[9px] font-bold uppercase tracking-tighter">Account</span>
            </Link>
         </div>
      </div>
   );
}
