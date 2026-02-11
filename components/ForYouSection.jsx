'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import ProductCard from '@/components/ProductCard';
import BannerSlider from '@/components/BannerSlider';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck } from 'lucide-react';
import FaqAccordion from '@/components/FaqAccordion';
import { getFaqs } from '@/services/faqService';

const SUBTITLES = {
    shop: {
        good: "Helps maintain calm and balance",
        must: "Strengthens your energy"
    },
    seva: {
        good: "Small sacred steps for harmony",
        must: "Core spiritual alignment"
    },
    yatra: {
        good: "Helpful companions for your journey",
        must: "Essential protection for travel"
    },
    puja: {
        good: "Enhances your ritual gently",
        must: "Completes your sacred ritual"
    },
    default: {
        good: "Recommended for spiritual balance",
        must: "Essential for your well-being"
    }
};

export default function ForYouSection() {
    const [types, setTypes] = useState([]);
    const [activeTab, setActiveTab] = useState('');
    const [layoutData, setLayoutData] = useState(null); // Array based layout
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(true);
    const [activeCoupons, setActiveCoupons] = useState([]);
    const [faqs, setFaqs] = useState([]);

    // 1. Initial Fetch calling types
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const [typesRes, couponsRes, faqsRes] = await Promise.all([
                    api.get('/api/admin/remedies/types'),
                    api.get('/api/coupons/active'),
                    getFaqs()
                ]);

                const typeData = typesRes.data || [];
                setTypes(typeData);
                setActiveCoupons(couponsRes.data || []);
                setFaqs(faqsRes || []);

                if (typeData.length > 0) {
                    setActiveTab(typeData[0].slug);
                } else if (types.length === 0) {
                    setLoading(false); // Stop loading if no types
                }
            } catch (error) {
                console.error("Failed to fetch types:", error);
            }
            // Wait for activeTab to trigger content fetch before clearing 'loading'
        };

        fetchTypes();
    }, []);

    // 2. Fetch Layout when activeTab changes
    useEffect(() => {
        if (!activeTab) return;

        const fetchLayout = async () => {
            setContentLoading(true);
            try {
                // Fetch structured layout from new endpoint
                const { data } = await api.get(`/api/admin/remedies/for-you?type=${activeTab}`);
                setLayoutData(data || []);
            } catch (error) {
                console.error("Failed to fetch layout:", error);
                setLayoutData([]);
            } finally {
                setContentLoading(false);
                setLoading(false);
            }
        };

        fetchLayout();
    }, [activeTab]);

    if (loading && !layoutData) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!types.length) {
        return (
            <main className="min-h-screen bg-transparent relative flex flex-col items-center justify-center p-10">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-serif text-muted-foreground">No recommendations found.</h2>
                    <p className="text-muted-foreground">Check back later for curated content.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-transparent pb-0 md:pb-20 pt-[65px] md:pt-28">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-5 md:mb-10 px-0">
                    <h1 className="text-xl xs:text-xl md:text-5xl font-serif font-bold text-[#5A4033] leading-none tracking-tight mb-0.5 md:mb-4 whitespace-nowrap">
                        Your <span className="text-primary italic">Personalized</span> Collections
                    </h1>
                    <div className="w-12 h-[1px] bg-primary/30 mx-auto mb-1 md:mb-4"></div>
                    <p className="text-[10px] xs:text-xs md:text-base text-[#8C7A6B] max-w-lg mx-auto leading-relaxed font-medium px-4">
                        Curated remedies specifically selected for your spiritual journey.
                    </p>
                </div>

                {/* TAB NAVIGATION: Inspired by the pill-style in reference image */}
                <div className="flex items-center justify-start md:justify-center gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-6 md:mx-0 md:px-0 mb-6 md:mb-14 pb-2">
                    {types.map((type) => (
                        <button
                            key={type._id || type.slug}
                            onClick={() => setActiveTab(type.slug)}
                            className={`whitespace-nowrap px-6 py-2 rounded-full text-[13px] font-bold transition-all duration-500 border ${activeTab === type.slug
                                ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9] shadow-sm scale-105'
                                : 'bg-[#FDF2E3]/50 text-[#8C7A6B] border-[#DCC8B0]/30 hover:bg-[#FDF2E3]'
                                }`}
                        >
                            {type.name}
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="min-h-[400px]">
                    {contentLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col gap-0"
                        >
                            {layoutData && layoutData.map((section, idx) => {
                                // 1. BANNER SLIDER
                                if (section.type === 'banner_slider') {
                                    if (!section.data || section.data.length === 0) return null;
                                    return (
                                        <div key={section.id || idx} className="mt-2 mb-3">
                                            <BannerSlider banners={section.data} />
                                        </div>
                                    );
                                }

                                // 2. REMEDY SECTIONS (Good/Must)
                                if (section.type === 'good_to_have' || section.type === 'must_have') {
                                    if (!section.data || section.data.length === 0) return null;

                                    const isMustHave = section.type === 'must_have';
                                    const sectionTitle = isMustHave ? 'Must Have' : 'Good To Have';

                                    // Subtitle Logic
                                    const tabLower = activeTab ? activeTab.toLowerCase() : 'default';
                                    const subMsg = isMustHave
                                        ? (SUBTITLES[tabLower]?.must || SUBTITLES.default.must)
                                        : (SUBTITLES[tabLower]?.good || SUBTITLES.default.good);

                                    return (
                                        <section key={section.id || idx} className="relative pb-4 pt-0 md:pt-4 mt-2">
                                            <div className={`mb-4 pl-4 flex flex-col items-start text-left border-l-2 ${isMustHave ? 'border-[#9F1239]' : 'border-[#2E7D32]'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={`text-xl md:text-2xl font-serif font-bold tracking-wide ${isMustHave ? 'text-[#9F1239]' : 'text-[#2E7D32]'}`}>
                                                        {section.title || sectionTitle}
                                                    </h3>
                                                    <div className={`
                                                        p-1 rounded-full border shadow-sm flex items-center justify-center
                                                        ${isMustHave
                                                            ? 'bg-red-50 border-red-100 text-[#9F1239]'
                                                            : 'bg-emerald-50 border-emerald-100 text-emerald-700'}
                                                    `}>
                                                        {isMustHave
                                                            ? <ShieldCheck size={12} strokeWidth={1.5} />
                                                            : <Sparkles size={12} strokeWidth={1.5} />
                                                        }
                                                    </div>
                                                </div>
                                                <p className="text-[11px] md:text-sm text-muted-foreground/80 font-medium leading-relaxed italic">
                                                    {subMsg}
                                                </p>
                                            </div>

                                            <div className="flex overflow-x-auto pb-8 gap-3 md:gap-6 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                                                {section.data.map((remedy) => (
                                                    <div key={remedy._id} className="min-w-[145px] xs:min-w-[160px] md:min-w-[240px] snap-start flex flex-col">
                                                        <ProductCard product={remedy.product} activeCoupons={activeCoupons} />
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    );
                                }
                                return null;
                            })}

                            {layoutData && layoutData.every(s => !s.data || s.data.length === 0) && (
                                <div className="text-center py-20 text-muted-foreground">
                                    No items found currently.
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* FAQ SECTION */}
            <section id="faq" className="pt-3 pb-[3px] md:pb-24 bg-transparent relative overflow-hidden mt-8 md:mt-16">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                <div className="container mx-auto px-4 max-w-4xl relative z-10">
                    <div className="text-center mb-6 md:mb-16">
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
        </main>
    );
}
