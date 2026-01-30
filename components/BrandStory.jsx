'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Button from './ui/Button';
import { useContent } from '@/hooks/useContent';

export default function BrandStory() {
    const { getContent, loading } = useContent('home_story');

    return (
        <section className="py-24 bg-background overflow-hidden relative">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2"
                    >
                        <div className="relative aspect-[4/5] rounded-t-full rounded-b-2xl overflow-hidden border-4 border-border">
                            <Image
                                src="https://images.unsplash.com/photo-1528319725582-ddc096101511?w=800&auto=format&fit=crop&q=60"
                                alt="Meditation and Peace"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                            <div className="absolute bottom-8 left-8 right-8 text-center">
                                <p className="text-secondary font-serif italic text-xl">"Spirituality is not just a practice, it is a way of life."</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Text Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full lg:w-1/2 space-y-8"
                    >
                        <div className="space-y-4">
                            <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm">
                                {!loading && getContent('story_label', 'The Sacred Origin')}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                                {!loading && getContent('story_title', 'Timeless Faith. Energized by Devotion.')}
                            </h2>
                        </div>

                        <div className="space-y-6 text-muted-foreground text-lg font-light leading-relaxed">
                            <p>
                                {!loading && getContent('story_text_1', 'The journey of the soul requires powerful allies. At Rudra Divine, we do not merely trade in objects; we are custodians of ancient energy. Each Rudraksha, Gemstone, and Yantra is chosen for its vibrational purity.')}
                            </p>
                            <p>
                                {!loading && getContent('story_text_2', 'Our path is one of authenticity. Before reaching your hands, every sacred tool undergoes a rigorous Pran Pratistha ceremony by Vedic Brahmins in Kashi—transforming it from a stone into a living vessel of cosmic power, ready to guide your spiritual evolution.')}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div>
                                <h4 className="text-foreground font-serif text-2xl font-bold mb-2">
                                    {!loading && getContent('story_stat_1_val', '12+ Years')}
                                </h4>
                                <p className="text-muted-foreground text-sm">
                                    {!loading && getContent('story_stat_1_lbl', 'Serving the Dharma')}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-foreground font-serif text-2xl font-bold mb-2">
                                    {!loading && getContent('story_stat_2_val', '50,000+')}
                                </h4>
                                <p className="text-muted-foreground text-sm">
                                    {!loading && getContent('story_stat_2_lbl', 'Seekers Empowered')}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button variant="primary" className="px-8 py-4 text-lg">Read Our Story</Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
