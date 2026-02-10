'use client';

import Slider from 'react-slick';
import Image from 'next/image';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function BannerSlider({ banners }) {
    if (!banners || banners.length === 0) return null;

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: false,
        dotsClass: "slick-dots !bottom-4",
        customPaging: i => (
            <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors" />
        )
    };

    return (
        <div className="rounded-3xl overflow-hidden relative">
            <Slider {...settings} className="!mb-0">
                {banners.map((banner) => (
                    <div key={banner._id} className="relative w-full bg-black/5 outline-none">
                        <div className="relative w-full">
                            <img
                                src={banner.image}
                                alt={banner.title || 'Banner'}
                                className="w-full h-[180px] md:h-[350px] object-cover block bg-muted"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                            {/* Content */}
                            {(banner.title || banner.description) && (
                                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white z-10">
                                    {banner.title && (
                                        <h3 className="text-xl md:text-3xl font-serif font-bold mb-2 drop-shadow-md">
                                            {banner.title}
                                        </h3>
                                    )}
                                    {banner.description && (
                                        <p className="text-xs md:text-sm max-w-lg opacity-90 drop-shadow-sm">
                                            {banner.description}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}
