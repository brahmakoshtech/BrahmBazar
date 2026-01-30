'use client';

import { ShieldCheck, Truck, Gem, Sparkles } from 'lucide-react';

import { useContent } from '@/hooks/useContent';

export default function TrustStrip() {
    const { getContent, loading } = useContent('home_trust');

    const benefits = [
        {
            icon: <Sparkles size={28} />,
            title: !loading ? getContent('trust_1_title', 'Vedic Authenticity') : 'Vedic Authenticity',
            desc: !loading ? getContent('trust_1_desc', 'Energized by Tradition') : 'Energized by Tradition'
        },
        {
            icon: <Gem size={28} />,
            title: !loading ? getContent('trust_2_title', 'Purity Guaranteed') : 'Purity Guaranteed',
            desc: !loading ? getContent('trust_2_desc', 'Certified Natural & Real') : 'Certified Natural & Real'
        },
        {
            icon: <Truck size={28} />,
            title: !loading ? getContent('trust_3_title', 'Sacred Delivery') : 'Sacred Delivery',
            desc: !loading ? getContent('trust_3_desc', 'Respectfully Shipped') : 'Respectfully Shipped'
        },
        {
            icon: <ShieldCheck size={28} />,
            title: !loading ? getContent('trust_4_title', 'Trusted Devotion') : 'Trusted Devotion',
            desc: !loading ? getContent('trust_4_desc', 'Serving 50k+ Seekers') : 'Serving 50k+ Seekers'
        }
    ];

    return (
        <section className="bg-transparent border-b border-transparent relative z-20 -mt-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-8 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-8">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group cursor-default">
                            <div className="mb-4 bg-primary/10 p-4 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 ease-out shadow-sm">
                                {benefit.icon}
                            </div>
                            <h3 className="text-foreground font-serif font-medium text-lg mb-1">{benefit.title}</h3>
                            <p className="text-muted-foreground text-xs tracking-wide uppercase">{benefit.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
