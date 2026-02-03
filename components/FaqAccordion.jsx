'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function FaqAccordion({ items = [] }) {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleIndex = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div
                    key={item._id || index}
                    className="bg-card/50 border border-primary/10 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300"
                >
                    <button
                        onClick={() => toggleIndex(index)}
                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    >
                        <span className={`text-lg font-serif font-medium transition-colors ${activeIndex === index ? 'text-primary' : 'text-foreground'}`}>
                            {item.question}
                        </span>
                        <div className={`p-2 rounded-full transition-colors ${activeIndex === index ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {activeIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                        </div>
                    </button>
                    <AnimatePresence>
                        {activeIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <div className="px-6 pb-6 pt-0 text-muted-foreground text-sm leading-relaxed border-t border-dashed border-primary/10 mt-2">
                                    {item.answer}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
