'use client';
import { useEffect, useState } from 'react';
import FaqAccordion from '@/components/FaqAccordion';
import { getFaqs } from '@/services/faqService';
import { motion } from 'framer-motion';

export default function FaqPage() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const data = await getFaqs();
                setFaqs(data);
            } catch (error) {
                console.error('Failed to fetch FAQs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-secondary font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 block"
                    >
                        Support & Knowledge
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-serif font-medium text-foreground mb-8"
                    >
                        Frequently Asked <span className="text-primary italic">Questions</span>
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-2 items-center justify-center opacity-70 mb-8"
                    >
                        <div className="h-px w-16 bg-primary"></div>
                        <span className="text-primary text-2xl">❖</span>
                        <div className="h-px w-16 bg-primary"></div>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"
                    >
                        Find answers to common queries about our sacred products, shipping processes, and spiritual authenticity.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-24 bg-card/40 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <FaqAccordion items={faqs} />
                    </motion.div>
                )}

                {!loading && faqs.length === 0 && (
                    <div className="text-center py-20 bg-card/20 rounded-xl border border-dashed border-border">
                        <p className="text-xl text-muted-foreground">No FAQs available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
