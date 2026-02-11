'use client';

import Slider from 'react-slick';
import Image from 'next/image';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function BannerSlider({ banners }) {
    if (!banners || banners.length === 0) return null;

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: false,
        adaptiveHeight: true,
        dotsClass: "slick-dots !bottom-4",
        customPaging: i => (
            <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors" />
        )
    };

    return (
        <div className="banner-slider-wrapper rounded-2xl overflow-hidden relative transform-gpu isolate shadow-xl border border-primary/20 bg-background leading-none">
            <style jsx global>{`
                .banner-slider-wrapper .slick-slider,
                .banner-slider-wrapper .slick-list,
                .banner-slider-wrapper .slick-track {
                    margin-bottom: 0 !important;
                    padding-bottom: 0 !important;
                }
                .banner-slider-wrapper .slick-slide > div {
                    display: block !important;
                    line-height: 0 !important;
                    font-size: 0 !important;
                }
                .banner-slider-wrapper .slick-slide img {
                    display: block !important;
                    width: 100% !important;
                }
            `}</style>
            <Slider {...settings} className="!mb-0">
                {banners.map((banner) => (
                    <div key={banner._id} className="relative w-full outline-none">
                        <img
                            src={banner.image}
                            alt={banner.title || 'Banner'}
                            className="w-full h-auto md:h-[350px] lg:h-[450px] md:object-cover md:object-top block bg-muted"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                        {/* Content */}
                        {(banner.title || banner.description) && (
                            <div className="absolute bottom-0 left-0 w-full p-4 md:p-10 text-white z-10 flex flex-col justify-end h-full pointer-events-none">
                                {banner.title && (
                                    <h3 className="text-lg md:text-3xl font-serif font-bold mb-1 md:mb-2 drop-shadow-md line-clamp-1 leading-tight">
                                        {banner.title}
                                    </h3>
                                )}
                                {banner.description && (
                                    <p className="text-[10px] md:text-sm max-w-lg opacity-90 drop-shadow-sm line-clamp-2 leading-relaxed">
                                        {banner.description}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </Slider>
        </div>
    );
}
