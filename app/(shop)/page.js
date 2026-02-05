'use client';

import { useEffect, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import TrustStrip from '@/components/TrustStrip';
import CategoryShowcase from '@/components/CategoryShowcase';
import SecondaryBanners from '@/components/SecondaryBanners';
import BrandStory from '@/components/BrandStory';
import ProductCard from '@/components/ProductCard';
import api from '@/services/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ReelsSection from '@/components/ReelsSection';
import FaqAccordion from '@/components/FaqAccordion';
import { getFaqs } from '@/services/faqService';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productsRes, couponsRes, faqsRes, newArrivalsRes, trendingRes] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/coupons/active'),
          getFaqs(),
          api.get('/api/products/new-arrival'),
          api.get('/api/products/trending')
        ]);
        const sortedProducts = (productsRes.data || []).sort((a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setProducts(sortedProducts);
        setNewArrivals(newArrivalsRes.data || []);
        setTrendingProducts(trendingRes.data || []);
        setActiveCoupons(couponsRes.data);
        setFaqs(faqsRes);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-background overflow-hidden relative">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Trust Strip */}
      <TrustStrip />

      {/* 3. Category Showcase */}
      <CategoryShowcase />

      {/* 3.1 New Arrivals Section */}
      <section className="py-16 bg-background relative border-t border-primary/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 block">
              Latest Treasures
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-6">
              New <span className="text-primary italic">Arrivals</span>
            </h2>
            <div className="flex gap-2 items-center justify-center opacity-70">
              <div className="h-px w-12 bg-primary"></div>
              <span className="text-primary text-xl">❖</span>
              <div className="h-px w-12 bg-primary"></div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded-2xl h-64"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-4 lg:gap-5">
              {newArrivals.slice(0, 5).map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} activeCoupons={activeCoupons} />
                </motion.div>
              ))}
              {newArrivals.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-10">No new arrivals at the moment.</div>
              )}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/shop"
              className="group relative px-8 py-3 bg-transparent border border-primary/40 rounded-full text-foreground font-serif tracking-wide hover:border-primary hover:bg-primary/5 transition-all duration-300 inline-block"
            >
              <span className="flex items-center gap-2">
                See All Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3.2 Trending Section */}
      <section className="py-16 bg-secondary/5 relative border-t border-primary/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 block">
              Curated Favorites
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-6">
              Trending <span className="text-primary italic">Now</span>
            </h2>
            <div className="flex gap-2 items-center justify-center opacity-70">
              <div className="h-px w-12 bg-primary"></div>
              <span className="text-primary text-xl">❖</span>
              <div className="h-px w-12 bg-primary"></div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded-2xl h-64"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-4 lg:gap-5">
              {trendingProducts.slice(0, 5).map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} activeCoupons={activeCoupons} />
                </motion.div>
              ))}
              {trendingProducts.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-10">Check back later for trending items.</div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3.5 Secondary Banner Section */}
      <SecondaryBanners />

      {/* 4. Brand Story */}
      <BrandStory />

      {/* 5. Featured Products Section */}
      <section id="featured-products" className="py-24 bg-secondary/5 relative">
        <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent opacity-50"></div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="max-w-xl">
              <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-2 block">
                Sacred Tools for Your Journey
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                Experience the <span className="text-primary italic">Energy</span>
              </h2>
            </div>

          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5 md:gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded-2xl overflow-hidden border border-border p-4">
                  <div className="bg-gray-200 aspect-[4/5] w-full rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-4 lg:gap-6">
              {products.slice(0, visibleCount).map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} activeCoupons={activeCoupons} />
                  {/* Note: ProductCard might need CSS adjustments for dark mode if it doesn't look right. 
                        Assuming ProductCard is mostly image and text that adapts or is white-bg based card. 
                        If it's white card, it will pop nicely on dark bg. */}
                </motion.div>
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-center py-20 bg-muted rounded-xl border border-border">
                  <p className="text-xl text-muted-foreground">No products found at the moment.</p>
                </div>
              )}
            </div>
          )}

          {products.length > visibleCount && (
            <div className="mt-16 text-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 5)}
                className="bg-primary text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-white transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] inline-flex items-center gap-2 transform hover:-translate-y-1"
              >
                Show More <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 block">
              Common Queries
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-6">
              Divine <span className="text-primary italic">Answers</span>
            </h2>
            <div className="flex gap-2 items-center justify-center opacity-70">
              <div className="h-px w-12 bg-primary"></div>
              <span className="text-primary text-xl">❖</span>
              <div className="h-px w-12 bg-primary"></div>
            </div>
          </div>

          <FaqAccordion items={faqs} />

        </div>
      </section>

      {/* REELS SECTION */}
      <ReelsSection />
    </main>
  );
}
